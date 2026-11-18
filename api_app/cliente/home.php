<?php
ini_set('display_errors', 0);
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

// URL base dinámica hacia /api_app/uploads/productos/
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$hostUrl = $_SERVER['HTTP_HOST'] ?? '192.168.1.211';
$scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/api_app/cliente/home.php'));
$baseApiUrl = rtrim("$scheme://$hostUrl$scriptDir", '/');
$uploadsProductosUrl = $baseApiUrl . '/uploads/productos/';

// 1. Obtener categorías de productos desde la BD
$stmtCat = $pdo->query("SELECT categoria_productos_id as id, nombre FROM categorias_productos WHERE estado_general_id = 1");
$categorias = $stmtCat->fetchAll();

// 2. Obtener productos destacados desde la BD
$stmtProd = $pdo->query("
    SELECT productos_id as id, nombre, precio_venta as precio, descripcion as specs, imagen 
    FROM productos 
    WHERE estado_general_id = 1 
    ORDER BY es_destacado DESC, productos_id ASC 
    LIMIT 4
");
$productos = $stmtProd->fetchAll();

foreach ($productos as &$p) {
    $p['id'] = (int)$p['id'];
    $p['precio'] = (float)$p['precio'];
    $p['rating'] = '4.9 (120+)';
    $p['badge_text'] = 'TALLER PRO';

    $rawImg = trim((string)($p['imagen'] ?? ''));
    if ($rawImg === '') {
        $p['img'] = $uploadsProductosUrl . 'logo.png';
    } elseif (preg_match('/^https?:\/\//i', $rawImg)) {
        $p['img'] = $rawImg;
    } else {
        $cleanFile = preg_replace('#^/?(api_app/)?uploads/productos/#i', '', $rawImg);
        $p['img'] = $uploadsProductosUrl . ltrim($cleanFile, '/');
    }
}
unset($p);

// 3. Cargar datos del usuario logueado
$usuario_id = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : 3;
$stmtUser = $pdo->prepare("SELECT usuario_id, username, nombre, apellido, email FROM usuarios WHERE usuario_id = ?");
$stmtUser->execute([$usuario_id]);
$usuarioLogueado = $stmtUser->fetch();

// 4. Calcular notificaciones sin leer (misma lógica exacta que notificaciones.php)
$notificacionesNoLeidas = 0;

if ($usuario_id > 0) {
    $clavesLeidas = [];
    try {
        $stmtLeidas = $pdo->prepare("SELECT notif_clave FROM notificaciones_leidas_usuario WHERE usuario_id = ?");
        $stmtLeidas->execute([$usuario_id]);
        foreach ($stmtLeidas->fetchAll(PDO::FETCH_COLUMN) as $clave) {
            $clavesLeidas[$clave] = true;
        }
    } catch (Exception $e) {
        // Si la tabla todavía no existe, continúa sin interrumpir
    }

    // A) Mensajes directos en notificaciones_cliente
    try {
        $stmtMsg = $pdo->prepare("
            SELECT notificacion_id, leida
            FROM notificaciones_cliente
            WHERE usuario_id = ?
            ORDER BY fecha_creacion DESC
            LIMIT 40
        ");
        $stmtMsg->execute([$usuario_id]);
        foreach ($stmtMsg->fetchAll() as $m) {
            $clave = "msg-" . intval($m['notificacion_id']);
            $leida = (intval($m['leida']) === 1) || isset($clavesLeidas[$clave]);
            if (!$leida) {
                $notificacionesNoLeidas++;
            }
        }
    } catch (Exception $e) {
        // Silencioso si no existe la tabla
    }

    // B) Eventos dinámicos generados por cada orden del cliente
    try {
        $sqlOrdenes = "
            SELECT 
                ro.reparacion_orden_id,
                ro.diagnostico_cliente,
                ro.diagnostico_tecnico AS ro_diag_tecnico,
                ro.total,
                ro.monto_seña AS monto_sena,
                ro.pagado,
                ro.estados_or_id,
                MAX(r.estado_envio) AS estado_envio,
                MAX(r.diagnostico_tecnico) AS rep_diag_tecnico
            FROM reparacion_orden ro
            LEFT JOIN reparacion r ON r.reparacion_orden_id = ro.reparacion_orden_id
            WHERE ro.usuario_id = ? AND ro.estado_general_id = 1
            GROUP BY ro.reparacion_orden_id
        ";
        $stmtOrd = $pdo->prepare($sqlOrdenes);
        $stmtOrd->execute([$usuario_id]);

        foreach ($stmtOrd->fetchAll() as $ord) {
            $ordenId = intval($ord['reparacion_orden_id']);
            $estadoId = intval($ord['estados_or_id']);
            $total = floatval($ord['total']);
            $sena = floatval($ord['monto_sena']);
            $pagado = floatval($ord['pagado']);

            // Estado (solo 1, 2 y 3 arrancan como no leídas; 4, 5 y 6 nacen leídas)
            if (in_array($estadoId, [1, 2, 3], true)) {
                $claveEstado = "ord-estado-$estadoId-$ordenId";
                if (!isset($clavesLeidas[$claveEstado])) {
                    $notificacionesNoLeidas++;
                }
            }

            // Presupuesto
            if ($total > 0) {
                $clavePresup = "ord-presup-$ordenId-$total";
                if (!isset($clavesLeidas[$clavePresup])) {
                    $notificacionesNoLeidas++;
                }
            }

            // Seña / Pago
            if ($sena > 0 || $pagado > 0) {
                $montoMostrar = $pagado > 0 ? $pagado : $sena;
                $claveSena = "ord-sena-$ordenId-$montoMostrar";
                if (!isset($clavesLeidas[$claveSena])) {
                    $notificacionesNoLeidas++;
                }
            }

            // Diagnóstico
            $diagTexto = $ord['rep_diag_tecnico'] ?: ($ord['ro_diag_tecnico'] ?: $ord['diagnostico_cliente']);
            if (!empty($diagTexto)) {
                $claveDiag = "ord-diag-$ordenId";
                if (!isset($clavesLeidas[$claveDiag])) {
                    $notificacionesNoLeidas++;
                }
            }

            // Envío / Logística
            if (!empty($ord['estado_envio'])) {
                $claveEnvio = "ord-envio-$ordenId";
                if (!isset($clavesLeidas[$claveEnvio])) {
                    $notificacionesNoLeidas++;
                }
            }
        }
    } catch (Exception $e) {
        // Silencioso
    }
}

// 5. Promociones y Reseñas para el home
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
    "notificaciones_no_leidas" => $notificacionesNoLeidas,
    "categorias" => $categorias,
    "productos_destacados" => $productos,
    "promociones" => $promociones,
    "resenas" => $resenas
], JSON_UNESCAPED_UNICODE);