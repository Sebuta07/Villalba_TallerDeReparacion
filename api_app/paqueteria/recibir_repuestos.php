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

// GET: Devuelve toda la lista completa con productos, cantidades y solicitantes
if ($method === 'GET') {
    try {
        $sql = "SELECT 
                    es.envios_sucursal_id,
                    es.fecha_pedido,
                    es.estado_general_id,
                    des.productos_id,
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
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

// POST: Confirma control y actualiza stock
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['envios_sucursal_id']) || !isset($data['productos_id']) || !isset($data['cantidad'])) {
        echo json_encode(["success" => false, "message" => "Faltan datos obligatorios para actualizar el stock."]);
        exit();
    }

    $envioId = intval($data['envios_sucursal_id']);
    $prodId = intval($data['productos_id']);
    $cant = intval($data['cantidad']);

    try {
        $conexion->beginTransaction();

        // Actualizar o Insertar stock en productos_sucursal
        $check = $conexion->prepare("SELECT productos_sucursal_id, stock_disponible FROM productos_sucursal WHERE productos_id = :pid LIMIT 1");
        $check->execute([':pid' => $prodId]);
        
        if ($check->rowCount() > 0) {
            $row = $check->fetch(PDO::FETCH_ASSOC);
            $nuevoStock = $row['stock_disponible'] + $cant;
            $upd = $conexion->prepare("UPDATE productos_sucursal SET stock_disponible = :nstock WHERE productos_id = :pid");
            $upd->execute([':nstock' => $nuevoStock, ':pid' => $prodId]);
        } else {
            $ins = $conexion->prepare("INSERT INTO productos_sucursal (productos_id, stock_disponible, stock_minimo, estado_general_id) VALUES (:pid, :cant, 5, 1)");
            $ins->execute([':pid' => $prodId, ':cant' => $cant]);
        }

        // Marcar envio_sucursal como recibido (estado 2)
        $updEnvio = $conexion->prepare("UPDATE envios_sucursal SET estado_general_id = 2 WHERE envios_sucursal_id = :eid");
        $updEnvio->execute([':eid' => $envioId]);

        $conexion->commit();
        echo json_encode(["success" => true, "message" => "✅ Control realizado. Se agregaron $cant unidades al stock disponible."]);
    } catch (Exception $e) {
        $conexion->rollBack();
        echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
    }
}
?>