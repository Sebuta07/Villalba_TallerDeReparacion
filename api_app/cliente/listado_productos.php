<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir la conexión centralizada desde la raíz de api_app
require_once __DIR__ . '/../conexion.php';

try {
    // 1. Obtener categorías activas de productos
    $stmtCat = $conexion->query("SELECT categoria_productos_id as id, nombre FROM categorias_productos WHERE estado_general_id = 1");
    $categorias = $stmtCat->fetchAll(PDO::FETCH_ASSOC);

    // 2. Obtener productos activos haciendo JOIN con su categoría (corregido sin la 's' extra)
    $sql = "SELECT 
                p.productos_id as id,
                p.nombre,
                p.descripcion,
                p.precio_venta,
                p.stock_disponible as stock,
                p.imagen,
                cp.nombre as categoria_nombre,
                cp.categoria_productos_id as categoria_id
            FROM productos p
            INNER JOIN categorias_productos cp ON p.categoria_productos_id = cp.categoria_productos_id
            WHERE p.estado_general_id = 1";

    $stmtProd = $conexion->query($sql);
    $productos = $stmtProd->fetchAll(PDO::FETCH_ASSOC);

    // Formatear tipos de datos y rutas de imágenes
    foreach ($productos as &$prod) {
        $prod['precio_venta'] = (float)$prod['precio_venta'];
        $prod['stock'] = (int)$prod['stock'];
        $prod['imagen'] = !empty($prod['imagen']) 
            ? 'http://192.168.1.211/api_app/uploads/productos/' . $prod['imagen'] 
            : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=85';
    }

    echo json_encode([
        "estado" => "success",
        "categorias" => $categorias ?: [],
        "productos" => $productos ?: []
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "estado" => "error", 
        "mensaje" => "Error al obtener productos: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>