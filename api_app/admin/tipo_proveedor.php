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
                $stmt = $conexion->prepare("SELECT tipo_proveedor_id AS id, tipo AS nombre, estado_general_id FROM tipo_proveedor WHERE tipo_proveedor_id = :id LIMIT 1");
                $stmt->execute([':id' => $_GET['id']]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $sql = "SELECT tipo_proveedor_id AS id, tipo AS nombre, estado_general_id FROM tipo_proveedor";
                
                if ($estadoParam === 'activos') {
                    $sql .= " WHERE estado_general_id = 1";
                } elseif ($estadoParam === 'inactivos') {
                    $sql .= " WHERE estado_general_id = 2";
                }
                
                $sql .= " ORDER BY tipo ASC";

                $stmt = $conexion->query($sql);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents("php://input"), true);
            
            if (empty($input['nombre'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El tipo de proveedor es obligatorio."]);
                exit();
            }

            $estado = $input['estado_general_id'] ?? 1;

            $stmt = $conexion->prepare("INSERT INTO tipo_proveedor (tipo, estado_general_id) VALUES (:nombre, :estado)");
            $stmt->execute([
                ':nombre' => trim($input['nombre']),
                ':estado' => $estado
            ]);

            http_response_code(201);
            echo json_encode([
                "success" => true, 
                "message" => "Tipo de proveedor creado correctamente.", 
                "id" => $conexion->lastInsertId()
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['id']) || empty($input['nombre'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID y nombre son obligatorios."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE tipo_proveedor SET tipo = :nombre WHERE tipo_proveedor_id = :id");
            $stmt->execute([
                ':nombre' => trim($input['nombre']),
                ':id'     => $input['id']
            ]);

            echo json_encode(["success" => true, "message" => "Tipo de proveedor actualizado correctamente."]);
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE tipo_proveedor SET estado_general_id = 2 WHERE tipo_proveedor_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Tipo de proveedor inhabilitado correctamente."]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE tipo_proveedor SET estado_general_id = 1 WHERE tipo_proveedor_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Tipo de proveedor activado correctamente."]);
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