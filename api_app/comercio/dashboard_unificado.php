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

try {
    $host = '127.0.0.1';
    $db = 'taller_electronica';
    $user = 'root'; 
    $pass = '';

    $conexion = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $comercio_id = isset($_GET['comercio_id']) ? intval($_GET['comercio_id']) : 1;

    // 1. Productos con stock más bajo (alerta de stock, limit 6)
    $sqlLowStock = "
        SELECT 
            productos_id,
            nombre,
            stock_disponible,
            stock_minimo
        FROM productos
        ORDER BY stock_disponible ASC
        LIMIT 6
    ";
    $productosLowStock = $conexion->query($sqlLowStock)->fetchAll(PDO::FETCH_ASSOC);
    
    // 2. Top productos más pedidos en detalle_pedido_sucursal
    $sqlTopPedidos = "
        SELECT 
            p.nombre,
            SUM(dps.stock) AS total_pedido
        FROM detalle_pedido_sucursal dps
        INNER JOIN productos p ON dps.productos_id = p.productos_id
        WHERE dps.estado_general_id = 1
        GROUP BY dps.productos_id
        ORDER BY total_pedido DESC
        LIMIT 5
    ";
    $topPedidos = $conexion->query($sqlTopPedidos)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "productos_low_stock" => $productosLowStock ?: [],
        "top_pedidos" => $topPedidos ?: []
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "error" => "Error de base de datos: " . $e->getMessage()
    ]);
}
?>