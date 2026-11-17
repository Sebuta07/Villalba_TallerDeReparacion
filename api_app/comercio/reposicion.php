<?php
if (ob_get_length()) {
    ob_clean();
}

ini_set('display_errors', '0');
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

try {
    require_once __DIR__ . '/../conexion.php';
    if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }
    if (!isset($conexion)) { throw new Exception("Error de conexión a la BD."); }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// ==========================================
// MÉTODO GET: LISTAR PEDIDOS DE REPOSICIÓN
// ==========================================
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
        echo json_encode(["success" => true, "pedidos" => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

// ==========================================
// MÉTODO POST: CREAR / GUARDAR NUEVO PEDIDO
// ==========================================
elseif ($method === 'POST') {
    try {
        $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
        $data = [];

        if (strpos($contentType, "application/json") !== false) {
            $data = json_decode(file_get_contents("php://input"), true) ?? [];
        } else {
            $data = $_POST;
        }

        $productos_id = $data['productos_id'] ?? null;
        $stock = $data['stock'] ?? $data['cantidad'] ?? 1;
        $observaciones = $data['observaciones'] ?? '';
        $estado = $data['estado'] ?? 'pendiente';

        if (!$productos_id) {
            throw new Exception("Falta el ID del producto para realizar el pedido.");
        }

        $sql = "INSERT INTO detalle_pedido_sucursal (productos_id, stock, observaciones, estado, estado_general_id, fecha_hora_pedido) 
                VALUES (:productos_id, :stock, :observaciones, :estado, 1, NOW())";
        
        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':productos_id' => $productos_id,
            ':stock' => $stock,
            ':observaciones' => $observaciones,
            ':estado' => $estado
        ]);

        $nuevo_id = $conexion->lastInsertId();

        echo json_encode([
            "success" => true,
            "message" => "Pedido de reposición registrado con éxito.",
            "detalle_pedido_sucursales_id" => $nuevo_id
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error al registrar el pedido: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}
?>