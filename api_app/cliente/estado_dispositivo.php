<?php
if (ob_get_length()) ob_clean();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../conexion.php';
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}
if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }

try {
    $conexion->exec("SET NAMES utf8mb4");
} catch (Exception $e) {}

$method = $_SERVER['REQUEST_METHOD'];
$accionGet = $_GET['accion'] ?? '';

$mp_access_token = "APP_USR-7568207963537239-110920-78b39e869228617828811cb86b39105d-3784910404";
$ngrok_base_url = "https://outmost-grew-spearmint.ngrok-free.dev";

// GET: Obtener órdenes y métodos de pago (sin efectivo)
if ($method === 'GET') {
    $usuario_id = $_GET['usuario_id'] ?? null;

    if (!$usuario_id) {
        echo json_encode(["estado" => "error", "mensaje" => "Falta el parámetro usuario_id"]);
        exit;
    }

    try {
        $stmtMetodos = $conexion->query("
            SELECT formas_pago_id as id, forma as nombre 
            FROM formas_pago 
            WHERE estado_general_id = 1 
              AND LOWER(forma) NOT LIKE '%efectivo%'
            ORDER BY formas_pago_id ASC
        ");
        $metodos_pago = $stmtMetodos->fetchAll(PDO::FETCH_ASSOC);

        $sql = "SELECT 
                    ro.reparacion_orden_id as orden_id,
                    ro.fecha_registro,
                    ro.total,
                    ro.`monto_seña` as monto_seña,
                    ro.codigo_seguridad,
                    ro.diagnostico_cliente,
                    ro.pagado,
                    ro.estados_or_id,
                    eo.nombre as estado_orden,
                    s.nombre as servicio_nombre,
                    ce.nombre as categoria_nombre,
                    me.marcas_equipos as marca_nombre,
                    mo.modelo_equipos as modelo_nombre,
                    eq.numero_serie,
                    eq.imei
                FROM reparacion_orden ro
                LEFT JOIN equipos eq ON ro.equipo_id = eq.equipo_id
                LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
                LEFT JOIN servicios s ON ro.servicios_id = s.servicios_id
                LEFT JOIN categorias_equipo ce ON eq.categoria_equipo_id = ce.categoria_id
                LEFT JOIN marcas_equipos me ON eq.marca_equipo_id = me.marca_equipo_id
                LEFT JOIN modelo_equipos mo ON eq.modelo_equipo_id = mo.modelo_equipo_id
                WHERE ro.usuario_id = ?
                ORDER BY ro.fecha_registro DESC";

        $stmt = $conexion->prepare($sql);
        $stmt->execute([$usuario_id]);
        $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($ordenes as &$orden) {
            $orden['estado_orden'] = $orden['estado_orden'] ?? 'Pendiente';
            $orden['servicio_nombre'] = $orden['servicio_nombre'] ?? 'Servicio Técnico';
            $stmtNotas = $conexion->prepare("SELECT remitente, mensaje, fecha FROM notas_reparacion WHERE reparacion_orden_id = ? ORDER BY fecha ASC");
            $stmtNotas->execute([$orden['orden_id']]);
            $orden['notas'] = $stmtNotas->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode([
            "estado" => "success",
            "metodos_pago" => $metodos_pago ?: [],
            "ordenes" => $ordenes ?: []
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
    }
    exit;
}

// POST ?accion=crear_preferencia: Generar QR / preferencia de Mercado Pago
if ($method === 'POST' && $accionGet === 'crear_preferencia') {
    try {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $orden_id = $input['reparacion_orden_id'] ?? null;
        $monto = floatval($input['monto'] ?? 0);

        if (!$orden_id || $monto <= 0) {
            echo json_encode(["success" => false, "message" => "Monto u orden inválida para Mercado Pago."]);
            exit();
        }

        // Verificar que la orden no esté cancelada ni entregada
        $stmtEstado = $conexion->prepare("
            SELECT ro.estados_or_id, eo.nombre as estado_nombre 
            FROM reparacion_orden ro
            LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
            WHERE ro.reparacion_orden_id = ?
        ");
        $stmtEstado->execute([$orden_id]);
        $estRow = $stmtEstado->fetch(PDO::FETCH_ASSOC);
        $estNombre = mb_strtolower($estRow['estado_nombre'] ?? '', 'UTF-8');
        $estId = intval($estRow['estados_or_id'] ?? 0);

        if (in_array($estId, [4, 5, 6]) || strpos($estNombre, 'cancelad') !== false || strpos($estNombre, 'entregad') !== false) {
            echo json_encode(["success" => false, "message" => "Esta orden ya se encuentra entregada o cancelada y no admite pagos."]);
            exit();
        }

        $preferenceData = [
            "items" => [
                [
                    "title" => "Orden de Reparación #" . $orden_id,
                    "quantity" => 1,
                    "unit_price" => $monto,
                    "currency_id" => "ARS"
                ]
            ],
            "back_urls" => [
                "success" => $ngrok_base_url . "/recepcionista/pago_exitoso.php",
                "failure" => $ngrok_base_url . "/recepcionista/pago_fallido.php",
                "pending" => $ngrok_base_url . "/recepcionista/pago_pendiente.php"
            ],
            "auto_return" => "approved",
            "external_reference" => strval($orden_id)
        ];

        $options = [
            'http' => [
                'header'  => "Content-Type: application/json\r\n" .
                             "Authorization: Bearer " . $mp_access_token . "\r\n",
                'method'  => 'POST',
                'content' => json_encode($preferenceData),
                'ignore_errors' => true
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents('https://api.mercadopago.com/checkout/preferences', false, $context);

        if ($response === FALSE) {
            echo json_encode(["success" => false, "message" => "Error de conexión con la API de Mercado Pago."]);
            exit();
        }

        $result = json_decode($response, true);

        if (!isset($result['init_point'])) {
            echo json_encode(["success" => false, "message" => "Respuesta inválida de Mercado Pago: " . $response]);
            exit();
        }

        echo json_encode([
            "success" => true,
            "init_point" => $result['init_point'],
            "sandbox_init_point" => $result['sandbox_init_point'] ?? null
        ]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error interno API MP: " . $e->getMessage()]);
    }
    exit();
}

// POST: Procesar pago o chat
if ($method === 'POST') {
    $accion = $_POST['accion'] ?? 'mensaje';

    if ($accion === 'pagar') {
        $orden_id = $_POST['reparacion_orden_id'] ?? null;
        $monto_a_pagar = floatval($_POST['monto'] ?? 0);
        $metodo_pago = $_POST['metodo_pago'] ?? 'Mercado Pago';
        $referencia = trim($_POST['referencia'] ?? '');

        if (!$orden_id || $monto_a_pagar <= 0) {
            echo json_encode(["success" => false, "error" => "El monto a pagar debe ser mayor a 0"]);
            exit;
        }

        try {
            $stmtCheck = $conexion->prepare("
                SELECT ro.total, ro.pagado, ro.estados_or_id, eo.nombre as estado_nombre
                FROM reparacion_orden ro
                LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
                WHERE ro.reparacion_orden_id = ?
            ");
            $stmtCheck->execute([$orden_id]);
            $ordenData = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if (!$ordenData) {
                echo json_encode(["success" => false, "error" => "Orden no encontrada"]);
                exit;
            }

            $estadoNombre = mb_strtolower($ordenData['estado_nombre'] ?? '', 'UTF-8');
            $estadoId = intval($ordenData['estados_or_id'] ?? 0);

            // Bloquear si está Cancelado (4), Entregado (5) o Entregado al Cliente (6)
            if (in_array($estadoId, [4, 5, 6]) || strpos($estadoNombre, 'cancelad') !== false || strpos($estadoNombre, 'entregad') !== false) {
                echo json_encode(["success" => false, "error" => "No se pueden registrar pagos en órdenes entregadas o canceladas."]);
                exit;
            }

            $totalOrden = floatval($ordenData['total']);
            $pagadoActual = floatval($ordenData['pagado']);
            $nuevoPagado = $pagadoActual + $monto_a_pagar;

            if ($nuevoPagado > $totalOrden) {
                $nuevoPagado = $totalOrden;
            }

            $stmtUpd = $conexion->prepare("UPDATE reparacion_orden SET pagado = ? WHERE reparacion_orden_id = ?");
            $stmtUpd->execute([$nuevoPagado, $orden_id]);

            $refTxt = $referencia !== '' ? " (Ref: {$referencia})" : "";
            $msgNota = "💳 Pago registrado por $" . number_format($monto_a_pagar, 2, ',', '.') . 
                       " vía [{$metodo_pago}]{$refTxt}. Acumulado: $" . number_format($nuevoPagado, 2, ',', '.') . " / $" . number_format($totalOrden, 2, ',', '.');
            
            $stmtNota = $conexion->prepare("INSERT INTO notas_reparacion (reparacion_orden_id, remitente, mensaje, fecha) VALUES (?, 'cliente', ?, NOW())");
            $stmtNota->execute([$orden_id, $msgNota]);

            echo json_encode(["success" => true, "mensaje" => "¡Pago registrado con éxito!"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
        exit;
    }

    $orden_id = $_POST['reparacion_orden_id'] ?? null;
    $mensaje = $_POST['mensaje'] ?? '';

    if (!$orden_id || empty(trim($mensaje))) {
        echo json_encode(["success" => false, "error" => "Datos incompletos"]);
        exit;
    }

    try {
        $stmt = $conexion->prepare("INSERT INTO notas_reparacion (reparacion_orden_id, remitente, mensaje, fecha) VALUES (?, 'cliente', ?, NOW())");
        $stmt->execute([$orden_id, trim($mensaje)]);

        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}
?>