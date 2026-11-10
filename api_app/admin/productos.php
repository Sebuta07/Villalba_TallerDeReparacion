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
            $estadoParam = $_GET['estado'] ?? 'todos';
            $where = "";

            if ($estadoParam === 'activos') {
                $where = "WHERE p.estado_general_id = 1";
            } elseif ($estadoParam === 'inactivos') {
                $where = "WHERE p.estado_general_id = 2";
            }

            if (isset($_GET['id'])) {
                $stmt = $conexion->prepare("SELECT p.*, 
                               c.nombre AS categoria_nombre, 
                               m.nombre AS marca_nombre, 
                               md.nombre AS modelo_nombre,
                               cp.codigo AS codigo_nombre,
                               e.estado AS estado_nombre
                        FROM productos p
                        LEFT JOIN categorias_productos c ON p.categoria_productos_id = c.categoria_productos_id
                        LEFT JOIN marca m ON p.marca_id = m.marca_id
                        LEFT JOIN modelo md ON p.modelo_id = md.modelo_id
                        LEFT JOIN codigo_productos cp ON p.codigo_producto_id = cp.codigo_producto_id
                        LEFT JOIN estado_general e ON p.estado_general_id = e.estado_general_id
                        WHERE p.productos_id = :id LIMIT 1");
                $stmt->execute([':id' => $_GET['id']]);
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $sql = "SELECT p.*, 
                               c.nombre AS categoria_nombre, 
                               m.nombre AS marca_nombre, 
                               md.nombre AS modelo_nombre,
                               cp.codigo AS codigo_nombre,
                               e.estado AS estado_nombre
                        FROM productos p
                        LEFT JOIN categorias_productos c ON p.categoria_productos_id = c.categoria_productos_id
                        LEFT JOIN marca m ON p.marca_id = m.marca_id
                        LEFT JOIN modelo md ON p.modelo_id = md.modelo_id
                        LEFT JOIN codigo_productos cp ON p.codigo_producto_id = cp.codigo_producto_id
                        LEFT JOIN estado_general e ON p.estado_general_id = e.estado_general_id
                        $where
                        ORDER BY p.productos_id DESC";

                $stmt = $conexion->query($sql);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            // Listas auxiliares completas para los select/pickers
            $categorias = $conexion->query("SELECT categoria_productos_id AS id, nombre FROM categorias_productos WHERE estado_general_id = 1")->fetchAll(PDO::FETCH_ASSOC);
            $marcas = $conexion->query("SELECT marca_id AS id, nombre FROM marca WHERE estado_general_id = 1")->fetchAll(PDO::FETCH_ASSOC);
            $modelos = $conexion->query("SELECT modelo_id AS id, nombre FROM modelo WHERE estado_general_id = 1")->fetchAll(PDO::FETCH_ASSOC);
            $codigos = $conexion->query("SELECT codigo_producto_id AS id, codigo FROM codigo_productos WHERE estado_general_id = 1")->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "data" => $data,
                "listas" => [
                    "categorias" => $categorias,
                    "marcas" => $marcas,
                    "modelos" => $modelos,
                    "codigos" => $codigos
                ]
            ]);
            break;

        case 'POST':
            $id = $_POST['id'] ?? $_POST['productos_id'] ?? null;
            $nombre = $_POST['nombre'] ?? '';
            $descripcion = $_POST['descripcion'] ?? '';
            $categoria_productos_id = !empty($_POST['categoria_productos_id']) ? $_POST['categoria_productos_id'] : null;
            $marca_id = !empty($_POST['marca_id']) ? $_POST['marca_id'] : null;
            $modelo_id = !empty($_POST['modelo_id']) ? $_POST['modelo_id'] : null;
            $codigo_producto_id = !empty($_POST['codigo_producto_id']) ? $_POST['codigo_producto_id'] : null;
            $precio_venta = $_POST['precio_venta'] ?? 0.00;
            $stock_disponible = isset($_POST['stock_disponible']) && $_POST['stock_disponible'] !== '' ? intval($_POST['stock_disponible']) : 0;
            $stock_minimo = isset($_POST['stock_minimo']) && $_POST['stock_minimo'] !== '' ? intval($_POST['stock_minimo']) : 5;
            $garantia = isset($_POST['garantia']) && $_POST['garantia'] !== '' ? intval($_POST['garantia']) : 0;
            $observaciones = $_POST['observaciones'] ?? '';
            $estado = $_POST['estado_general_id'] ?? 1;
            $eliminar_imagen = ($_POST['eliminar_imagen'] ?? '0') === '1';

            if (empty($nombre)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El nombre del producto es obligatorio."]);
                exit();
            }

            $uploadDir = __DIR__ . '/../uploads/productos/';
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

                $nombre_imagen = 'prod_' . time() . '_' . rand(100, 999) . '.' . $ext;
                $destino = $uploadDir . $nombre_imagen;

                if (move_uploaded_file($_FILES['imagen']['tmp_name'], $destino)) {
                    $nueva_imagen_subida = true;
                }
            }

            if ($id) {
                if ($eliminar_imagen || $nueva_imagen_subida) {
                    $stmtOld = $conexion->prepare("SELECT imagen FROM productos WHERE productos_id = :id");
                    $stmtOld->execute([':id' => $id]);
                    $oldProd = $stmtOld->fetch(PDO::FETCH_ASSOC);

                    if ($oldProd && !empty($oldProd['imagen'])) {
                        $oldFile = $uploadDir . $oldProd['imagen'];
                        if (file_exists($oldFile)) {
                            unlink($oldFile);
                        }
                    }
                }

                $sqlImagen = "";
                $params = [
                    ':nombre' => trim($nombre),
                    ':descripcion' => trim($descripcion),
                    ':categoria' => $categoria_productos_id,
                    ':marca' => $marca_id,
                    ':modelo' => $modelo_id,
                    ':codigo' => $codigo_producto_id,
                    ':precio' => $precio_venta,
                    ':stock' => $stock_disponible,
                    ':stock_min' => $stock_minimo,
                    ':garantia' => $garantia,
                    ':obs' => trim($observaciones),
                    ':id' => $id
                ];

                if ($nueva_imagen_subida) {
                    $sqlImagen = ", imagen = :imagen";
                    $params[':imagen'] = $nombre_imagen;
                } elseif ($eliminar_imagen) {
                    $sqlImagen = ", imagen = NULL";
                }

                $sql = "UPDATE productos SET 
                        nombre = :nombre,
                        descripcion = :descripcion,
                        categoria_productos_id = :categoria,
                        marca_id = :marca,
                        modelo_id = :modelo,
                        codigo_producto_id = :codigo,
                        precio_venta = :precio,
                        stock_disponible = :stock,
                        stock_minimo = :stock_min,
                        garantia = :garantia,
                        observaciones = :obs
                        $sqlImagen
                        WHERE productos_id = :id";

                $stmt = $conexion->prepare($sql);
                $stmt->execute($params);

                echo json_encode(["success" => true, "message" => "Producto modificado exitosamente."]);
            } else {
                $fecha_ingreso = date('Y-m-d');
                $sql = "INSERT INTO productos 
                        (nombre, descripcion, categoria_productos_id, marca_id, modelo_id, codigo_producto_id, precio_venta, stock_disponible, stock_minimo, estado_general_id, fecha_ingreso, imagen, garantia, observaciones) 
                        VALUES 
                        (:nombre, :descripcion, :categoria, :marca, :modelo, :codigo, :precio, :stock, :stock_min, :estado, :fecha, :imagen, :garantia, :obs)";

                $stmt = $conexion->prepare($sql);
                $stmt->execute([
                    ':nombre' => trim($nombre),
                    ':descripcion' => trim($descripcion),
                    ':categoria' => $categoria_productos_id,
                    ':marca' => $marca_id,
                    ':modelo' => $modelo_id,
                    ':codigo' => $codigo_producto_id,
                    ':precio' => $precio_venta,
                    ':stock' => $stock_disponible,
                    ':stock_min' => $stock_minimo,
                    ':estado' => $estado,
                    ':fecha' => $fecha_ingreso,
                    ':imagen' => $nombre_imagen,
                    ':garantia' => $garantia,
                    ':obs' => trim($observaciones)
                ]);

                http_response_code(201);
                echo json_encode([
                    "success" => true,
                    "message" => "Producto registrado exitosamente.",
                    "productos_id" => $conexion->lastInsertId()
                ]);
            }
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['productos_id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE productos SET estado_general_id = 2 WHERE productos_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Producto inhabilitado correctamente."]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? $input['productos_id'] ?? $input['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID no proporcionado."]);
                exit();
            }

            $stmt = $conexion->prepare("UPDATE productos SET estado_general_id = 1 WHERE productos_id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true, "message" => "Producto activado correctamente."]);
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