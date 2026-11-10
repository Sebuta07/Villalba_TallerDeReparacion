<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../conexion.php';

try {
    $query = "SELECT 
                p.productos_id, 
                p.nombre, 
                p.descripcion, 
                p.precio_venta, 
                p.garantia, 
                p.observaciones,
                p.imagen,
                p.estado_general_id,
                c.nombre AS categoria,
                m.nombre AS marca,
                mo.nombre AS modelo,
                cp.codigo AS codigo_barra
              FROM productos p
              LEFT JOIN categorias_productos c ON p.categoria_productos_id = c.categoria_productos_id
              LEFT JOIN marca m ON p.marca_id = m.marca_id
              LEFT JOIN modelo mo ON p.modelo_id = mo.modelo_id
              LEFT JOIN codigo_productos cp ON p.codigo_producto_id = cp.codigo_producto_id
              WHERE p.estado_general_id != 2"; // Corregido al nombre exacto de tu columna

    $stmt = $conexion->prepare($query);
    $stmt->execute();
    $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($resultado) {
        echo json_encode([
            "estado" => "success",
            "datos" => $resultado
        ]);
    } else {
        echo json_encode([
            "estado" => "success",
            "datos" => []
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "estado" => "error",
        "mensaje" => $e->getMessage()
    ]);
}
?>