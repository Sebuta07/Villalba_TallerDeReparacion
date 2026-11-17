<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../conexion.php';
if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['reparacion_orden_id']) || !isset($data['codigo_ingresado'])) {
    echo json_encode(["success" => false, "message" => "Falta el número de orden o el código de seguridad."]);
    exit();
}

$ordenId = intval($data['reparacion_orden_id']);
$codigo = trim($data['codigo_ingresado']);

try {
    $conexion->beginTransaction();

    // 1. Obtener datos de la orden, estado, montos y dirección del usuario
    $stmt = $conexion->prepare("
        SELECT 
            ro.codigo_seguridad, 
            ro.total, 
            ro.monto_seña,
            ro.pagado,
            ro.estados_or_id,
            ro.tipo_entrega,
            ro.usuario_id, 
            ro.empleado_id, 
            ro.servicios_id, 
            ro.formas_pago_id,
            eo.nombre as estado_orden,
            d.calle, d.numero, d.barrio, d.manzana, d.casa, d.piso_dpto, d.observaciones as obs_direccion,
            c.nombre as ciudad_nombre,
            p.nombre as provincia_nombre,
            pa.nombre as pais_nombre
        FROM reparacion_orden ro
        LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
        LEFT JOIN usuarios u ON ro.usuario_id = u.usuario_id
        LEFT JOIN direccion d ON u.direccion_id = d.direccion_id
        LEFT JOIN ciudades c ON d.ciudad_id = c.ciudad_id
        LEFT JOIN provincias p ON d.provincia_id = p.id
        LEFT JOIN paises pa ON d.pais_id = pa.pais_id
        WHERE ro.reparacion_orden_id = :id
    ");
    $stmt->execute([':id' => $ordenId]);
    $orden = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$orden) {
        $conexion->rollBack();
        echo json_encode(["success" => false, "message" => "Orden no encontrada."]);
        exit();
    }

    // Validar código de seguridad
    if (trim($orden['codigo_seguridad']) !== $codigo) {
        $conexion->rollBack();
        echo json_encode(["success" => false, "message" => "❌ Código de seguridad incorrecto."]);
        exit();
    }

    // 2. Control de pagos: Validar que el total sea igual a lo pagado
    $total = floatval($orden['total']);
    $pagadoReal = floatval($orden['pagado']); // Acumulado real pagado (señas o pagos parciales)
    $saldoPendiente = $total - $pagadoReal;

    if ($saldoPendiente > 0) {
        $conexion->rollBack();
        echo json_encode([
            "success" => false, 
            "message" => "⚠️ Pago incompleto. Total: $$total | Pagado: $$pagadoReal | Falta abonar: $$saldoPendiente"
        ]);
        exit();
    }

    // 3. Validar que la orden esté Finalizada antes de entregar
    if (strtolower($orden['estado_orden']) !== 'finalizado' && intval($orden['estados_or_id']) !== 3) {
        $conexion->rollBack();
        echo json_encode(["success" => false, "message" => "❌ La orden aún no se encuentra en estado Finalizado."]);
        exit();
    }

    // 4. Obtener el ID del estado 'Entregado'
    $stEstado = $conexion->query("SELECT estados_or_id FROM estados_or WHERE LOWER(nombre) LIKE '%entregado%' LIMIT 1");
    $estadoEntregado = $stEstado->fetch(PDO::FETCH_ASSOC);
    $nuevoEstadoId = $estadoEntregado ? $estadoEntregado['estados_or_id'] : 5;

    // 5. Actualizar orden a ENTREGADO
    $update = $conexion->prepare("UPDATE reparacion_orden SET estados_or_id = :est WHERE reparacion_orden_id = :id");
    $update->execute([':est' => $nuevoEstadoId, ':id' => $ordenId]);

    // 6. Registrar la venta en caja si aún no se había registrado por completo
    $stmtVenta = $conexion->prepare("
        INSERT INTO venta (total, empleado_id, usuario_id, estado_general_id) 
        VALUES (:total, :empleado_id, :usuario_id, 1)
    ");
    $stmtVenta->execute([
        ':total' => $total,
        ':empleado_id' => $orden['empleado_id'],
        ':usuario_id' => $orden['usuario_id']
    ]);
    $ventaId = $conexion->lastInsertId();

    // 7. Insertar el detalle de venta asociado al servicio
    $stmtDetalle = $conexion->prepare("
        INSERT INTO detalle_venta (forma_pago_id, cantidad, subtotal, venta_id, estado_general_id, observaciones, producto_id, servicio_id) 
        VALUES (:forma_pago_id, 1, :subtotal, :venta_id, 1, :observaciones, NULL, :servicio_id)
    ");
    $stmtDetalle->execute([
        ':forma_pago_id' => $orden['formas_pago_id'],
        ':subtotal' => $total,
        ':venta_id' => $ventaId,
        ':observaciones' => "Liquidación total orden #" . $ordenId,
        ':servicio_id' => $orden['servicios_id']
    ]);

    $conexion->commit();

    $direccionCliente = [
        "calle" => $orden['calle'] ?? 'Sin registrar',
        "numero" => $orden['numero'] ?? 'S/N',
        "barrio" => $orden['barrio'] ?? '',
        "manzana" => $orden['manzana'] ?? '',
        "casa" => $orden['casa'] ?? '',
        "piso_dpto" => $orden['piso_dpto'] ?? '',
        "ciudad" => $orden['ciudad_nombre'] ?? '',
        "provincia" => $orden['provincia_nombre'] ?? '',
        "pais" => $orden['pais_nombre'] ?? '',
        "tipo_entrega" => $orden['tipo_entrega']
    ];

    echo json_encode([
        "success" => true, 
        "message" => "✅ Pago total verificado, producto entregado y registrado en caja con éxito.",
        "direccion_cliente" => $direccionCliente
    ]);

} catch (Exception $e) {
    if ($conexion->inTransaction()) { $conexion->rollBack(); }
    echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
}
?>