<?php
if (ob_get_length()) {
    ob_clean();
}

ini_set('display_errors', '0');
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . '/../conexion.php';
    if (!isset($conexion) && isset($pdo)) {
        $conexion = $pdo;
    }
    if (!isset($conexion)) {
        throw new Exception("No se pudo establecer conexión con la base de datos.");
    }

    // 1. Obtener lista de técnicos (rol_id = 3) para el filtro
    $stmtTecnicos = $conexion->query("
        SELECT usuario_id, CONCAT(nombre, ' ', COALESCE(apellido, '')) AS nombre_completo
        FROM usuarios
        WHERE rol_id = 3 AND estado_general_id = 1
        ORDER BY nombre ASC
    ");
    $tecnicos = $stmtTecnicos->fetchAll(PDO::FETCH_ASSOC);

    // 2. Obtener todas las ventas con datos del cliente, detalle e información de técnico
    $sqlVentas = "
        SELECT 
            v.venta_id,
            DATE_FORMAT(v.fecha_venta, '%Y-%m-%d') AS fecha_solo,
            DATE_FORMAT(v.fecha_venta, '%d/%m/%Y %H:%i') AS fecha_formateada,
            v.total,
            v.usuario_id AS cliente_id,
            CONCAT(COALESCE(u_cli.nombre, 'Consumidor'), ' ', COALESCE(u_cli.apellido, 'Final')) AS cliente_nombre,
            COALESCE(u_cli.dni_cuit, 'S/D') AS cliente_dni,
            GROUP_CONCAT(
                DISTINCT COALESCE(p.nombre, s.nombre, dv.observaciones, 'Ítem general')
                SEPARATOR ' + '
            ) AS items_detalle,
            GROUP_CONCAT(DISTINCT fp.forma SEPARATOR ', ') AS forma_pago,
            MAX(ro.tecnico_id) AS tecnico_id,
            MAX(CONCAT(COALESCE(u_tec.nombre, ''), ' ', COALESCE(u_tec.apellido, ''))) AS tecnico_nombre
        FROM venta v
        LEFT JOIN usuarios u_cli ON v.usuario_id = u_cli.usuario_id
        LEFT JOIN detalle_venta dv ON v.venta_id = dv.venta_id
        LEFT JOIN productos p ON dv.producto_id = p.productos_id
        LEFT JOIN servicios s ON dv.servicio_id = s.servicios_id
        LEFT JOIN formas_pago fp ON dv.forma_pago_id = fp.formas_pago_id
        LEFT JOIN reparacion_orden ro ON (
            dv.observaciones LIKE CONCAT('%Orden #', ro.reparacion_orden_id, '%')
            OR dv.observaciones LIKE CONCAT('%orden #', ro.reparacion_orden_id, '%')
            OR dv.observaciones LIKE CONCAT('%N° ', ro.reparacion_orden_id, '%')
        )
        LEFT JOIN usuarios u_tec ON ro.tecnico_id = u_tec.usuario_id
        WHERE v.estado_general_id = 1
        GROUP BY v.venta_id
        ORDER BY v.fecha_venta DESC, v.venta_id DESC
    ";

    $stmtVentas = $conexion->query($sqlVentas);
    $ventas = $stmtVentas->fetchAll(PDO::FETCH_ASSOC);

    foreach ($ventas as &$venta) {
        $venta['tecnico_nombre'] = trim($venta['tecnico_nombre'] ?? '');
        if ($venta['tecnico_nombre'] === '') {
            $venta['tecnico_nombre'] = null;
        }
    }

    echo json_encode([
        "success" => true,
        "ventas" => $ventas ?: [],
        "tecnicos" => $tecnicos ?: []
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener ventas: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>