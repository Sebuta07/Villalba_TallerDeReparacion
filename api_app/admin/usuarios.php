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
                        u.usuario_id AS id, 
                        u.username, 
                        u.email, 
                        u.nombre, 
                        u.apellido, 
                        u.dni_cuit, 
                        u.direccion_id,
                        u.pais_id,
                        pa.nombre AS pais_nombre,
                        u.rol_id, 
                        u.genero_id, 
                        u.fecha_nacimiento, 
                        u.estado_general_id,
                        IF(d.direccion_id IS NULL, NULL,
                            TRIM(CONCAT_WS(' ',
                                NULLIF(d.calle, ''),
                                d.numero,
                                IF(d.barrio IS NOT NULL AND d.barrio != '', CONCAT('B° ', d.barrio), NULL),
                                IF(d.manzana IS NOT NULL AND d.manzana != '', CONCAT('Mz. ', d.manzana), NULL),
                                IF(d.casa IS NOT NULL AND d.casa != '', CONCAT('Casa ', d.casa), NULL),
                                IF(d.piso_dpto IS NOT NULL AND d.piso_dpto != '', CONCAT('(', d.piso_dpto, ')'), NULL)
                            ))
                        ) AS direccion_completa
                    FROM usuarios u
                    LEFT JOIN direccion d ON u.direccion_id = d.direccion_id
                    LEFT JOIN paises pa ON u.pais_id = pa.pais_id";

            if ($filtro === 'activos') {
                $sql .= " WHERE u.estado_general_id = 1";
            } elseif ($filtro === 'inactivos') {
                $sql .= " WHERE u.estado_general_id = 2";
            }

            $sql .= " ORDER BY u.nombre ASC";

            $stmt = $conexion->query($sql);
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Obtener direcciones para el select
            $stmtDir = $conexion->query("SELECT direccion_id, calle, numero, barrio, manzana, casa, piso_dpto FROM direccion ORDER BY direccion_id DESC");
            $direcciones = $stmtDir->fetchAll(PDO::FETCH_ASSOC);

            // Obtener países activos para el select
            $stmtPais = $conexion->query("SELECT pais_id, nombre FROM paises WHERE estado_general_id = 1 ORDER BY nombre ASC");
            $paises = $stmtPais->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true, 
                "data" => $usuarios,
                "direcciones" => $direcciones,
                "paises" => $paises
            ]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents("php://input"), true);

            $passHash = !empty($input['password']) ? password_hash($input['password'], PASSWORD_BCRYPT) : null;

            $stmt = $conexion->prepare("INSERT INTO usuarios (
                username, password_hash, email, nombre, apellido, dni_cuit, 
                direccion_id, pais_id, rol_id, genero_id, fecha_nacimiento, estado_general_id, fecha_registro
            ) VALUES (
                :username, :password_hash, :email, :nombre, :apellido, :dni_cuit, 
                :direccion_id, :pais_id, :rol_id, :genero_id, :fecha_nacimiento, 1, NOW()
            )");
            
            $stmt->execute([
                ':username'         => isset($input['username']) ? trim($input['username']) : null,
                ':password_hash'    => $passHash,
                ':email'            => isset($input['email']) ? trim($input['email']) : null,
                ':nombre'           => !empty($input['nombre']) ? trim($input['nombre']) : null,
                ':apellido'         => !empty($input['apellido']) ? trim($input['apellido']) : null,
                ':dni_cuit'         => !empty($input['dni_cuit']) ? trim($input['dni_cuit']) : null,
                ':direccion_id'     => !empty($input['direccion_id']) ? $input['direccion_id'] : null,
                ':pais_id'          => !empty($input['pais_id']) ? $input['pais_id'] : null,
                ':rol_id'           => $input['rol_id'] ?? 1,
                ':genero_id'        => $input['genero_id'] ?? 1,
                ':fecha_nacimiento' => !empty($input['fecha_nacimiento']) ? $input['fecha_nacimiento'] : null,
            ]);

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Usuario creado correctamente.",
                "id" => $conexion->lastInsertId()
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents("php://input"), true);

            if (empty($input['id'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El ID de usuario es obligatorio para editar."]);
                exit();
            }

            if (!empty($input['password'])) {
                $passHash = password_hash($input['password'], PASSWORD_BCRYPT);
                $stmt = $conexion->prepare("UPDATE usuarios SET 
                    username = :username, password_hash = :password_hash, email = :email, 
                    nombre = :nombre, apellido = :apellido, dni_cuit = :dni_cuit, 
                    direccion_id = :direccion_id, pais_id = :pais_id, rol_id = :rol_id, genero_id = :genero_id, 
                    fecha_nacimiento = :fecha_nacimiento 
                    WHERE usuario_id = :id");
                
                $params = [
                    ':username'         => isset($input['username']) ? trim($input['username']) : null,
                    ':password_hash'    => $passHash,
                    ':email'            => isset($input['email']) ? trim($input['email']) : null,
                    ':nombre'           => !empty($input['nombre']) ? trim($input['nombre']) : null,
                    ':apellido'         => !empty($input['apellido']) ? trim($input['apellido']) : null,
                    ':dni_cuit'         => !empty($input['dni_cuit']) ? trim($input['dni_cuit']) : null,
                    ':direccion_id'     => !empty($input['direccion_id']) ? $input['direccion_id'] : null,
                    ':pais_id'          => !empty($input['pais_id']) ? $input['pais_id'] : null,
                    ':rol_id'           => $input['rol_id'] ?? 1,
                    ':genero_id'        => $input['genero_id'] ?? 1,
                    ':fecha_nacimiento' => !empty($input['fecha_nacimiento']) ? $input['fecha_nacimiento'] : null,
                    ':id'               => $input['id']
                ];
            } else {
                $stmt = $conexion->prepare("UPDATE usuarios SET 
                    username = :username, email = :email, nombre = :nombre, 
                    apellido = :apellido, dni_cuit = :dni_cuit, direccion_id = :direccion_id, 
                    pais_id = :pais_id, rol_id = :rol_id, genero_id = :genero_id, fecha_nacimiento = :fecha_nacimiento 
                    WHERE usuario_id = :id");
                
                $params = [
                    ':username'         => isset($input['username']) ? trim($input['username']) : null,
                    ':email'            => isset($input['email']) ? trim($input['email']) : null,
                    ':nombre'           => !empty($input['nombre']) ? trim($input['nombre']) : null,
                    ':apellido'         => !empty($input['apellido']) ? trim($input['apellido']) : null,
                    ':dni_cuit'         => !empty($input['dni_cuit']) ? trim($input['dni_cuit']) : null,
                    ':direccion_id'     => !empty($input['direccion_id']) ? $input['direccion_id'] : null,
                    ':pais_id'          => !empty($input['pais_id']) ? $input['pais_id'] : null,
                    ':rol_id'           => $input['rol_id'] ?? 1,
                    ':genero_id'        => $input['genero_id'] ?? 1,
                    ':fecha_nacimiento' => !empty($input['fecha_nacimiento']) ? $input['fecha_nacimiento'] : null,
                    ':id'               => $input['id']
                ];
            }

            $stmt->execute($params);

            echo json_encode([
                "success" => true,
                "message" => "Usuario actualizado correctamente."
            ]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE usuarios SET estado_general_id = 2 WHERE usuario_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode([
                "success" => true,
                "message" => "Usuario inhabilitado correctamente."
            ]);
            break;

        case 'PATCH':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE usuarios SET estado_general_id = 1 WHERE usuario_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode([
                "success" => true,
                "message" => "Usuario activado correctamente."
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