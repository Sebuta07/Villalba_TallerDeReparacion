<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir correctamente la conexión desde la carpeta recepcionista hacia la raíz
include_once '../conexion.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        
        $sql = "SELECT 
                    s.servicios_id, 
                    s.nombre, 
                    s.descripcion, 
                    s.categorias_servicios_id, 
                    c.categoria AS categoria, 
                    s.fecha_registro, 
                    s.costo, 
                    s.estado_general_id 
                FROM servicios s
                LEFT JOIN categorias_servicios c ON s.categorias_servicios_id = c.categorias_servicios_id
                ORDER BY s.servicios_id DESC";

        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($servicios); // Devuelve directamente el array limpio para tu FlatList
        
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
}
?>