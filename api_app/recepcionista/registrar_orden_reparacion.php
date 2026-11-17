<?php
if (ob_get_length()) {
    ob_clean();
}

ini_set('display_errors', '0');
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once("../conexion.php");
    if (!isset($conexion) && isset($pdo)) { 
        $conexion = $pdo; 
    }

    if (!isset($conexion)) {
        throw new Exception("No se pudo establecer la conexión con la base de datos.");
    }

    $method = $_SERVER['REQUEST_METHOD'];

    // ==========================================
    // MÉTODO GET: DEVOLVER CATÁLOGOS / SERVICIOS
    // ==========================================
    if ($method === 'GET') {
        $usuarios = $conexion->query("SELECT usuario_id, nombre, apellido, dni_cuit, email FROM usuarios ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);
        $categorias = $conexion->query("SELECT categoria_id AS id, nombre FROM categorias_equipo WHERE estado_general_id = 1 ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);
        $marcas = $conexion->query("SELECT marca_equipo_id AS id, marcas_equipos AS nombre FROM marcas_equipos WHERE estado_general_id = 1 ORDER BY marcas_equipos ASC")->fetchAll(PDO::FETCH_ASSOC);
        $modelos = $conexion->query("SELECT modelo_equipo_id AS id, modelo_equipos AS nombre FROM modelo_equipos WHERE estado_general_id = 1 ORDER BY modelo_equipos ASC")->fetchAll(PDO::FETCH_ASSOC);
        $formas_pago = $conexion->query("SELECT formas_pago_id, forma AS nombre FROM formas_pago WHERE estado_general_id = 1 ORDER BY forma ASC")->fetchAll(PDO::FETCH_ASSOC);
        
        $servicio_id = $_GET['servicio_id'] ?? 3;
        $stmtServ = $conexion->prepare("SELECT servicios_id AS id, nombre, costo FROM servicios WHERE servicios_id = ?");
        $stmtServ->execute([$servicio_id]);
        $servicio = $stmtServ->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "usuarios" => $usuarios ?: [],
            "categorias" => $categorias ?: [],
            "marcas" => $marcas ?: [],
            "modelos" => $modelos ?: [],
            "formas_pago" => $formas_pago ?: [],
            "servicio" => $servicio ?: null
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // ==========================================
    // MÉTODO POST: CREAR ORDEN DE REPARACIÓN
    // ==========================================
    if ($method === 'POST') {
        $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
        $data = [];

        if (strpos($contentType, "application/json") !== false) {
            $data = json_decode(file_get_contents("php://input"), true) ?? [];
        } else {
            $data = $_POST;
        }

        // Actualización de técnico mediante JSON
        if (isset($data['reparacion_orden_id']) && isset($data['tecnico_id']) && count($data) <= 2) {
            $sql = "UPDATE reparacion_orden SET tecnico_id = :tecnico_id WHERE reparacion_orden_id = :reparacion_orden_id";
            $stmt = $conexion->prepare($sql);
            $stmt->execute([
                ':tecnico_id' => $data['tecnico_id'], 
                ':reparacion_orden_id' => $data['reparacion_orden_id']
            ]);
            echo json_encode(["success" => true, "message" => "Asignado correctamente"]);
            exit();
        }

        $usuario_id = $data['usuario_id'] ?? null;
        if (!$usuario_id) {
            throw new Exception("No se recibió un ID de usuario válido.");
        }

        $empleado_id = !empty($data['empleado_id']) ? $data['empleado_id'] : null;
        $servicio_id = $data['servicios_id'] ?? $data['servicio_id'] ?? 3;
        $diagnostico_cliente = $data['diagnostico_cliente'] ?? '';
        $tipo_entrega = $data['tipo_entrega'] ?? 'sucursal'; // 'sucursal' o 'envio'
        $categoria_equipo_id = $data['categoria_equipo_id'] ?? 1;
        $marca_equipo_id = $data['marca_equipo_id'] ?? 1;
        $modelo_equipo_id = $data['modelo_equipo_id'] ?? 1;
        $numero_serie = !empty($data['numero_serie']) ? $data['numero_serie'] : null;
        $imei = !empty($data['imei']) ? $data['imei'] : null;

        // Datos de envío a domicilio
        $calle = trim($data['calle'] ?? '');
        $manzana = trim($data['manzana'] ?? '');
        $casa = trim($data['casa'] ?? '');
        $barrio = trim($data['barrio'] ?? '');

        // Obtener costo estimado del servicio seleccionado
        $stmtServ = $conexion->prepare("SELECT costo FROM servicios WHERE servicios_id = ?");
        $stmtServ->execute([$servicio_id]);
        $servData = $stmtServ->fetch(PDO::FETCH_ASSOC);
        $total = $servData && isset($servData['costo']) ? $servData['costo'] : 50000.00;

        // Manejo de imagen del equipo
        $imagenNombre = null;
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['imagen']['tmp_name'];
            $fileName = $_FILES['imagen']['name'];
            $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            if (in_array($fileExtension, ['jpg', 'jpeg', 'png', 'webp'])) {
                $uploadFileDir = __DIR__ . '/../uploads/orden/';
                if (!is_dir($uploadFileDir)) { 
                    mkdir($uploadFileDir, 0755, true); 
                }
                $imagenNombre = 'orden_' . time() . '_' . rand(1000, 9999) . '.' . $fileExtension;
                move_uploaded_file($fileTmpPath, $uploadFileDir . $imagenNombre);
            }
        }

        $conexion->beginTransaction();

        // 1. Registrar el equipo en la tabla `equipos`
        $stmtEq = $conexion->prepare("INSERT INTO equipos (marca_equipo_id, categoria_equipo_id, modelo_equipo_id, numero_serie, imei, estado_general_id) VALUES (?, ?, ?, ?, ?, 1)");
        $stmtEq->execute([$marca_equipo_id, $categoria_equipo_id, $modelo_equipo_id, $numero_serie, $imei]);
        $equipo_id = $conexion->lastInsertId();

        // 2. Registrar la Orden de Reparación
        $codigo_seguridad = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $estados_or_id = 1; 

        $sqlOrd = "INSERT INTO reparacion_orden 
            (equipo_id, usuario_id, empleado_id, tecnico_id, servicios_id, diagnostico_cliente, estados_or_id, estado_general_id, formas_pago_id, total, monto_seña, tipo_entrega, pagado, codigo_seguridad, imagen) 
            VALUES (?, ?, ?, NULL, ?, ?, ?, 1, 2, ?, 0.00, ?, 0, ?, ?)";
        
        $stmtOrd = $conexion->prepare($sqlOrd);
        $stmtOrd->execute([
            $equipo_id,
            $usuario_id,
            $empleado_id,
            $servicio_id,
            $diagnostico_cliente,
            $estados_or_id,
            $total,
            $tipo_entrega,
            $codigo_seguridad,
            $imagenNombre
        ]);
        $reparacion_orden_id = $conexion->lastInsertId();

// 3. Registrar directamente en `detalle_envios_sucursal` vinculado a `reparacion_orden_id`
        if ($tipo_entrega === 'envio') {
            $obsExtra = trim($data['observaciones'] ?? '');
            $observacionEnvio = "Envío de equipo - Orden #" . $reparacion_orden_id . ($obsExtra !== '' ? " | " . $obsExtra : "");

            $stmtDetEnv = $conexion->prepare("
                INSERT INTO detalle_envios_sucursal 
                (productos_id, cantidad, observaciones, estado_general_id, calle, manzana, casa, barrio, fecha_hora_pedido, reparacion_orden_id) 
                VALUES (1, 1, ?, 1, ?, ?, ?, ?, NOW(), ?)
            ");
            $stmtDetEnv->execute([
                $observacionEnvio,
                $calle,
                $manzana,
                $casa,
                $barrio,
                $reparacion_orden_id
            ]);
        }
        $conexion->commit();

        echo json_encode([
            "success" => true,
            "codigo_seguridad" => $codigo_seguridad,
            "orden_id" => $reparacion_orden_id,
            "total" => $total,
            "message" => "Orden registrada con éxito. El técnico se comunicará con el diagnóstico."
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

} catch (Exception $e) {
    if (isset($conexion) && $conexion->inTransaction()) { 
        $conexion->rollBack(); 
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
?>