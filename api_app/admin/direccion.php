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
                        d.direccion_id AS id, 
                        d.provincia_id, 
                        pr.nombre AS provincia_nombre,
                        d.ciudad_id, 
                        c.nombre AS ciudad_nombre,
                        d.codigo_postal_id, 
                        cp.codigo_postal AS codigo_postal_valor,
                        d.calle, 
                        d.numero, 
                        d.barrio, 
                        d.manzana, 
                        d.casa, 
                        d.piso_dpto, 
                        d.observaciones, 
                        d.estado_general_id,
                        d.pais_id,
                        pa.nombre AS pais_nombre,
                        TRIM(CONCAT_WS(' ',
                            NULLIF(d.calle, ''),
                            d.numero,
                            IF(d.barrio IS NOT NULL AND d.barrio != '', CONCAT('B° ', d.barrio), NULL),
                            IF(d.manzana IS NOT NULL AND d.manzana != '', CONCAT('Mz. ', d.manzana), NULL),
                            IF(d.casa IS NOT NULL AND d.casa != '', CONCAT('Casa ', d.casa), NULL),
                            IF(d.piso_dpto IS NOT NULL AND d.piso_dpto != '', CONCAT('(', d.piso_dpto, ')'), NULL)
                        )) AS direccion_completa
                    FROM direccion d
                    LEFT JOIN paises pa ON d.pais_id = pa.pais_id
                    LEFT JOIN provincias pr ON d.provincia_id = pr.id
                    LEFT JOIN ciudades c ON d.ciudad_id = c.ciudad_id
                    LEFT JOIN codigo_postal cp ON d.codigo_postal_id = cp.codigo_postal_id";

            if ($filtro === 'activos') {
                $sql .= " WHERE d.estado_general_id = 1";
            } elseif ($filtro === 'inactivos') {
                $sql .= " WHERE d.estado_general_id = 2";
            }

            $sql .= " ORDER BY d.direccion_id DESC";

            $stmt = $conexion->query($sql);
            $direcciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $paises = $conexion->query("SELECT pais_id, nombre FROM paises WHERE estado_general_id = 1 ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);
            $provincias = $conexion->query("SELECT id AS provincia_id, nombre FROM provincias ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);
            $ciudades = $conexion->query("SELECT ciudad_id, nombre FROM ciudades ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);
            $codigosPostales = $conexion->query("SELECT codigo_postal_id, codigo_postal AS codigo FROM codigo_postal ORDER BY codigo_postal ASC")->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true, 
                "data" => $direcciones,
                "paises" => $paises,
                "provincias" => $provincias,
                "ciudades" => $ciudades,
                "codigos_postales" => $codigosPostales
            ]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents("php://input"), true);

            $stmt = $conexion->prepare("INSERT INTO direccion (
                provincia_id, ciudad_id, codigo_postal_id, calle, numero, 
                barrio, manzana, casa, piso_dpto, observaciones, estado_general_id, pais_id
            ) VALUES (
                :provincia_id, :ciudad_id, :codigo_postal_id, :calle, :numero, 
                :barrio, :manzana, :casa, :piso_dpto, :observaciones, 1, :pais_id
            )");
            
            $stmt->execute([
                ':provincia_id'     => !empty($input['provincia_id']) ? $input['provincia_id'] : null,
                ':ciudad_id'        => !empty($input['ciudad_id']) ? $input['ciudad_id'] : null,
                ':codigo_postal_id' => !empty($input['codigo_postal_id']) ? $input['codigo_postal_id'] : null,
                ':calle'            => !empty($input['calle']) ? trim($input['calle']) : null,
                ':numero'           => !empty($input['numero']) ? trim($input['numero']) : null,
                ':barrio'           => !empty($input['barrio']) ? trim($input['barrio']) : null,
                ':manzana'          => !empty($input['manzana']) ? trim($input['manzana']) : null,
                ':casa'             => !empty($input['casa']) ? trim($input['casa']) : null,
                ':piso_dpto'        => !empty($input['piso_dpto']) ? trim($input['piso_dpto']) : null,
                ':observaciones'    => !empty($input['observaciones']) ? trim($input['observaciones']) : null,
                ':pais_id'          => !empty($input['pais_id']) ? $input['pais_id'] : null,
            ]);

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Dirección registrada correctamente.",
                "id" => $conexion->lastInsertId()
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['id'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El ID de dirección es obligatorio para editar."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE direccion SET 
                provincia_id = :provincia_id, 
                ciudad_id = :ciudad_id, 
                codigo_postal_id = :codigo_postal_id, 
                calle = :calle, 
                numero = :numero, 
                barrio = :barrio, 
                manzana = :manzana, 
                casa = :casa, 
                piso_dpto = :piso_dpto, 
                observaciones = :observaciones, 
                pais_id = :pais_id 
                WHERE direccion_id = :id");
            
            $stmt->execute([
                ':provincia_id'     => !empty($input['provincia_id']) ? $input['provincia_id'] : null,
                ':ciudad_id'        => !empty($input['ciudad_id']) ? $input['ciudad_id'] : null,
                ':codigo_postal_id' => !empty($input['codigo_postal_id']) ? $input['codigo_postal_id'] : null,
                ':calle'            => !empty($input['calle']) ? trim($input['calle']) : null,
                ':numero'           => !empty($input['numero']) ? trim($input['numero']) : null,
                ':barrio'           => !empty($input['barrio']) ? trim($input['barrio']) : null,
                ':manzana'          => !empty($input['manzana']) ? trim($input['manzana']) : null,
                ':casa'             => !empty($input['casa']) ? trim($input['casa']) : null,
                ':piso_dpto'        => !empty($input['piso_dpto']) ? trim($input['piso_dpto']) : null,
                ':observaciones'    => !empty($input['observaciones']) ? trim($input['observaciones']) : null,
                ':pais_id'          => !empty($input['pais_id']) ? $input['pais_id'] : null,
                ':id'               => $input['id']
            ]);

            echo json_encode([
                "success" => true,
                "message" => "Dirección actualizada correctamente."
            ]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE direccion SET estado_general_id = 2 WHERE direccion_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode([
                "success" => true,
                "message" => "Dirección inhabilitada correctamente."
            ]);
            break;

        case 'PATCH':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE direccion SET estado_general_id = 1 WHERE direccion_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode([
                "success" => true,
                "message" => "Dirección activada correctamente."
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
?>