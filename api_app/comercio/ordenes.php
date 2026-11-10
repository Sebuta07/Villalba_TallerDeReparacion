<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../conexion.php';
if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }

try {
    // Solo traemos las que están en estado pendiente o en proceso (excluimos finalizadas/canceladas)
    $sql = "SELECT 
                ro.reparacion_orden_id,
                ro.diagnostico_cliente,
                ro.total AS presupuesto,
                ro.estados_or_id,
                u.usuario_id,
                u.nombre AS cliente_nombre,
                u.apellido AS cliente_apellido,
                u.dni_cuit,
                e.equipo_id,
                e.numero_serie,
                me.marcas_equipos AS marca,
                moe.modelo_equipos AS modelo,
                eo.nombre AS estado_or,
                t.nombre AS tecnico_nombre,
                t.apellido AS tecnico_apellido
            FROM reparacion_orden ro
            INNER JOIN usuarios u ON ro.usuario_id = u.usuario_id
            INNER JOIN equipos e ON ro.equipo_id = e.equipo_id
            LEFT JOIN marcas_equipos me ON e.marca_equipo_id = me.marca_equipo_id
            LEFT JOIN modelo_equipos moe ON e.modelo_equipo_id = moe.modelo_equipo_id
            LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
            LEFT JOIN usuarios t ON ro.tecnico_id = t.usuario_id
            WHERE LOWER(eo.nombre) LIKE '%pendiente%' OR LOWER(eo.nombre) LIKE '%proceso%'
            ORDER BY ro.reparacion_orden_id DESC";

    $stmt = $conexion->query($sql);
    echo json_encode(["success" => true, "ordenes" => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>