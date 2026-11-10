<?php
if (ob_get_length()) ob_clean();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../conexion.php';
if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }

$method = $_SERVER['REQUEST_METHOD'];

// 1. Manejo de GET (Listar reparaciones filtradas por empleado si se envía)
if ($method === 'GET') {
    try {
        $empleado_id = $_GET['empleado_id'] ?? null;

        $sql = "SELECT 
                    ro.reparacion_orden_id,
                    ro.diagnostico_cliente,
                    ro.total AS presupuesto,
                    ro.imagen AS orden_imagen,
                    ro.estados_or_id,
                    eo.nombre AS estado_orden,
                    u.usuario_id,
                    u.nombre AS cliente_nombre,
                    u.apellido AS cliente_apellido,
                    e.equipo_id,
                    e.numero_serie,
                    e.imei,
                    me.marcas_equipos AS marca_nombre,
                    moe.modelo_equipos AS modelo_nombre,
                    ce.nombre AS categoria_nombre
                FROM reparacion_orden ro
                INNER JOIN usuarios u ON ro.usuario_id = u.usuario_id
                INNER JOIN equipos e ON ro.equipo_id = e.equipo_id
                LEFT JOIN categorias_equipo ce ON e.categoria_equipo_id = ce.categoria_id
                LEFT JOIN marcas_equipos me ON e.marca_equipo_id = me.marca_equipo_id
                LEFT JOIN modelo_equipos moe ON e.modelo_equipo_id = moe.modelo_equipo_id
                LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id";

        $params = [];
        if ($empleado_id) {
            $sql .= " WHERE ro.tecnico_id = :empleado_id";
            $params[':empleado_id'] = $empleado_id;
        }

        $sql .= " ORDER BY ro.reparacion_orden_id DESC";

        $stmt = $conexion->prepare($sql);
        $stmt->execute($params);
        $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
        $baseUrl = "$protocol://$host/api_app/uploads/orden/";

        foreach ($ordenes as &$orden) {
            $imagenesEquipo = [];
            
            if (!empty($orden['orden_imagen'])) {
                $imagenesEquipo[] = $baseUrl . $orden['orden_imagen'];
            }

            $equipo_id = $orden['equipo_id'];
            $uploadDir = __DIR__ . '/../uploads/orden/';
            
            if (is_dir($uploadDir)) {
                $archivos = scandir($uploadDir);
                foreach ($archivos as $archivo) {
                    if ($archivo !== '.' && $archivo !== '..') {
                        if (strpos($archivo, "orden_{$equipo_id}_") === 0) {
                            $urlArchivo = $baseUrl . $archivo;
                            if (!in_array($urlArchivo, $imagenesEquipo)) {
                                $imagenesEquipo[] = $urlArchivo;
                            }
                        }
                    }
                }
            }

            $orden['imagenes'] = $imagenesEquipo;
        }

        echo json_encode(["success" => true, "ordenes" => $ordenes], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error al consultar órdenes: " . $e->getMessage()]);
    }
    exit();
}

// 2. Manejo de POST (Actualizar estado de la orden)
if ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $reparacion_orden_id = $input['reparacion_orden_id'] ?? null;
        $estados_or_id = $input['estados_or_id'] ?? null;

        if (!$reparacion_orden_id || !$estados_or_id) {
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios."]);
            exit();
        }

        $stmt = $conexion->prepare("UPDATE reparacion_orden SET estados_or_id = :estados_or_id WHERE reparacion_orden_id = :reparacion_orden_id");
        $stmt->execute([
            ':estados_or_id' => $estados_or_id,
            ':reparacion_orden_id' => $reparacion_orden_id
        ]);

        echo json_encode(["success" => true, "message" => "Estado actualizado correctamente."]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error al actualizar estado: " . $e->getMessage()]);
    }
    exit();
}
?>