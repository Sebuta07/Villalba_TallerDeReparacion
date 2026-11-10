<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../conexion.php';

$usuario_id = $_GET['usuario_id'] ?? 3;

try {
    $notificaciones = [];

    // 1. Obtener compras recientes como notificaciones
    $stmtVentas = $conexion->prepare("SELECT venta_id, fecha_venta, total FROM venta WHERE usuario_id = ? ORDER BY fecha_venta DESC LIMIT 5");
    $stmtVentas->execute([$usuario_id]);
    $ventas = $stmtVentas->fetchAll(PDO::FETCH_ASSOC);

    foreach ($ventas as $v) {
        $codigo = 'CMP-' . str_pad($v['venta_id'], 6, '0', STR_PAD_LEFT);
        $notificaciones[] = [
            "id" => "venta_" . $v['venta_id'],
            "tipo" => "compra",
            "titulo" => "¡Compra Registrada!",
            "mensaje" => "Tu pedido {$codigo} por $" . number_format($v['total'], 2, ',', '.') . " fue procesado con éxito.",
            "fecha" => $v['fecha_venta']
        ];
    }

    // 2. Obtener reparaciones / notas de reparación recientes
    $stmtRep = $conexion->prepare("SELECT nota_reparacion_id, fecha_ingreso, descripcion_problema FROM notas_reparacion WHERE usuario_id = ? ORDER BY fecha_ingreso DESC LIMIT 5");
    $stmtRep->execute([$usuario_id]);
    $reparaciones = $stmtRep->fetchAll(PDO::FETCH_ASSOC);

    foreach ($reparaciones as $r) {
        $notificaciones[] = [
            "id" => "rep_" . $r['nota_reparacion_id'],
            "tipo" => "reparacion",
            "titulo" => "Actualización de Taller",
            "mensaje" => "Dispositivo en revisión: " . substr($r['descripcion_problema'], 0, 45) . "...",
            "fecha" => $r['fecha_ingreso']
        ];
    }

    // Ordenar todas las notificaciones por fecha descendente
    usort($notificaciones, function($a, $b) {
        return strtotime($b['fecha']) - strtotime($a['fecha']);
    });

    echo json_encode([
        "estado" => "success",
        "notificaciones" => $notificaciones ?: []
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "estado" => "error",
        "mensaje" => "Error al obtener notificaciones: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>