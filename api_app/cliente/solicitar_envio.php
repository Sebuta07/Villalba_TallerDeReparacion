<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = $_POST['usuario_id'] ?? 3;
    $tipo_servicio = $_POST['tipo_servicio'] ?? 'retiro'; // 'retiro' (buscar PC/celular) o 'entrega' (devolver reparado)
    $nota_reparacion_id = $_POST['nota_reparacion_id'] ?? null;
    $calle = $_POST['calle'] ?? '';
    $numero = $_POST['numero'] ?? '';
    $barrio = $_POST['barrio'] ?? '';
    $observaciones = $_POST['observaciones'] ?? '';

    if (empty($calle) || empty($barrio)) {
        echo json_encode(["success" => false, "error" => "La calle y el barrio son obligatorios"]);
        exit;
    }

    try {
        $conexion->beginTransaction();

        // 1. Registrar la dirección del cliente en la tabla direccion
        $stmtDir = $conexion->prepare("INSERT INTO direccion (provincia_id, ciudad_id, calle, numero, barrio, observaciones, estado_general_id, pais_id) VALUES (4, 1, ?, ?, ?, ?, 1, 1)");
        $stmtDir->execute([$calle, $numero, $barrio, "[$tipo_servicio] " . $observaciones]);
        $direccion_id = $conexion->lastInsertId();

        // 2. Registrar el envío en la tabla envios
        $stmtEnv = $conexion->prepare("INSERT INTO envios (fecha_inicio, precio, estado_general_id, usuario_id) VALUES (NOW(), 0, 1, ?)");
        $stmtEnv->execute([$usuario_id]);
        $envio_id = $conexion->lastInsertId();

        $conexion->commit();
        echo json_encode([
            "success" => true,
            "envio_id" => $envio_id,
            "mensaje" => $tipo_servicio === 'retiro' 
                ? "Solicitud de retiro registrada. Un cadete pasará a buscar tu equipo." 
                : "Solicitud de envío a domicilio registrada. Te devolveremos tu equipo reparado."
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>