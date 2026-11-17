<?php
// Activamos temporalmente errores para diagnosticar
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    require_once __DIR__ . '/../conexion.php';
    if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }

    if (!isset($conexion)) {
        throw new Exception("La variable \$conexion o \$pdo no está definida en conexion.php");
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error de conexión en BD: " . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conexion->query("
            SELECT p.*, cp.nombre AS categoria, 
                   COALESCE(ps.stock_disponible, 0) AS stock_disponible,
                   COALESCE(ps.stock_minimo, 0) AS stock_minimo,
                   ps.productos_id
            FROM productos p 
            LEFT JOIN categorias_productos cp ON p.categoria_productos_id = cp.categoria_productos_id
            LEFT JOIN productos ps ON p.productos_id = ps.productos_id
        ");
        echo json_encode(["success" => true, "productos" => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error en la consulta SQL: " . $e->getMessage()]);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['productos_id']) || !isset($data['precio_venta'])) {
        echo json_encode(["success" => false, "message" => "Datos incompletos enviados"]);
        exit();
    }
    try {
        $conexion->beginTransaction();

        $stmt = $conexion->prepare("UPDATE productos SET precio_venta = :precio, descripcion = :desc WHERE productos_id = :id");
        $stmt->execute([
            ':precio' => $data['precio_venta'],
            ':desc' => $data['descripcion'] ?? '',
            ':id' => $data['productos_id']
        ]);

        if (isset($data['stock_disponible'])) {
            $check = $conexion->prepare("SELECT productos_id FROM productos WHERE productos_id = :id LIMIT 1");
            $check->execute([':id' => $data['productos_id']]);
            if ($check->rowCount() > 0) {
                $upStock = $conexion->prepare("UPDATE productos SET stock_disponible = :stock WHERE productos_id = :id");
                $upStock->execute([':stock' => $data['stock_disponible'], ':id' => $data['productos_id']]);
            } else {
                $insStock = $conexion->prepare("INSERT INTO productos (productos_id, stock_disponible, stock_minimo, estado_general_id) VALUES (:id, :stock, 5, 1)");
                $insStock->execute([':id' => $data['productos_id'], ':stock' => $data['stock_disponible']]);
            }
        }

        $conexion->commit();
        echo json_encode(["success" => true, "message" => "Inventario actualizado con éxito"]);
    } catch (Exception $e) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }
        echo json_encode(["success" => false, "message" => "Error en transacción: " . $e->getMessage()]);
    }
}
?>