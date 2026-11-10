<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "127.0.0.1";
$db   = "taller_electronica";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (Exception $e) {
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
    exit;
}

// 1. Obtener categorías de productos desde la BD
$stmtCat = $pdo->query("SELECT categoria_productos_id as id, nombre FROM categorias_productos WHERE estado_general_id = 1");
$categorias = $stmtCat->fetchAll();

// 2. Obtener productos destacados desde la BD
$stmtProd = $pdo->query("SELECT productos_id as id, nombre, precio_venta as precio, descripcion as specs, imagen FROM productos WHERE estado_general_id = 1 LIMIT 4");
$productos = $stmtProd->fetchAll();

foreach ($productos as &$p) {
    $p['rating'] = '4.9 (120+)';
    $p['badge_text'] = 'TALLER PRO';
    $p['img'] = !empty($p['imagen']) ? 'http://192.168.1.211/api_app/uploads/' . $p['imagen'] : 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=85';
}

// 3. Cargar datos del usuario logueado de forma dinámica (recibe usuario_id por GET)
$usuario_id = $_GET['usuario_id'] ?? 3;
$stmtUser = $pdo->prepare("SELECT usuario_id, username, nombre, apellido, email FROM usuarios WHERE usuario_id = ?");
$stmtUser->execute([$usuario_id]);
$usuarioLogueado = $stmtUser->fetch();

// 4. Promociones y Reseñas de respaldo para el home
$promociones = [
    [
        'tipo' => 'productos',
        'titulo' => 'Módulos y Displays Originales',
        'descripcion' => 'Repuestos directos con garantía y stock inmediato en sucursal.',
        'precio_viejo' => 60000,
        'precio_nuevo' => 50000,
        'badge' => 'PROMO PRODUCTO · 15% OFF'
    ],
    [
        'tipo' => 'servicios',
        'titulo' => 'Mantenimiento Full Notebook & Consola',
        'descripcion' => 'Limpieza profunda, recambio de pasta térmica y pads de alta gama.',
        'precio_viejo' => 60000,
        'precio_nuevo' => 45000,
        'badge' => 'PROMO SERVICIO · TALLER'
    ]
];

$resenas = [
    ['id_resena' => 1, 'nombre_cliente' => 'Noelia Jacquelin', 'calificacion' => 5, 'comentario' => 'Excelente precisión en el diagnóstico de los equipos.'],
    ['id_resena' => 2, 'nombre_cliente' => 'Felipe Vergara', 'calificacion' => 5, 'comentario' => 'Muy buena atención y rapidez en la entrega del taller.']
];

echo json_encode([
    "usuario_logueado" => $usuarioLogueado,
    "categorias" => $categorias,
    "productos_destacados" => $productos,
    "promociones" => $promociones,
    "resenas" => $resenas
], JSON_UNESCAPED_UNICODE);
?>