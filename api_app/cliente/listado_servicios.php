<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../conexion.php';

try {
    // 1. Obtener categorías de servicios activas
    $stmtCat = $conexion->query("SELECT categorias_servicios_id as id, categoria as nombre FROM categorias_servicios WHERE estado_general_id = 1");
    $categorias = $stmtCat->fetchAll(PDO::FETCH_ASSOC);

    // 2. Obtener servicios activos combinados con sus categorías
    $sql = "SELECT 
                s.servicios_id as id,
                s.nombre,
                s.descripcion,
                s.costo,
                s.categorias_servicios_id as categoria_id,
                cs.categoria as categoria_nombre,
                s.imagen
            FROM servicios s
            LEFT JOIN categorias_servicios cs ON s.categorias_servicios_id = cs.categorias_servicios_id
            WHERE s.estado_general_id = 1";

    $stmtServ = $conexion->query($sql);
    $serviciosCrudos = $stmtServ->fetchAll(PDO::FETCH_ASSOC);

    $servicios = [];
    foreach ($serviciosCrudos as $serv) {
        // Manejo de imagen: si tiene archivo cargado usa la ruta del servidor, sino una por defecto
        $imgUrl = !empty($serv['imagen']) 
            ? 'http://192.168.1.211/api_app/uploads/servicios/' . $serv['imagen'] 
            : 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=85';

        $servicios[] = [
            "id" => (int)$serv['id'],
            "nombre" => $serv['nombre'],
            "descripcion" => $serv['descripcion'],
            "costo" => (float)$serv['costo'],
            "categoria_id" => (int)$serv['categoria_id'],
            "categoria_nombre" => $serv['categoria_nombre'] ?? 'General',
            "imagen" => $imgUrl
        ];
    }

    echo json_encode([
        "estado" => "success",
        "categorias" => $categorias ?: [],
        "servicios" => $servicios ?: []
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "estado" => "error",
        "mensaje" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>