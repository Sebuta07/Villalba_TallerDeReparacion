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
            $filtro = $_GET['estado'] ?? 'todos';

            $sql = "SELECT 
                        codigo_postal_id, 
                        codigo_postal, 
                        estado_general_id 
                    FROM codigo_postal";

            if ($filtro === 'activos') {
                $sql .= " WHERE estado_general_id = 1";
            } elseif ($filtro === 'inactivos') {
                $sql .= " WHERE estado_general_id = 2";
            }

            $sql .= " ORDER BY codigo_postal ASC";

            $stmt = $conexion->query($sql);
            $codigosPostales = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "data" => $codigosPostales
            ]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['codigo_postal'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El código postal es obligatorio."]);
                exit();
            }

            $stmt = $conexion->prepare("INSERT INTO codigo_postal (
                codigo_postal, estado_general_id
            ) VALUES (
                :codigo_postal, 1
            )");

            $stmt->execute([
                ':codigo_postal' => trim($input['codigo_postal'])
            ]);

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Código postal registrado correctamente.",
                "id" => $conexion->lastInsertId()
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['codigo_postal_id']) || empty($input['codigo_postal'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Datos insuficientes para actualizar."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE codigo_postal SET 
                codigo_postal = :codigo_postal 
                WHERE codigo_postal_id = :codigo_postal_id");

            $stmt->execute([
                ':codigo_postal'    => trim($input['codigo_postal']),
                ':codigo_postal_id' => $input['codigo_postal_id']
            ]);

            echo json_encode([
                "success" => true,
                "message" => "Código postal actualizado correctamente."
            ]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE codigo_postal SET estado_general_id = 2 WHERE codigo_postal_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode([
                "success" => true,
                "message" => "Código postal inhabilitado correctamente."
            ]);
            break;

        case 'PATCH':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE codigo_postal SET estado_general_id = 1 WHERE codigo_postal_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode([
                "success" => true,
                "message" => "Código postal activado correctamente."
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido."]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error de base de datos: " . $e->getMessage()
    ]);
}