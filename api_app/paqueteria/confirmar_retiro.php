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

    $stmt = $conexion->prepare("
        SELECT ro.reparacion_orden_id, ro.codigo_seguridad, ro.estados_or_id
        FROM reparacion_orden ro
        WHERE ro.reparacion_orden_id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $ordenId]);
    $orden = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$orden) {
        $conexion->rollBack();
        echo json_encode(["success" => false, "message" => "Orden no encontrada."]);
        exit();
    }

    if (empty($orden['codigo_seguridad']) || trim($orden['codigo_seguridad']) !== $codigo) {
        $conexion->rollBack();
        echo json_encode(["success" => false, "message" => "❌ Código de seguridad incorrecto."]);
        exit();
    }

    // 1. Actualizar estado de la orden a 'En Proceso' (ingresada a taller)
    $stEstado = $conexion->query("SELECT estados_or_id FROM estados_or WHERE LOWER(nombre) LIKE '%proceso%' LIMIT 1");
    $estadoProceso = $stEstado->fetch(PDO::FETCH_ASSOC);
    $nuevoEstadoId = $estadoProceso ? intval($estadoProceso['estados_or_id']) : 2;

    $updOrden = $conexion->prepare("UPDATE reparacion_orden SET estados_or_id = :est WHERE reparacion_orden_id = :id");
    $updOrden->execute([':est' => $nuevoEstadoId, ':id' => $ordenId]);

    // 2. Actualizar seguimiento en `reparacion`
    $updRep = $conexion->prepare("
        UPDATE reparacion 
        SET estado_envio = 'Dispositivo Retirado · Ingresado en Taller' 
        WHERE reparacion_orden_id = :id
    ");
    $updRep->execute([':id' => $ordenId]);

    // 3. Dejar constancia en `detalle_envios_sucursal`
    $updDet = $conexion->prepare("
        UPDATE detalle_envios_sucursal 
        SET observarciones = CONCAT(COALESCE(observarciones, ''), ' | RETIRADO POR CADETE OK')
        WHERE reparacion_orden_id = :id
    ");
    $updDet->execute([':id' => $ordenId]);

    $conexion->commit();

    echo json_encode([
        "success" => true,
        "message" => "✅ Dispositivo retirado del domicilio e ingresado al taller correctamente."
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if ($conexion->inTransaction()) { $conexion->rollBack(); }
    echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
}
?>