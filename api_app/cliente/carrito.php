<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = $_POST['usuario_id'] ?? 3;
    $items_json = $_POST['items'] ?? '[]';
    $items = json_decode($items_json, true);
    $forma_pago_id = $_POST['forma_pago_id'] ?? 2;
    $tipo_entrega = $_POST['tipo_entrega'] ?? 'sucursal';
    
    $calle = $_POST['calle'] ?? '';
    $numero = $_POST['numero'] ?? '';
    $barrio = $_POST['barrio'] ?? '';
    $observaciones = $_POST['observaciones'] ?? '';

    if (empty($items)) {
        echo json_encode(["success" => false, "error" => "El carrito está vacío"]);
        exit;
    }

    try {
        $conexion->beginTransaction();

        $total = 0;
        foreach ($items as $item) {
            $total += (float)$item['precio'] * (int)$item['cantidad'];
        }

        $envio_id = null;
        if ($tipo_entrega === 'envio') {
            $stmtDir = $conexion->prepare("INSERT INTO direccion (provincia_id, ciudad_id, calle, numero, barrio, observaciones, estado_general_id, pais_id) VALUES (4, 1, ?, ?, ?, ?, 1, 1)");
            $stmtDir->execute([$calle, $numero, $barrio, $observaciones]);

            $stmtEnv = $conexion->prepare("INSERT INTO envios (fecha_inicio, precio, estado_general_id, usuario_id) VALUES (NOW(), 0, 1, ?)");
            $stmtEnv->execute([$usuario_id]);
            $envio_id = $conexion->lastInsertId();
        }

        // 1. Registrar Venta
        $stmtVenta = $conexion->prepare("INSERT INTO venta (usuario_id, total, envio_id, empleado_id, estado_general_id, fecha_venta) VALUES (?, ?, ?, NULL, 1, NOW())");
        $stmtVenta->execute([$usuario_id, $total, $envio_id]);
        $venta_id = $conexion->lastInsertId();

        // 2. Registrar Detalles y actualizar stock
        foreach ($items as $item) {
            $producto_id = $item['id'];
            $cantidad = (int)$item['cantidad'];
            $subtotal = (float)$item['precio'] * $cantidad;

            $stmtDet = $conexion->prepare("INSERT INTO detalle_venta (venta_id, producto_id, cantidad, subtotal, forma_pago_id, estado_general_id) VALUES (?, ?, ?, ?, ?, 1)");
            $stmtDet->execute([$venta_id, $producto_id, $cantidad, $subtotal, $forma_pago_id]);

            $stmtStock = $conexion->prepare("UPDATE productos SET stock_disponible = stock_disponible - ? WHERE productos_id = ?");
            $stmtStock->execute([$cantidad, $producto_id]);
        }

        $codigo_comprobante = 'CMP-' . str_pad($venta_id, 6, '0', STR_PAD_LEFT);

        $conexion->commit();
        echo json_encode([
            "success" => true,
            "venta_id" => $venta_id,
            "total" => $total,
            "codigo_comprobante" => $codigo_comprobante,
            "tipo_entrega" => $tipo_entrega
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>