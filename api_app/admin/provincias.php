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
                $stmt = $conexion->prepare("
                    SELECT p.id, p.nombre, p.estado_general_id, p.pais_id, pa.nombre AS pais_nombre 
                    FROM provincias p 
                    LEFT JOIN paises pa ON p.pais_id = pa.pais_id 
                    WHERE p.id = :id 
                    LIMIT 1
                ");
                $stmt->execute([':id' => $_GET['id']]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $sql = "
                    SELECT p.id, p.nombre, p.estado_general_id, p.pais_id, pa.nombre AS pais_nombre 
                    FROM provincias p 
                    LEFT JOIN paises pa ON p.pais_id = pa.pais_id
                ";
                
                if ($estadoParam === 'activos') {
                    $sql .= " WHERE p.estado_general_id = 1";
                } elseif ($estadoParam === 'inactivos') {
                    $sql .= " WHERE p.estado_general_id = 2";
                }
                
                $sql .= " ORDER BY p.nombre ASC";

                $stmt = $conexion->query($sql);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents("php://input"), true);
            
            if (empty($input['nombre'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El nombre de la provincia es obligatorio."]);
                exit();
            }

            $estado = $input['estado_general_id'] ?? 1;
            $pais_id = !empty($input['pais_id']) ? $input['pais_id'] : null;

            $stmt = $conexion->prepare("INSERT INTO provincias (nombre, estado_general_id, pais_id) VALUES (:nombre, :estado, :pais_id)");
            $stmt->execute([
                ':nombre'  => trim($input['nombre']),
                ':estado'  => $estado,
                ':pais_id' => $pais_id
            ]);

            http_response_code(201);
            echo json_encode([
                "success" => true, 
                "message" => "Provincia creada correctamente.", 
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

            $pais_id = !empty($input['pais_id']) ? $input['pais_id'] : null;

            $stmt = $conexion->prepare("UPDATE provincias SET nombre = :nombre, pais_id = :pais_id WHERE id = :id");
            $stmt->execute([
                ':nombre'  => trim($input['nombre']),
                ':pais_id' => $pais_id,
                ':id'      => $input['id']
            ]);

            echo json_encode(["success" => true, "message" => "Provincia actualizada correctamente."]);
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE provincias SET estado_general_id = 2 WHERE id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Provincia inhabilitada correctamente."]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE provincias SET estado_general_id = 1 WHERE id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Provincia activada correctamente."]);
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