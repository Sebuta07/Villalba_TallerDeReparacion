<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

include_once '../conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $query = "SELECT usuario_id, username, nombre, apellido, dni_cuit, email FROM usuarios WHERE estado_general_id = 1 OR estado_general_id IS NULL";
        $stmt = $conexion->prepare($query);
        $stmt->execute();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "estado" => "success",
            "datos" => $usuarios
        ]);
    } catch (Throwable $e) {
        echo json_encode([
            "estado" => "error",
            "mensaje" => "Error al obtener usuarios: " . $e->getMessage()
        ]);
    }
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        echo json_encode(["estado" => "error", "mensaje" => "No se recibieron datos"]);
        exit;
    }

    $empleado_id = $input['empleado_id'] ?? null;
    $usuario_id = $input['usuario_id'] ?? null;
    $total = $input['total'] ?? 0;
    $estado_general_id = $input['estado_general_id'] ?? 1;
    $pagos = $input['pagos'] ?? [];
    $productos = $input['productos'] ?? [];
    $nuevo_usuario = $input['nuevo_usuario'] ?? null;

    try {
        // Iniciamos transacción
        $conexion->beginTransaction();

        // 1. Si no viene un usuario_id pero sí vienen datos para crear un usuario nuevo
        if ((!$usuario_id || $usuario_id == 0) && $nuevo_usuario) {
            $username = $nuevo_usuario['username'] ?? ('user_' . time());
            $password_hash = password_hash($nuevo_usuario['password'] ?? '123456', PASSWORD_BCRYPT);
            $email = $nuevo_usuario['email'] ?? null;
            $nombre = $nuevo_usuario['nombre'] ?? '';
            $apellido = $nuevo_usuario['apellido'] ?? '';
            $dni_cuit = $nuevo_usuario['dni_cuit'] ?? 0;

            $queryUser = "INSERT INTO usuarios (username, password_hash, email, nombre, apellido, dni_cuit, estado_general_id) 
                          VALUES (:username, :password_hash, :email, :nombre, :apellido, :dni_cuit, 1)";
            $stmtUser = $conexion->prepare($queryUser);
            $stmtUser->execute([
                ':username' => $username,
                ':password_hash' => $password_hash,
                ':email' => $email,
                ':nombre' => $nombre,
                ':apellido' => $apellido,
                ':dni_cuit' => $dni_cuit
            ]);

            $usuario_id = $conexion->lastInsertId();
        }

        // 2. Validamos los datos obligatorios DESPUÉS de intentar crear el usuario (para que $usuario_id ya esté poblado si aplica)
        if (!$empleado_id || !$usuario_id || empty($productos) || empty($pagos)) {
            throw new Exception("Faltan datos obligatorios (empleado, usuario válido, productos o métodos de pago)");
        }

        // 3. Insertar la cabecera en la tabla 'venta'
        $queryVenta = "INSERT INTO venta (fecha_venta, total, empleado_id, usuario_id, estado_general_id) VALUES (NOW(), :total, :empleado_id, :usuario_id, :estado_general_id)";
        $stmtVenta = $conexion->prepare($queryVenta);
        $stmtVenta->execute([
            ':total' => $total,
            ':empleado_id' => $empleado_id,
            ':usuario_id' => $usuario_id,
            ':estado_general_id' => $estado_general_id
        ]);

        $venta_id = $conexion->lastInsertId();

        // 4. Iterar e insertar cada producto en 'detalle_venta'
        $sqlDetalle = "INSERT INTO detalle_venta (forma_pago_id, cantidad, subtotal, venta_id, estado_general_id, observaciones, producto_id) 
                       VALUES (:forma_pago_id, :cantidad, :subtotal, :venta_id, :estado_general_id, :observaciones, :producto_id)";
        $stmtDetalle = $conexion->prepare($sqlDetalle);

        $forma_pago_principal = $pagos[0]['forma_pago_id'] ?? 1;

        foreach ($productos as $prod) {
            $stmtDetalle->execute([
                ':forma_pago_id'     => $forma_pago_principal,
                ':cantidad'          => $prod['cantidad'] ?? 1,
                ':subtotal'          => $prod['subtotal'] ?? 0,
                ':venta_id'          => $venta_id,
                ':estado_general_id' => 1,
                ':observaciones'     => $prod['observaciones'] ?? '',
                ':producto_id'       => $prod['producto_id'] ?? $prod['productos_id'] // Soporta ambos nombres por seguridad
            ]);
        }

        // Confirmar transacción
        $conexion->commit();

        echo json_encode([
            "estado" => "success",
            "mensaje" => "Venta registrada con éxito",
            "venta_id" => $venta_id,
            "usuario_id" => $usuario_id
        ]);

    } catch (Throwable $e) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }
        echo json_encode([
            "estado" => "error",
            "mensaje" => "Error al registrar la venta: " . $e->getMessage()
        ]);
    }
}
?>