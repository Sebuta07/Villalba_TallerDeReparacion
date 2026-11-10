<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../conexion.php';
if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $sql = "SELECT 
                    es.envios_sucursal_id,
                    es.fecha_pedido,
                    p.nombre AS producto_nombre,
                    des.cantidad,
                    des.observaciones,
                    u.nombre AS usuario_nombre,
                    u.apellido AS usuario_apellido
                FROM envios_sucursal es
                INNER JOIN detalle_envios_sucursal des ON es.envios_sucursal_id = des.envios_sucursal_id
                INNER JOIN productos p ON des.productos_id = p.productos_id
                INNER JOIN usuarios u ON es.usuario_id = u.usuario_id
                ORDER BY es.envios_sucursal_id DESC";
        
        $stmt = $conexion->query($sql);
        echo json_encode(["success" => true, "pedidos" => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['productos_id']) || !isset($data['cantidad']) || !isset($data['usuario_id'])) {
        echo json_encode(["success" => false, "message" => "Faltan datos obligatorios (producto, cantidad o usuario)."]);
        exit();
    }

    try {
        $conexion->beginTransaction();

        // 1. Insertar la cabecera en envios_sucursal con el usuario que hizo la petición
        $sqlCabecera = "INSERT INTO envios_sucursal (usuario_id, fecha_pedido, estado_general_id) VALUES (:usuario_id, NOW(), 1)";
        $stmtCab = $conexion->prepare($sqlCabecera);
        $stmtCab->execute([':usuario_id' => $data['usuario_id']]);
        $envioId = $conexion->lastInsertId();

        // 2. Insertar el detalle con la cantidad y la descripción/observación
        $sqlDetalle = "INSERT INTO detalle_envios_sucursal (envios_sucursal_id, productos_id, cantidad, observaciones, estado_general_id) 
                       VALUES (:envio_id, :prod_id, :cantidad, :obs, 1)";
        $stmtDet = $conexion->prepare($sqlDetalle);
        $stmtDet->execute([
            ':envio_id' => $envioId,
            ':prod_id'  => $data['productos_id'],
            ':cantidad' => $data['cantidad'],
            ':obs'      => $data['observaciones'] ?? 'Sin observaciones'
        ]);

        $conexion->commit();
        echo json_encode(["success" => true, "message" => "Pedido de reposición registrado con éxito."]);
    } catch (Exception $e) {
        $conexion->rollBack();
        echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
    }
}
?>