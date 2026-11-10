<?php
error_reporting(0);
ini_set('display_errors', '0');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $estadoParam = $_GET['estado'] ?? 'activos';

            if (isset($_GET['id'])) {
                $stmt = $conexion->prepare("SELECT pedidos_sucursales_id, fecha_pedido, hora_pedido, estado_general_id FROM pedidos_sucursales WHERE pedidos_sucursales_id = :id LIMIT 1");
                $stmt->execute([':id' => $_GET['id']]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $sql = "SELECT pedidos_sucursales_id, fecha_pedido, hora_pedido, estado_general_id FROM pedidos_sucursales";
                
                if ($estadoParam === 'activos') {
                    $sql .= " WHERE estado_general_id = 1";
                } elseif ($estadoParam === 'inactivos') {
                    $sql .= " WHERE estado_general_id = 2";
                }
                
                $sql .= " ORDER BY fecha_pedido DESC, hora_pedido DESC";

                $stmt = $conexion->query($sql);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents("php://input"), true);
            
            $fecha = $input['fecha_pedido'] ?? date('Y-m-d');
            $hora = $input['hora_pedido'] ?? date('Y-m-d H:i:s');
            $estado = $input['estado_general_id'] ?? 1;

            $stmt = $conexion->prepare("INSERT INTO pedidos_sucursales (fecha_pedido, hora_pedido, estado_general_id) VALUES (:fecha_pedido, :hora_pedido, :estado)");
            $stmt->execute([
                ':fecha_pedido' => $fecha,
                ':hora_pedido'  => $hora,
                ':estado'       => $estado
            ]);

            http_response_code(201);
            echo json_encode([
                "success" => true, 
                "message" => "Pedido registrado correctamente.", 
                "pedidos_sucursales_id" => $conexion->lastInsertId()
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['pedidos_sucursales_id']) || empty($input['fecha_pedido']) || empty($input['hora_pedido'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El ID, fecha y hora del pedido son obligatorios."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE pedidos_sucursales SET fecha_pedido = :fecha_pedido, hora_pedido = :hora_pedido WHERE pedidos_sucursales_id = :id");
            $stmt->execute([
                ':fecha_pedido' => $input['fecha_pedido'],
                ':hora_pedido'  => $input['hora_pedido'],
                ':id'           => $input['pedidos_sucursales_id']
            ]);

            echo json_encode(["success" => true, "message" => "Pedido actualizado correctamente."]);
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['pedidos_sucursales_id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE pedidos_sucursales SET estado_general_id = 2 WHERE pedidos_sucursales_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Pedido inhabilitado correctamente."]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['pedidos_sucursales_id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE pedidos_sucursales SET estado_general_id = 1 WHERE pedidos_sucursales_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Pedido activado correctamente."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido."]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error en la base de datos: " . $e->getMessage()]);
}
?>