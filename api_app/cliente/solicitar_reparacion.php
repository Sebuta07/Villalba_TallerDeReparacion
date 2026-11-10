<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../conexion.php';

// GET: Devuelve categorías, marcas, modelos y datos del servicio
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $categorias = $conexion->query("SELECT categoria_id as id, nombre FROM categorias_equipo WHERE estado_general_id = 1")->fetchAll(PDO::FETCH_ASSOC);
        $marcas = $conexion->query("SELECT marca_equipo_id as id, marcas_equipos as nombre FROM marcas_equipos WHERE estado_general_id = 1")->fetchAll(PDO::FETCH_ASSOC);
        $modelos = $conexion->query("SELECT modelo_equipo_id as id, modelo_equipos as nombre FROM modelo_equipos WHERE estado_general_id = 1")->fetchAll(PDO::FETCH_ASSOC);
        
        $servicio_id = $_GET['servicio_id'] ?? 3;
        $stmtServ = $conexion->prepare("SELECT servicios_id as id, nombre, costo FROM servicios WHERE servicios_id = ?");
        $stmtServ->execute([$servicio_id]);
        $servicio = $stmtServ->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "categorias" => $categorias,
            "marcas" => $marcas,
            "modelos" => $modelos,
            "servicio" => $servicio
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

// POST: Procesa la orden de reparación con estado PENDIENTE (estados_or_id = 1)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = $_POST['usuario_id'] ?? null;
    $servicio_id = $_POST['servicio_id'] ?? 3;
    $diagnostico_cliente = $_POST['diagnostico_cliente'] ?? '';
    $tipo_entrega = $_POST['tipo_entrega'] ?? 'sucursal';
    $categoria_equipo_id = $_POST['categoria_equipo_id'] ?? 1;
    $marca_equipo_id = $_POST['marca_equipo_id'] ?? 1;
    $modelo_equipo_id = $_POST['modelo_equipo_id'] ?? 1;
    $numero_serie = $_POST['numero_serie'] ?? null;
    $imei = $_POST['imei'] ?? null;

    if (!$usuario_id) {
        echo json_encode(["success" => false, "error" => "No se recibió el ID de usuario válido"]);
        exit;
    }

    try {
        $stmtServ = $conexion->prepare("SELECT costo FROM servicios WHERE servicios_id = ?");
        $stmtServ->execute([$servicio_id]);
        $servData = $stmtServ->fetch(PDO::FETCH_ASSOC);
        $total = $servData ? $servData['costo'] : 50000.00;

        $imagenNombre = null;
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['imagen']['tmp_name'];
            $fileName = $_FILES['imagen']['name'];
            $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            if (in_array($fileExtension, ['jpg', 'jpeg', 'png', 'webp'])) {
                $uploadFileDir = __DIR__ . '/../uploads/orden/';
                if (!is_dir($uploadFileDir)) { mkdir($uploadFileDir, 0755, true); }
                $imagenNombre = 'orden_' . time() . '_' . rand(1000, 9999) . '.' . $fileExtension;
                move_uploaded_file($fileTmpPath, $uploadFileDir . $imagenNombre);
            }
        }

        $conexion->beginTransaction();

        // 1. Registrar equipo
        $stmtEq = $conexion->prepare("INSERT INTO equipos (marca_equipo_id, categoria_equipo_id, modelo_equipo_id, numero_serie, imei, estado_general_id) VALUES (?, ?, ?, ?, ?, 1)");
        $stmtEq->execute([$marca_equipo_id, $categoria_equipo_id, $modelo_equipo_id, $numero_serie, $imei]);
        $equipo_id = $conexion->lastInsertId();

        // 2. Registrar orden de reparación asignando el usuario_id correcto y NULL en empleado/técnico
        $codigo_seguridad = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $estados_or_id = 1; // 1 = Pendiente

        $stmtOrd = $conexion->prepare("INSERT INTO reparacion_orden 
            (equipo_id, usuario_id, empleado_id, tecnico_id, servicios_id, diagnostico_cliente, estados_or_id, estado_general_id, formas_pago_id, total, tipo_entrega, pagado, codigo_seguridad, imagen) 
            VALUES (?, ?, NULL, NULL, ?, ?, ?, 1, 2, ?, ?, 0, ?, ?)");
        
        $stmtOrd->execute([
            $equipo_id,
            $usuario_id,
            $servicio_id,
            $diagnostico_cliente,
            $estados_or_id,
            $total,
            $tipo_entrega,
            $codigo_seguridad,
            $imagenNombre
        ]);
        $reparacion_orden_id = $conexion->lastInsertId();

        // 3. Registrar en envíos de sucursal si corresponde
        if ($tipo_entrega === 'envio') {
            $stmtEnv = $conexion->prepare("INSERT INTO envios_sucursal (usuario_id, fecha_pedido, estado_general_id) VALUES (?, NOW(), 1)");
            $stmtEnv->execute([$usuario_id]);
            $envios_sucursal_id = $conexion->lastInsertId();

            $stmtDetEnv = $conexion->prepare("INSERT INTO detalle_envios_sucursal (envios_sucursal_id, productos_id, cantidad, observaciones, estado_general_id) VALUES (?, 1, 1, ?, 1)");
            $stmtDetEnv->execute([$envios_sucursal_id, "Envío de equipo - Orden #" . $reparacion_orden_id]);
        }

        $conexion->commit();
        echo json_encode(["success" => true, "codigo_seguridad" => $codigo_seguridad]);
    } catch (Exception $ex) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }
        echo json_encode(["success" => false, "error" => $ex->getMessage()]);
    }
}
?>