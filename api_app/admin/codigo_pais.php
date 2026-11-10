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
                    SELECT cp.codigo_pais_id, cp.codigo, cp.estado_general_id, cp.pais_id, pa.nombre AS pais_nombre 
                    FROM codigo_pais cp 
                    LEFT JOIN paises pa ON cp.pais_id = pa.pais_id 
                    WHERE cp.codigo_pais_id = :id 
                    LIMIT 1
                ");
                $stmt->execute([':id' => $_GET['id']]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $sql = "
                    SELECT cp.codigo_pais_id, cp.codigo, cp.estado_general_id, cp.pais_id, pa.nombre AS pais_nombre 
                    FROM codigo_pais cp 
                    LEFT JOIN paises pa ON cp.pais_id = pa.pais_id
                ";
                
                if ($estadoParam === 'activos') {
                    $sql .= " WHERE cp.estado_general_id = 1";
                } elseif ($estadoParam === 'inactivos') {
                    $sql .= " WHERE cp.estado_general_id = 2";
                }
                
                $sql .= " ORDER BY cp.codigo ASC";

                $stmt = $conexion->query($sql);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents("php://input"), true);
            
            if (empty($input['codigo'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El código de país es obligatorio."]);
                exit();
            }

            $estado = $input['estado_general_id'] ?? 1;
            $pais_id = !empty($input['pais_id']) ? $input['pais_id'] : null;

            $stmt = $conexion->prepare("INSERT INTO codigo_pais (codigo, estado_general_id, pais_id) VALUES (:codigo, :estado, :pais_id)");
            $stmt->execute([
                ':codigo'  => trim($input['codigo']),
                ':estado'  => $estado,
                ':pais_id' => $pais_id
            ]);

            http_response_code(201);
            echo json_encode([
                "success" => true, 
                "message" => "Código de país registrado correctamente.", 
                "id" => $conexion->lastInsertId()
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['codigo_pais_id']) || empty($input['codigo'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID y código son obligatorios."]);
                exit();
            }

            $pais_id = !empty($input['pais_id']) ? $input['pais_id'] : null;

            $stmt = $conexion->prepare("UPDATE codigo_pais SET codigo = :codigo, pais_id = :pais_id WHERE codigo_pais_id = :codigo_pais_id");
            $stmt->execute([
                ':codigo'         => trim($input['codigo']),
                ':pais_id'        => $pais_id,
                ':codigo_pais_id' => $input['codigo_pais_id']
            ]);

            echo json_encode(["success" => true, "message" => "Código de país actualizado correctamente."]);
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE codigo_pais SET estado_general_id = 2 WHERE codigo_pais_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Código de país inhabilitado correctamente."]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE codigo_pais SET estado_general_id = 1 WHERE codigo_pais_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Código de país activado correctamente."]);
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