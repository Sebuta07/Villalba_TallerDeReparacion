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
    $user = 'root';$pass = '';

    $conexion = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);$conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $empleado_id = isset($_GET['empleado_id']) ? intval($_GET['empleado_id']) : 1;

    // 1. Productos entregados (Suma de Reparaciones entregadas por cadete + Ventas Tienda enviadas)
    $sqlEntregadosRep = "SELECT COUNT(*) FROM reparacion WHERE (metodo_envio LIKE '%Paquetería%' OR metodo_envio LIKE '%Cadete%') AND (estado_envio LIKE '%Entregado%' OR estado_envio LIKE '%Finalizado%')";
    $entregadosRep = intval($conexion->query($sqlEntregadosRep)->fetchColumn());

    $sqlEntregadosVentas = "SELECT COUNT(*) FROM compras_tienda WHERE (metodo_envio LIKE '%Paquetería%' OR metodo_envio LIKE '%Cadete%') AND estado_envio LIKE '%Entregado%'";
    $entregadosVentas = intval($conexion->query($sqlEntregadosVentas)->fetchColumn());$totalEntregados = $entregadosRep +$entregadosVentas;

    // 2. Retiros a Domicilio realizados (Equipos que se fueron a buscar a la casa del cliente)
    $sqlRetiros = "SELECT COUNT(*) FROM reparacion WHERE metodo_envio LIKE '%Retiro%Cadete%' OR metodo_envio LIKE '%Retiro%Paquetería%' OR metodo_envio LIKE '%Retiro a Domicilio%'";
    $totalRetiros = intval($conexion->query($sqlRetiros)->fetchColumn());

    // 3. Pedidos de stock verificados (Movimiento de repuestos entre sucursales)
    $sqlStock = "SELECT COUNT(*) FROM pedidos_sucursales WHERE estado_pedido LIKE '%Verificado%' OR estado_pedido LIKE '%Entregado%'";
    $stockVerificado = intval($conexion->query($sqlStock)->fetchColumn());

    // 4. Últimos movimientos logísticos (Para rellenar la parte inferior del panel)
    $sqlMovimientos = "
        SELECT 
            detalle_envios_sucursal_id AS id,
            observaciones AS detalle,
            fecha_hora_pedido AS fecha,
            calle,
            barrio
        FROM detalle_envios_sucursal
        WHERE observaciones IS NOT NULL
        ORDER BY fecha_hora_pedido DESC
        LIMIT 15
    ";
    $movimientos = $conexion->query($sqlMovimientos)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "metricas" => [
            "entregados" => $totalEntregados,
            "retiros" => $totalRetiros,
            "stock_verificado" => $stockVerificado
        ],
        "movimientos" => $movimientos ?: []
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "error" => "Error de BD: " . $e->getMessage()
    ]);
}
?>