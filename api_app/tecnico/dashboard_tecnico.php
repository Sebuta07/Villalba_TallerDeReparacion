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
    $user = 'root';$pass = '';

    $conexion = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);$conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Cola de Ingreso (Pendientes)
    $sqlPendientes = "SELECT COUNT(*) FROM reparacion_orden WHERE estados_or_id = 1 AND estado_general_id = 1";
    $pendientes = $conexion->query($sqlPendientes)->fetchColumn();

    // 2. Frenados / En Proceso
    $sqlEnProceso = "SELECT COUNT(*) FROM reparacion_orden WHERE estados_or_id = 2 AND estado_general_id = 1";
    $enProceso = $conexion->query($sqlEnProceso)->fetchColumn();

    // 3. Productividad del Día (Finalizados o Entregados)
    $hoy = date('Y-m-d');$sqlProductividadFallback = "SELECT COUNT(*) FROM reparacion_orden WHERE estados_or_id IN (3, 5, 6) AND estado_general_id = 1 AND DATE(fecha_registro) = '$hoy'";
    $productividad = $conexion->query($sqlProductividadFallback)->fetchColumn();
    if ($productividad == 0) {$sqlHist = "SELECT COUNT(*) FROM reparacion_orden WHERE estados_or_id IN (3, 5, 6) AND estado_general_id = 1";
        $productividad_hist = $conexion->query($sqlHist)->fetchColumn();
    } else {
        $productividad_hist =$productividad;
    }

    // 4. Diagnósticos realizados históricamente
    $sqlDiag = "SELECT COUNT(*) FROM reparacion_orden WHERE diagnostico_tecnico IS NOT NULL AND diagnostico_tecnico != '' AND estado_general_id = 1";
    $diagnosticos = $conexion->query($sqlDiag)->fetchColumn();

    // 5. Total de Equipos entregados
    $sqlEntregados = "SELECT COUNT(*) FROM reparacion_orden WHERE estados_or_id IN (5, 6) AND estado_general_id = 1";
    $entregados = $conexion->query($sqlEntregados)->fetchColumn();

    // 6. Top Categorías Reparadas (Gráfico horizontal)
    $sqlTopCat = "
        SELECT ce.nombre AS categoria, COUNT(ro.reparacion_orden_id) AS cantidad
        FROM reparacion_orden ro
        INNER JOIN equipos e ON ro.equipo_id = e.equipo_id
        INNER JOIN categorias_equipo ce ON e.categoria_equipo_id = ce.categoria_id
        WHERE ro.estado_general_id = 1
        GROUP BY ce.categoria_id
        ORDER BY cantidad DESC
        LIMIT 4
    ";
    $topCategorias = $conexion->query($sqlTopCat)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "metricas" => [
            "cola_ingreso" => intval($pendientes),
            "en_proceso" => intval($enProceso),
            "finalizados_hoy" => intval($productividad_hist),
            "diagnosticos_realizados" => intval($diagnosticos),
            "equipos_entregados" => intval($entregados)
        ],
        "top_categorias" => $topCategorias ?: []
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "error" => "Error de base de datos: " . $e->getMessage()
    ]);
}
?>