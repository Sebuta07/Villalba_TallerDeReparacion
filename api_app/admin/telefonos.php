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
                        t.telefono_id, 
                        t.usuario_id, 
                        t.numero, 
                        t.tipo, 
                        t.estado_general_id, 
                        t.codigo_pais_id,
                        cp.codigo AS codigo_pais_num,
                        t.codigo_area_id,
                        ca.codigo AS codigo_area_num,
                        TRIM(CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, ''), ' (', u.username, ')')) AS usuario_nombre
                    FROM telefonos t
                    INNER JOIN usuarios u ON t.usuario_id = u.usuario_id
                    LEFT JOIN codigo_pais cp ON t.codigo_pais_id = cp.codigo_pais_id
                    LEFT JOIN codigo_area ca ON t.codigo_area_id = ca.codigo_area_id";

            if ($filtro === 'activos') {
                $sql .= " WHERE t.estado_general_id = 1";
            } elseif ($filtro === 'inactivos') {
                $sql .= " WHERE t.estado_general_id = 2";
            }

            $sql .= " ORDER BY t.telefono_id DESC";

            $stmt = $conexion->query($sql);
            $telefonos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Usuarios
            $stmtUsers = $conexion->query("
                SELECT usuario_id AS id, 
                       TRIM(CONCAT(COALESCE(nombre, ''), ' ', COALESCE(apellido, ''), ' (', username, ')')) AS nombre_completo 
                FROM usuarios 
                WHERE estado_general_id = 1 
                ORDER BY nombre ASC
            ");
            $usuarios = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);

            // Códigos de País
            $stmtPaises = $conexion->query("
                SELECT codigo_pais_id, codigo 
                FROM codigo_pais 
                WHERE estado_general_id = 1 
                ORDER BY codigo ASC
            ");
            $codigosPais = $stmtPaises->fetchAll(PDO::FETCH_ASSOC);

            // Códigos de Área
            $stmtCodigos = $conexion->query("
                SELECT codigo_area_id, codigo 
                FROM codigo_area 
                WHERE estado_general_id = 1 
                ORDER BY codigo ASC
            ");
            $codigosArea = $stmtCodigos->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "data" => $telefonos,
                "usuarios" => $usuarios,
                "codigos_pais" => $codigosPais,
                "codigos_area" => $codigosArea
            ]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['usuario_id']) || empty($input['numero'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El usuario y el número son requeridos."]);
                exit();
            }

            $tipoPermitido = ($input['tipo'] === 'Fijo') ? 'Fijo' : 'Móvil';

            $stmt = $conexion->prepare("INSERT INTO telefonos (
                usuario_id, numero, tipo, estado_general_id, codigo_pais_id, codigo_area_id
            ) VALUES (
                :usuario_id, :numero, :tipo, 1, :codigo_pais_id, :codigo_area_id
            )");

            $stmt->execute([
                ':usuario_id'     => $input['usuario_id'],
                ':numero'         => trim($input['numero']),
                ':tipo'           => $tipoPermitido,
                ':codigo_pais_id' => !empty($input['codigo_pais_id']) ? $input['codigo_pais_id'] : null,
                ':codigo_area_id' => !empty($input['codigo_area_id']) ? $input['codigo_area_id'] : null,
            ]);

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Teléfono registrado correctamente.",
                "id" => $conexion->lastInsertId()
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['telefono_id']) || empty($input['usuario_id']) || empty($input['numero'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Datos insuficientes para actualizar."]);
                exit();
            }

            $tipoPermitido = ($input['tipo'] === 'Fijo') ? 'Fijo' : 'Móvil';

            $stmt = $conexion->prepare("UPDATE telefonos SET 
                usuario_id = :usuario_id,
                numero = :numero,
                tipo = :tipo,
                codigo_pais_id = :codigo_pais_id,
                codigo_area_id = :codigo_area_id
                WHERE telefono_id = :telefono_id");

            $stmt->execute([
                ':usuario_id'     => $input['usuario_id'],
                ':numero'         => trim($input['numero']),
                ':tipo'           => $tipoPermitido,
                ':codigo_pais_id' => !empty($input['codigo_pais_id']) ? $input['codigo_pais_id'] : null,
                ':codigo_area_id' => !empty($input['codigo_area_id']) ? $input['codigo_area_id'] : null,
                ':telefono_id'    => $input['telefono_id'],
            ]);

            echo json_encode([
                "success" => true,
                "message" => "Teléfono actualizado correctamente."
            ]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE telefonos SET estado_general_id = 2 WHERE telefono_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode([
                "success" => true,
                "message" => "Teléfono inhabilitado correctamente."
            ]);
            break;

        case 'PATCH':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE telefonos SET estado_general_id = 1 WHERE telefono_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode([
                "success" => true,
                "message" => "Teléfono activado correctamente."
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