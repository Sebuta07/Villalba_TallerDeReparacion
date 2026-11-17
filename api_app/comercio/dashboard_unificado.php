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
    // 1. Órdenes de reparación con su estado y presupuesto
    $sqlOrdenes = "
        SELECT 
            ro.reparacion_orden_id,
            ro.diagnostico_cliente,
            ro.presupuesto_monto,
            ro.total,
            eo.nombre AS estado_nombre
        FROM reparacion_orden ro
        LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
        WHERE ro.estado_general_id = 1
        ORDER BY ro.reparacion_orden_id DESC
        LIMIT 20
    ";
    $ordenes = $conexion->query($sqlOrdenes)->fetchAll(PDO::FETCH_ASSOC);

    // 2. Control de Inventario
    $sqlInv = "
        SELECT productos_id, nombre, stock_disponible, precio_venta
        FROM productos
        WHERE estado_general_id = 1
        ORDER BY vendidos DESC
        LIMIT 30
    ";
    $inventario = $conexion->query($sqlInv)->fetchAll(PDO::FETCH_ASSOC);

    // 3. Historial de Reposición de Productos (Pedidos a sucursales)
    $sqlRep = "
        SELECT pedidos_sucursales_id, producto_nombre, cantidad_solicitada, estado_pedido, fecha_pedido, hora_pedido
        FROM pedidos_sucursales
        WHERE estado_general_id = 1
        ORDER BY pedidos_sucursales_id DESC
        LIMIT 20
    ";
    $reposiciones = $conexion->query($sqlRep)->fetchAll(PDO::FETCH_ASSOC);

    // 4. Lista de ventas / compras en tienda
    $sqlVentas = "
        SELECT id_compra AS venta_id, codigo_compra, resumen_productos, total_final AS total, fecha_compra
        FROM compras_tienda
        ORDER BY id_compra DESC
        LIMIT 30
    ";
    $ventas = $conexion->query($sqlVentas)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "ordenes" => $ordenes,
        "inventario" => $inventario,
        "reposiciones" => $reposiciones,
        "ventas" => $ventas
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>