<?php
if (ob_get_length()) ob_clean();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include("../conexion.php");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $sql = "SELECT 
                    r.reparacion_orden_id AS id,
                    r.diagnostico_cliente,
                    r.total,
                    r.fecha_registro,
                    r.imagen AS orden_imagen,
                    
                    eo.nombre AS estado_orden,
                    CONCAT(u_cliente.nombre, ' ', u_cliente.apellido) AS cliente_nombre,
                    u_cliente.dni_cuit,
                    fp.forma AS forma_pago,
                    s.nombre AS servicio_nombre,

                    e.equipo_id,
                    e.numero_serie,
                    e.imei,
                    m.marcas_equipos AS marca_nombre,
                    mo.modelo_equipos AS modelo_nombre,
                    c.nombre AS categoria_nombre

                FROM reparacion_orden r
                LEFT JOIN estados_or eo ON r.estados_or_id = eo.estados_or_id
                LEFT JOIN usuarios u_cliente ON r.usuario_id = u_cliente.usuario_id
                LEFT JOIN formas_pago fp ON r.formas_pago_id = fp.formas_pago_id
                LEFT JOIN servicios s ON r.servicios_id = s.servicios_id
                LEFT JOIN equipos e ON r.equipo_id = e.equipo_id
                LEFT JOIN marcas_equipos m ON e.marca_equipo_id = m.marca_equipo_id
                LEFT JOIN modelo_equipos mo ON e.modelo_equipo_id = mo.modelo_equipo_id
                LEFT JOIN categorias_equipo c ON e.categoria_equipo_id = c.categoria_id
                WHERE r.tecnico_id IS NULL OR r.tecnico_id = 0
                ORDER BY r.fecha_registro DESC";

        $stmt = $conexion->prepare($sql);
        $stmt->execute();
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

        echo json_encode([
            "success" => true,
            "data" => $ordenes
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false, 
            "message" => "Error al obtener las órdenes: " . $e->getMessage()
        ]);
    }
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $reparacion_orden_id = $data['reparacion_orden_id'] ?? null;
    $tecnico_id = $data['tecnico_id'] ?? null;

    if (!$reparacion_orden_id || !$tecnico_id) {
        echo json_encode([
            "success" => false, 
            "message" => "Faltan campos obligatorios (reparacion_orden_id o tecnico_id)."
        ]);
        exit();
    }

    try {
        $sql = "UPDATE reparacion_orden 
                SET tecnico_id = :tecnico_id 
                WHERE reparacion_orden_id = :reparacion_orden_id";
        
        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':tecnico_id' => $tecnico_id,
            ':reparacion_orden_id' => $reparacion_orden_id
        ]);

        echo json_encode([
            "success" => true, 
            "message" => "¡Dispositivo asignado al técnico correctamente!"
        ]);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false, 
            "message" => "Error al actualizar en BD: " . $e->getMessage()
        ]);
    }
}
?>