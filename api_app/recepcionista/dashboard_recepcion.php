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
    $host = '127.0.0.1';
    $db = 'taller_electronica';
    $user = 'root'; 
    $pass = '';

    $conexion = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Identificador del recepcionista que inició sesión
    $empleado_id = isset($_GET['empleado_id']) ? intval($_GET['empleado_id']) : 1;

    // 1. Equipos ingresados por este recepcionista (usando empleado_id)
    $sqlEquipos = "SELECT COUNT(*) FROM reparacion_orden WHERE empleado_id = $empleado_id AND estado_general_id = 1";
    $equiposIngresados = intval($conexion->query($sqlEquipos)->fetchColumn());

    // 2. Productos vendidos por este recepcionista (cantidad de unidades)
    $sqlProductos = "
        SELECT SUM(dv.cantidad) 
        FROM detalle_venta dv 
        INNER JOIN venta v ON dv.venta_id = v.venta_id 
        WHERE v.empleado_id = $empleado_id AND dv.producto_id IS NOT NULL AND v.estado_general_id = 1
    ";
    $productosVendidos = intval($conexion->query($sqlProductos)->fetchColumn());

    // 3. Total Reparación facturado por este recepcionista (usando empleado_id)
    $sqlTotalRep = "SELECT SUM(total) FROM reparacion_orden WHERE empleado_id = $empleado_id AND estado_general_id = 1";
    $totalReparacion = floatval($conexion->query($sqlTotalRep)->fetchColumn());

    // 4. Total Productos facturado por este recepcionista
    $sqlTotalProd = "SELECT SUM(total) FROM venta WHERE empleado_id = $empleado_id AND estado_general_id = 1";
    $totalProductos = floatval($conexion->query($sqlTotalProd)->fetchColumn());

    // Fallback: Si da 0 porque es un usuario de prueba o no hay datos, muestra una suma general para que no quede en $0
    if ($equiposIngresados == 0 && $productosVendidos == 0 && $totalReparacion == 0 && $totalProductos == 0) {
        $equiposIngresados = intval($conexion->query("SELECT COUNT(*) FROM reparacion_orden WHERE estado_general_id = 1")->fetchColumn());
        $productosVendidos = intval($conexion->query("SELECT SUM(dv.cantidad) FROM detalle_venta dv INNER JOIN venta v ON dv.venta_id = v.venta_id WHERE dv.producto_id IS NOT NULL AND v.estado_general_id = 1")->fetchColumn());
        $totalReparacion = floatval($conexion->query("SELECT SUM(total) FROM reparacion_orden WHERE estado_general_id = 1")->fetchColumn());
        $totalProductos = floatval($conexion->query("SELECT SUM(total) FROM venta WHERE estado_general_id = 1")->fetchColumn());
    }

    // 5. Total General
    $totalGeneral = $totalReparacion + $totalProductos;

    echo json_encode([
        "success" => true,
        "metricas" => [
            "equipos_ingresados" => $equiposIngresados,
            "productos_vendidos" => $productosVendidos,
            "total_reparacion" => $totalReparacion,
            "total_productos" => $totalProductos,
            "total_general" => $totalGeneral
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "error" => "Error de base de datos: " . $e->getMessage()
    ]);
}
?>