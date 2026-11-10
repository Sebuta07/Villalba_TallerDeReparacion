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
if (!isset($data['reparacion_orden_id']) || !isset($data['estados_or_id'])) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit();
}

try {
    $stmt = $conexion->prepare("UPDATE reparacion_orden SET estados_or_id = :estado WHERE reparacion_orden_id = :id");
    $stmt->execute([':estado' => $data['estados_or_id'], ':id' => $data['reparacion_orden_id']]);
    echo json_encode(["success" => true, "message" => "Estado actualizado"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>