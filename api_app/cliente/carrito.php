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

$method = $_SERVER['REQUEST_METHOD'];
$accion = $_GET['accion'] ?? '';

$mp_access_token = "APP_USR-7568207963537239-110920-78b39e869228617828811cb86b39105d-3784910404";
$ngrok_base_url = "https://outmost-grew-spearmint.ngrok-free.dev";

// 1. GET: DEVOLVER FORMAS DE PAGO DISPONIBLES PARA APP MÓVIL (SIN EFECTIVO)
if ($method === 'GET') {
    try {
        $stmt = $conexion->query("
            SELECT formas_pago_id, forma 
            FROM formas_pago 
            WHERE estado_general_id = 1 
              AND LOWER(forma) NOT LIKE '%efectivo%'
            ORDER BY formas_pago_id ASC
        ");
        $formas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "formas_pago" => $formas
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

// 2. POST ?accion=crear_preferencia: GENERAR PREFERENCIA DE MERCADO PAGO PARA QR
if ($method === 'POST' && $accion === 'crear_preferencia') {
    try {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $usuario_id = $input['usuario_id'] ?? 0;
        $monto = floatval($input['monto'] ?? 0);

        if ($monto <= 0) {
            echo json_encode(["success" => false, "message" => "Monto inválido para Mercado Pago."]);
            exit();
        }

        $preferenceData = [
            "items" => [
                [
                    "title" => "Compra Fénix Lab - Cliente #" . $usuario_id,
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
            "external_reference" => "CARRITO-" . $usuario_id . "-" . time()
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

// 3. POST: REGISTRAR LA COMPRA EN BASE DE DATOS
if ($method === 'POST') {
    $usuario_id = $_POST['usuario_id'] ?? 3;
    $items_json = $_POST['items'] ?? '[]';
    $items = json_decode($items_json, true);
    $forma_pago_id = $_POST['forma_pago_id'] ?? 2;
    $tipo_entrega = $_POST['tipo_entrega'] ?? 'sucursal';

    $calle = $_POST['calle'] ?? '';
    $manzana = $_POST['manzana'] ?? '';
    $casa = $_POST['casa'] ?? '';
    $barrio = $_POST['barrio'] ?? '';
    $observaciones = $_POST['observaciones'] ?? '';

    if (empty($items)) {
        echo json_encode(["success" => false, "error" => "El carrito está vacío"]);
        exit;
    }

    try {
        $conexion->beginTransaction();

        $total = 0;
        foreach ($items as $item) {
            $total += (float)$item['precio'] * (int)$item['cantidad'];
        }

        // 1. Registrar la Venta principal
        $stmtVenta = $conexion->prepare("
            INSERT INTO venta (usuario_id, total, envio_id, empleado_id, estado_general_id, fecha_venta) 
            VALUES (?, ?, NULL, NULL, 1, NOW())
        ");
        $stmtVenta->execute([$usuario_id, $total]);
        $venta_id = $conexion->lastInsertId();

        // 2. Registrar los productos en `detalle_venta` y descontar stock
        foreach ($items as $item) {
            $producto_id = $item['id'];
            $cantidad = (int)$item['cantidad'];
            $subtotal = (float)$item['precio'] * $cantidad;

            $stmtDet = $conexion->prepare("
                INSERT INTO detalle_venta (venta_id, producto_id, cantidad, subtotal, forma_pago_id, estado_general_id) 
                VALUES (?, ?, ?, ?, ?, 1)
            ");
            $stmtDet->execute([$venta_id, $producto_id, $cantidad, $subtotal, $forma_pago_id]);

            $stmtStock = $conexion->prepare("
                UPDATE productos SET stock_disponible = stock_disponible - ? WHERE productos_id = ?
            ");
            $stmtStock->execute([$cantidad, $producto_id]);
        }

        // 3. Si es envío a domicilio, guardar dirección y datos en `detalle_envios_sucursal`
        if ($tipo_entrega === 'envio') {
            foreach ($items as $item) {
                $producto_id = $item['id'];
                $cantidad = (int)$item['cantidad'];
                $obsEnvio = "Envío a domicilio - Venta Web: " . $observaciones;

                $stmtDetEnv = $conexion->prepare("
                    INSERT INTO detalle_envios_sucursal 
                    (productos_id, cantidad, calle, manzana, casa, barrio, observaciones, estado_general_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                ");
                $stmtDetEnv->execute([$producto_id, $cantidad, $calle, $manzana, $casa, $barrio, $obsEnvio]);
            }
        }

        $codigo_comprobante = 'CMP-' . str_pad($venta_id, 6, '0', STR_PAD_LEFT);

        $conexion->commit();
        echo json_encode([
            "success" => true,
            "venta_id" => $venta_id,
            "total" => $total,
            "codigo_comprobante" => $codigo_comprobante,
            "tipo_entrega" => $tipo_entrega
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>