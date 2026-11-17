<?php
if (ob_get_length()) {
    ob_clean();
}

ini_set('display_errors', '0');
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . '/../conexion.php';
    if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }
    if (!isset($conexion)) { throw new Exception("Error de conexión a la base de datos."); }

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $tecnico_id = $_GET['tecnico_id'] ?? null;

        // Mostrar órdenes pendientes o en proceso, permitiendo ver las asignadas al técnico o sin técnico
        $sql = "SELECT 
                    ro.reparacion_orden_id,
                    ro.usuario_id,
                    u.nombre as cliente_nombre,
                    u.apellido as cliente_apellido,
                    me.marcas_equipos as marca_nombre,
                    mo.modelo_equipos as modelo_nombre,
                    s.nombre as servicio_nombre,
                    ro.diagnostico_cliente,
                    ro.estados_or_id,
                    ro.tecnico_id,
                    ro.total,
                    ro.monto_seña,
                    ro.imagen
                FROM reparacion_orden ro
                INNER JOIN usuarios u ON ro.usuario_id = u.usuario_id
                INNER JOIN equipos eq ON ro.equipo_id = eq.equipo_id
                LEFT JOIN marcas_equipos me ON eq.marca_equipo_id = me.marca_equipo_id
                LEFT JOIN modelo_equipos mo ON eq.modelo_equipo_id = mo.modelo_equipo_id
                LEFT JOIN servicios s ON ro.servicios_id = s.servicios_id
                WHERE ro.estados_or_id IN (1, 2, 4)";

        $params = [];
        if ($tecnico_id) {
            $sql .= " AND (ro.tecnico_id = :tecnico_id OR ro.tecnico_id IS NULL)";
            $params[':tecnico_id'] = $tecnico_id;
        }

        $sql .= " ORDER BY ro.reparacion_orden_id DESC";

        $stmt = $conexion->prepare($sql);
        $stmt->execute($params);
        $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "ordenes" => $ordenes ?: []], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['reparacion_orden_id']) || !isset($data['diagnostico']) || !isset($data['total']) || !isset($data['monto_seña'])) {
            echo json_encode(["success" => false, "message" => "Faltan datos requeridos"]);
            exit();
        }

        $conexion->beginTransaction();

        // Actualizar diagnóstico, presupuesto, seña y opcionalmente autogestionar el técnico si estaba libre
        $sql = "UPDATE reparacion_orden 
                SET diagnostico_cliente = :diag,
                    total = :tot,
                    monto_seña = :sena,
                    estados_or_id = 2
                WHERE reparacion_orden_id = :id";
                
        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':diag' => $data['diagnostico'],
            ':tot'  => $data['total'],
            ':sena' => $data['monto_seña'],
            ':id'   => $data['reparacion_orden_id']
        ]);

        $conexion->commit();
        echo json_encode(["success" => true, "message" => "Evaluación registrada correctamente"]);
        exit();
    }

} catch (Exception $e) {
    if (isset($conexion) && $conexion->inTransaction()) {
        $conexion->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error en el servidor: " . $e->getMessage()]);
    exit();
}
?>