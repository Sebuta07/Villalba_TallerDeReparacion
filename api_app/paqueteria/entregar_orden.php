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

    // 1. Obtener la orden y validar el código
    $stmt = $conexion->prepare("SELECT codigo_seguridad, total FROM reparacion_orden WHERE reparacion_orden_id = :id");
    $stmt->execute([':id' => $ordenId]);
    $orden = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$orden) {
        $conexion->rollBack();
        echo json_encode(["success" => false, "message" => "Orden no encontrada."]);
        exit();
    }

    if (trim($orden['codigo_seguridad']) !== $codigo) {
        $conexion->rollBack();
        echo json_encode(["success" => false, "message" => "❌ Código de seguridad incorrecto."]);
        exit();
    }

    // 2. Obtener el ID del estado 'Entregado'
    $stEstado = $conexion->query("SELECT estados_or_id FROM estados_or WHERE LOWER(nombre) LIKE '%entregado%' LIMIT 1");
    $estadoEntregado = $stEstado->fetch(PDO::FETCH_ASSOC);
    $nuevoEstadoId = $estadoEntregado ? $estadoEntregado['estados_or_id'] : 5; // Asigna el ID de Entregado

    // 3. Actualizar estado a ENTREGADO y marcar como PAGADO
    $update = $conexion->prepare("UPDATE reparacion_orden SET estados_or_id = :est, pagado = 1 WHERE reparacion_orden_id = :id");
    $update->execute([':est' => $nuevoEstadoId, ':id' => $ordenId]);

    $conexion->commit();
    echo json_encode([
        "success" => true, 
        "message" => "✅ Código verificado. El producto fue registrado como PAGADO y ENTREGADO con éxito."
    ]);
} catch (Exception $e) {
    if ($conexion->inTransaction()) { $conexion->rollBack(); }
    echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
}
?>