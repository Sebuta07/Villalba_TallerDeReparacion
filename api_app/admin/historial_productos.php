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
    require_once("../conexion.php");
    
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
    $producto_id = isset($_GET['producto_id']) ? intval($_GET['producto_id']) : null;
    
    $query = "
        SELECT 
            v.venta_id,
            v.fecha_venta,
            u.nombre AS cliente_nombre,
            u.apellido AS cliente_apellido,
            u.dni_cuit AS cliente_dni,
            emp.nombre AS empleado_nombre,
            emp.apellido AS empleado_apellido,
            p.nombre AS producto_nombre,
            dv.cantidad,
            dv.subtotal,
            fp.forma AS forma_pago
        FROM detalle_venta dv
        INNER JOIN venta v ON dv.venta_id = v.venta_id
        INNER JOIN productos p ON dv.producto_id = p.productos_id
        LEFT JOIN usuarios u ON v.usuario_id = u.usuario_id
        LEFT JOIN usuarios emp ON v.empleado_id = emp.usuario_id
        LEFT JOIN formas_pago fp ON dv.forma_pago_id = fp.formas_pago_id
        WHERE v.estado_general_id = 1 AND dv.producto_id IS NOT NULL
    ";

    $params = [];

    if ($fecha_inicio && $fecha_fin) {
        $query .= " AND DATE(v.fecha_venta) BETWEEN :fecha_inicio AND :fecha_fin";
        $params[':fecha_inicio'] = $fecha_inicio;
        $params[':fecha_fin'] = $fecha_fin;
    }

    if ($dni) {
        $query .= " AND u.dni_cuit LIKE :dni";
        $params[':dni'] = "%$dni%";
    }

    if ($producto_id) {
        $query .= " AND dv.producto_id = :producto_id";
        $params[':producto_id'] = $producto_id;
    }

    $query .= " ORDER BY v.fecha_venta DESC";

    $stmt = $conexion->prepare($query);
    $stmt->execute($params);
    $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Sumatoria de ganancias de la búsqueda actual
    $totalGanado = 0;
    foreach ($historial as $h) {
        $totalGanado += floatval($h['subtotal']);
    }

    // Cargar productos para el filtro desplegable
    $productos = $conexion->query("SELECT productos_id, nombre FROM productos WHERE estado_general_id = 1 ORDER BY nombre ASC")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "total_ganado" => $totalGanado,
        "historial" => $historial,
        "productos" => $productos
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "error" => "Error de base de datos: " . $e->getMessage()
    ]);
}
?>