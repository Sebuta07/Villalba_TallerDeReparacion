<?php
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
            if (isset($_GET['id'])) {
                $stmt = $conexion->prepare("SELECT marca_id AS id, nombre, estado_general_id FROM marca WHERE marca_id = :id LIMIT 1");
                $stmt->execute([':id' => $_GET['id']]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $estadoFiltro = $_GET['estado'] ?? 'todos';
                
                $sql = "SELECT marca_id AS id, nombre, estado_general_id FROM marca ";
                $params = [];

                if ($estadoFiltro === 'activos') {
                    $sql .= "WHERE estado_general_id = 1 ";
                } elseif ($estadoFiltro === 'inactivos') {
                    $sql .= "WHERE estado_general_id = 2 ";
                }

                $sql .= "ORDER BY estado_general_id ASC, nombre ASC";
                
                $stmt = $conexion->prepare($sql);
                $stmt->execute($params);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents("php://input"), true);
            
            if (empty($input['nombre'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El nombre de la marca es obligatorio."]);
                exit();
            }

            $estado = $input['estado_general_id'] ?? 1;

            $stmt = $conexion->prepare("INSERT INTO marca (nombre, estado_general_id) VALUES (:nombre, :estado)");
            $stmt->execute([
                ':nombre' => trim($input['nombre']),
                ':estado' => $estado
            ]);

            http_response_code(201);
            echo json_encode([
                "success" => true, 
                "message" => "Marca creada correctamente.", 
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

            $stmt = $conexion->prepare("UPDATE marca SET nombre = :nombre WHERE marca_id = :id");
            $stmt->execute([
                ':nombre' => trim($input['nombre']),
                ':id'     => $input['id']
            ]);

            echo json_encode(["success" => true, "message" => "Marca actualizada correctamente."]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID de marca no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE marca SET estado_general_id = 1 WHERE marca_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Marca activada correctamente."]);
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID de marca no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE marca SET estado_general_id = 2 WHERE marca_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Marca inhabilitada correctamente."]);
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