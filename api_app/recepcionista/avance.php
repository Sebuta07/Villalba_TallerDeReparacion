<?php
require_once '../conexion.php'; 

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Capturar los parámetros enviados por GET
$usuario_id = isset($_GET['usuario_id']) ? trim($_GET['usuario_id']) : '';
$fecha = isset($_GET['fecha']) ? trim($_GET['fecha']) : '';

// Consulta SQL corregida usando la tabla `usuarios` tanto para clientes como para empleados
$sql = "SELECT 
            ro.reparacion_orden_id,
            ro.equipo_id,
            ro.diagnostico_cliente,
            ro.fecha_registro,
            ro.total,
            u_cliente.nombre AS nombre_usuario,
            u_empleado.nombre AS nombre_empleado,
            s.nombre AS nombre_servicio,
            eo.nombre AS estado_orden,
            fp.forma AS forma_pago
        FROM reparacion_orden ro
        LEFT JOIN usuarios u_cliente ON ro.usuario_id = u_cliente.usuario_id
        LEFT JOIN usuarios u_empleado ON ro.empleado_id = u_empleado.usuario_id
        LEFT JOIN servicios s ON ro.servicios_id = s.servicios_id
        LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
        LEFT JOIN formas_pago fp ON ro.formas_pago_id = fp.formas_pago_id
        WHERE 1=1";

$params = [];

if ($usuario_id !== '') {
    $sql .= " AND ro.usuario_id = ?";
    $params[] = $usuario_id;
}

if ($fecha !== '') {
    $sql .= " AND DATE(ro.fecha_registro) = ?";
    $params[] = $fecha;
}

$sql .= " ORDER BY ro.fecha_registro DESC";

try {
    $stmt = $conexion->prepare($sql);
    $stmt->execute($params);
    $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($ordenes);

} catch (PDOException $e) {
    echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
}
?>