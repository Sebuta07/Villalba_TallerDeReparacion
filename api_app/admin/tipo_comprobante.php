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
                        tipo_comprobante_id, 
                        tipo_comprobante, 
                        estado_general_id 
                    FROM tipo_comprobante";

            if ($filtro === 'activos') {
                $sql .= " WHERE estado_general_id = 1";
            } elseif ($filtro === 'inactivos') {
                $sql .= " WHERE estado_general_id = 2";
            }

            $sql .= " ORDER BY tipo_comprobante ASC";

            $stmt = $conexion->query($sql);
            $tiposComprobante = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "data" => $tiposComprobante
            ]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['tipo_comprobante'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El nombre del tipo de comprobante es obligatorio."]);
                exit();
            }

            $stmt = $conexion->prepare("INSERT INTO tipo_comprobante (
                tipo_comprobante, estado_general_id
            ) VALUES (
                :tipo_comprobante, 1
            )");

            $stmt->execute([
                ':tipo_comprobante' => trim($input['tipo_comprobante'])
            ]);

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Tipo de comprobante registrado correctamente.",
                "id" => $conexion->lastInsertId()
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['tipo_comprobante_id']) || empty($input['tipo_comprobante'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Datos insuficientes para actualizar."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE tipo_comprobante SET 
                tipo_comprobante = :tipo_comprobante 
                WHERE tipo_comprobante_id = :tipo_comprobante_id");

            $stmt->execute([
                ':tipo_comprobante'    => trim($input['tipo_comprobante']),
                ':tipo_comprobante_id' => $input['tipo_comprobante_id']
            ]);

            echo json_encode([
                "success" => true,
                "message" => "Tipo de comprobante actualizado correctamente."
            ]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE tipo_comprobante SET estado_general_id = 2 WHERE tipo_comprobante_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode([
                "success" => true,
                "message" => "Tipo de comprobante inhabilitado correctamente."
            ]);
            break;

        case 'PATCH':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE tipo_comprobante SET estado_general_id = 1 WHERE tipo_comprobante_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode([
                "success" => true,
                "message" => "Tipo de comprobante activado correctamente."
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