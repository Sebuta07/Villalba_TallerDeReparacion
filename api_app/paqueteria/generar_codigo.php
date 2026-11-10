<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
require_once __DIR__ . '/../conexion.php';
if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['reparacion_orden_id'])) {
    echo json_encode(["success" => false, "message" => "Falta ID de orden"]);
    exit();
}

$id = intval($data['reparacion_orden_id']);
$codigo = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

try {
    $stmt = $conexion->prepare("UPDATE reparacion_orden SET codigo_seguridad = :cod WHERE reparacion_orden_id = :id");
    $stmt->execute([':cod' => $codigo, ':id' => $id]);
    echo json_encode(["success" => true, "codigo" => $codigo, "message" => "Código generado correctamente"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>