<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../conexion.php';

$usuario_id = $_GET['usuario_id'] ?? 3;

try {
    // Obtener las ventas del usuario
    $stmt = $conexion->prepare("SELECT venta_id, fecha_venta, total, envio_id FROM venta WHERE usuario_id = ? ORDER BY fecha_venta DESC");
    $stmt->execute([$usuario_id]);
    $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Obtener los productos de cada venta
    foreach ($ventas as &$venta) {
        $stmtDet = $conexion->prepare("
            SELECT dv.cantidad, dv.subtotal, p.nombre as producto_nombre, p.precio_venta, p.imagen 
            FROM detalle_venta dv 
            INNER JOIN productos p ON dv.producto_id = p.productos_id 
            WHERE dv.venta_id = ?
        ");
        $stmtDet->execute([$venta['venta_id']]);
        $venta['productos'] = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

        // Generar el código de comprobante visual
        $venta['codigo_comprobante'] = 'CMP-' . str_pad($venta['venta_id'], 6, '0', STR_PAD_LEFT);
    }

    echo json_encode([
        "estado" => "success",
        "ventas" => $ventas ?: []
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "estado" => "error",
        "mensaje" => "Error al obtener historial: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>