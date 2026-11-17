<?php
ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    require_once __DIR__ . '/../conexion.php';
    if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }
    if (!isset($conexion)) { throw new Exception("No se encontró la conexión a la base de datos."); }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error de conexión: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: Listado de peticiones de reposición
if ($method === 'GET') {
    try {
        $sql = "SELECT 
                    dps.detalle_pedido_sucursales_id,
                    dps.productos_id,
                    dps.fecha_hora_pedido,
                    p.nombre AS producto_nombre,
                    dps.stock AS cantidad,
                    dps.observaciones,
                    COALESCE(dps.estado, 'pendiente') AS estado
                FROM detalle_pedido_sucursal dps
                INNER JOIN productos p ON dps.productos_id = p.productos_id
                ORDER BY dps.detalle_pedido_sucursales_id DESC";
        
        $stmt = $conexion->query($sql);
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["success" => true, "pedidos" => $pedidos], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error SQL en GET: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// POST: Realizar control, sumar stock a la tabla productos y marcar como verificado
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['detalle_pedido_sucursales_id']) || !isset($data['productos_id']) || !isset($data['cantidad'])) {
        echo json_encode(["success" => false, "message" => "Faltan datos obligatorios en el JSON."], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $idPedido = intval($data['detalle_pedido_sucursales_id']);
    $prodId = intval($data['productos_id']);
    $cant = intval($data['cantidad']);

    try {
        $conexion->beginTransaction();

        // 1. Marcar como verificado en detalle_pedido_sucursal
        $updPedido = $conexion->prepare("UPDATE detalle_pedido_sucursal SET estado = 'verificado' WHERE detalle_pedido_sucursales_id = :id");
        $updPedido->execute([':id' => $idPedido]);

        // 2. Sumar el stock directamente en la tabla productos usando stock_disponible
        $updStock = $conexion->prepare("UPDATE productos SET stock_disponible = stock_disponible + :cant WHERE productos_id = :pid");
        $updStock->execute([':cant' => $cant, ':pid' => $prodId]);

        $conexion->commit();
        echo json_encode(["success" => true, "message" => "Control realizado con éxito. Se sumaron $cant unidades al stock."], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        if ($conexion->inTransaction()) { $conexion->rollBack(); }
        echo json_encode(["success" => false, "message" => "Error SQL en POST: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}
?>