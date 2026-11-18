<?php
ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Incluimos tu archivo de conexión central
    require_once("../conexion.php");
    
    // Por si tu variable de conexión se llama $pdo en vez de $conexion
    if (!isset($conexion) && isset($pdo)) { 
        $conexion = $pdo; 
    }

    if (!isset($conexion)) {
        throw new Exception("No se pudo establecer la conexión con la base de datos.");
    }

    // Filtros
    $fecha_inicio = isset($_GET['fecha_inicio']) ? $_GET['fecha_inicio'] : null;
    $fecha_fin = isset($_GET['fecha_fin']) ? $_GET['fecha_fin'] : null;
    $dni = isset($_GET['dni']) ? trim($_GET['dni']) : null;
    $servicio_id = isset($_GET['servicio_id']) ? intval($_GET['servicio_id']) : null;

    // Filtramos solo las órdenes que tengan algún pago registrado (pagado > 0)
    $query = "
        SELECT 
            ro.reparacion_orden_id,
            ro.fecha_registro,
            u.nombre AS cliente_nombre,
            u.apellido AS cliente_apellido,
            u.dni_cuit AS cliente_dni,
            emp.nombre AS recepcionista_nombre,
            emp.apellido AS recepcionista_apellido,
            tec.nombre AS tecnico_nombre,
            tec.apellido AS tecnico_apellido,
            s.nombre AS servicio_nombre,
            ro.total,
            ro.pagado,
            eo.nombre AS estado_orden
        FROM reparacion_orden ro
        LEFT JOIN usuarios u ON ro.usuario_id = u.usuario_id
        LEFT JOIN usuarios emp ON ro.empleado_id = emp.usuario_id
        LEFT JOIN usuarios tec ON ro.tecnico_id = tec.usuario_id
        LEFT JOIN servicios s ON ro.servicios_id = s.servicios_id
        LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
        WHERE ro.estado_general_id = 1 AND ro.pagado > 0
    ";

    $params = [];

    if ($fecha_inicio && $fecha_fin) {
        $query .= " AND DATE(ro.fecha_registro) BETWEEN :fecha_inicio AND :fecha_fin";
        $params[':fecha_inicio'] = $fecha_inicio;
        $params[':fecha_fin'] = $fecha_fin;
    }

    if ($dni) {
        $query .= " AND u.dni_cuit LIKE :dni";
        $params[':dni'] = "%$dni%";
    }

    if ($servicio_id) {
        $query .= " AND ro.servicios_id = :servicio_id";
        $params[':servicio_id'] = $servicio_id;
    }

    $query .= " ORDER BY ro.fecha_registro DESC";

    $stmt = $conexion->prepare($query);
    $stmt->execute($params);
    $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Sumatoria de ganancias de la búsqueda actual
    $totalGanado = 0;
    foreach ($historial as $h) {
        $totalGanado += floatval($h['pagado']);
    }

    // Cargar servicios para el filtro desplegable
    $servicios = $conexion->query("SELECT servicios_id, nombre FROM servicios WHERE estado_general_id = 1")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "total_ganado" => $totalGanado,
        "historial" => $historial,
        "servicios" => $servicios
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "error" => "Error de base de datos: " . $e->getMessage()
    ]);
}
?>