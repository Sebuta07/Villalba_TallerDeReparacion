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
                $sql = "SELECT s.servicios_id AS id, s.nombre, s.descripcion, s.categorias_servicios_id, 
                               c.categoria AS categoria_nombre, s.costo, s.imagen, s.fecha_registro, s.estado_general_id 
                        FROM servicios s
                        LEFT JOIN categorias_servicios c ON s.categorias_servicios_id = c.categorias_servicios_id
                        WHERE s.servicios_id = :id LIMIT 1";
                $stmt = $conexion->prepare($sql);
                $stmt->execute([':id' => $_GET['id']]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $sql = "SELECT s.servicios_id AS id, s.nombre, s.descripcion, s.categorias_servicios_id, 
                               c.categoria AS categoria_nombre, s.costo, s.imagen, s.fecha_registro, s.estado_general_id 
                        FROM servicios s
                        LEFT JOIN categorias_servicios c ON s.categorias_servicios_id = c.categorias_servicios_id";
                
                if ($estadoParam === 'activos') {
                    $sql .= " WHERE s.estado_general_id = 1";
                } elseif ($estadoParam === 'inactivos') {
                    $sql .= " WHERE s.estado_general_id = 2";
                }
                
                $sql .= " ORDER BY s.nombre ASC";

                $stmt = $conexion->query($sql);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'POST':
        case 'PUT':
            $id = $_POST['id'] ?? null;
            $nombre = $_POST['nombre'] ?? '';
            $descripcion = $_POST['descripcion'] ?? '';
            $categorias_servicios_id = $_POST['categorias_servicios_id'] ?? null;
            $costo = $_POST['costo'] ?? null;
            $estado = $_POST['estado_general_id'] ?? 1;

            if (empty($nombre) || empty($categorias_servicios_id) || !isset($costo)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El nombre, categoría y costo son obligatorios."]);
                exit();
            }

            $uploadDir = __DIR__ . '/../uploads/servicios/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $nombre_imagen = null;
            $nueva_imagen_subida = false;

            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
                $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
                if (empty($ext)) {
                    $ext = 'jpg';
                }

                $nombre_imagen = 'serv_' . time() . '_' . rand(100, 999) . '.' . $ext;
                $destino = $uploadDir . $nombre_imagen;

                if (move_uploaded_file($_FILES['imagen']['tmp_name'], $destino)) {
                    $nueva_imagen_subida = true;
                }
            }

            if ($method === 'PUT' || !empty($id)) {
                if ($nueva_imagen_subida) {
                    $stmtOld = $conexion->prepare("SELECT imagen FROM servicios WHERE servicios_id = :id");
                    $stmtOld->execute([':id' => $id]);
                    $oldServ = $stmtOld->fetch(PDO::FETCH_ASSOC);

                    if ($oldServ && !empty($oldServ['imagen'])) {
                        $oldFile = $uploadDir . $oldServ['imagen'];
                        if (file_exists($oldFile)) {
                            unlink($oldFile);
                        }
                    }
                }

                $sqlImagen = "";
                $params = [
                    ':nombre'      => trim($nombre),
                    ':descripcion' => trim($descripcion),
                    ':cat_id'      => $categorias_servicios_id,
                    ':costo'       => $costo,
                    ':id'          => $id
                ];

                if ($nueva_imagen_subida) {
                    $sqlImagen = ", imagen = :imagen";
                    $params[':imagen'] = $nombre_imagen;
                }

                $sql = "UPDATE servicios 
                        SET nombre = :nombre, descripcion = :descripcion, categorias_servicios_id = :cat_id, costo = :costo $sqlImagen
                        WHERE servicios_id = :id";
                        
                $stmt = $conexion->prepare($sql);
                $stmt->execute($params);

                echo json_encode(["success" => true, "message" => "Servicio actualizado correctamente."]);
            } else {
                $sql = "INSERT INTO servicios (nombre, descripcion, categorias_servicios_id, costo, imagen, estado_general_id, fecha_registro) 
                        VALUES (:nombre, :descripcion, :cat_id, :costo, :imagen, :estado, NOW())";
                
                $stmt = $conexion->prepare($sql);
                $stmt->execute([
                    ':nombre'      => trim($nombre),
                    ':descripcion' => trim($descripcion),
                    ':cat_id'      => $categorias_servicios_id,
                    ':costo'       => $costo,
                    ':imagen'      => $nombre_imagen,
                    ':estado'      => $estado
                ]);

                http_response_code(201);
                echo json_encode([
                    "success" => true, 
                    "message" => "Servicio creado correctamente.", 
                    "id" => $conexion->lastInsertId()
                ]);
            }
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID de servicio no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE servicios SET estado_general_id = 2 WHERE servicios_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Servicio inhabilitado correctamente."]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID de servicio no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE servicios SET estado_general_id = 1 WHERE servicios_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Servicio activado correctamente."]);
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