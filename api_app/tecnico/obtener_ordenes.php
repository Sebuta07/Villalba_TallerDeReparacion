<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../conexion.php';
if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }

try {
    $sql = "SELECT 
                ro.reparacion_orden_id,
                ro.diagnostico_cliente,
                ro.total AS presupuesto,
                u.usuario_id,
                u.nombre AS cliente_nombre,
                u.apellido AS cliente_apellido,
                e.equipo_id,
                e.numero_serie,
                e.imei,
                me.marcas_equipos AS marca_nombre,
                moe.modelo_equipos AS modelo_nombre,
                eo.nombre AS estado_nombre
            FROM reparacion_orden ro
            INNER JOIN usuarios u ON ro.usuario_id = u.usuario_id
            INNER JOIN equipos e ON ro.equipo_id = e.equipo_id
            LEFT JOIN marcas_equipos me ON e.marca_equipo_id = me.marca_equipo_id
            LEFT JOIN modelo_equipos moe ON e.modelo_equipo_id = moe.modelo_equipo_id
            LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
            ORDER BY ro.reparacion_orden_id DESC";
            
    $stmt = $conexion->query($sql);
    $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "ordenes" => $ordenes], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error al consultar órdenes: " . $e->getMessage()]);
}
?>