<?php
ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../conexion.php';
if (!isset($conexion) && isset($pdo)) {
    $conexion = $pdo;
}

if (!isset($conexion)) {
    echo json_encode(["success" => false, "error" => "No se pudo conectar a la base de datos"]);
    exit;
}

try {
    // 1. Total reparaciones
    $stmtRep = $conexion->query("SELECT SUM(total) AS total FROM reparacion_orden WHERE estado_general_id = 1");
    $totalReparaciones = floatval($stmtRep->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

    // 2. Total productos
    $stmtProd = $conexion->query("SELECT SUM(subtotal) AS total FROM detalle_venta WHERE estado_general_id = 1");
    $totalProductos = floatval($stmtProd->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

    // 3. Contadores adicionales
    $totalClientes = $conexion->query("SELECT COUNT(*) FROM usuarios WHERE rol_id = 4")->fetchColumn();
    $totalOrdenes = $conexion->query("SELECT COUNT(*) FROM reparacion_orden")->fetchColumn();
    $totalInventario = $conexion->query("SELECT COUNT(*) FROM productos WHERE estado_general_id = 1")->fetchColumn();

    // 4. Top productos más vendidos para el gráfico en escalera
    $sqlTopProd = "
        SELECT p.nombre, SUM(dv.subtotal) AS total, SUM(dv.cantidad) AS cantidad
        FROM detalle_venta dv
        INNER JOIN productos p ON dv.producto_id = p.productos_id
        WHERE dv.estado_general_id = 1
        GROUP BY dv.producto_id
        ORDER BY total DESC
        LIMIT 4
    ";
    $topProductos = $conexion->query($sqlTopProd)->fetchAll(PDO::FETCH_ASSOC);

    // 5. Top servicios de taller más solicitados
    $sqlTopServ = "
        SELECT s.nombre, SUM(ro.total) AS total
        FROM reparacion_orden ro
        INNER JOIN servicios s ON ro.servicios_id = s.servicios_id
        WHERE ro.estado_general_id = 1
        GROUP BY ro.servicios_id
        ORDER BY total DESC
        LIMIT 3
    ";
    $topServicios = $conexion->query($sqlTopServ)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "estadisticas" => [
            "total_reparaciones" => $totalReparaciones,
            "total_productos" => $totalProductos,
            "facturacion_global" => $totalReparaciones + $totalProductos,
            "clientes" => intval($totalClientes),
            "ordenes" => intval($totalOrdenes),
            "productos_stock" => intval($totalInventario),
            "top_productos" => $topProductos,
            "top_servicios" => $topServicios
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>