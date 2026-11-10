<?php
if (ob_get_length()) ob_clean();

ini_set('display_errors', 0);
error_reporting(E_ALL);

// Forzar errores visibles para salir de dudas
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . '/../conexion.php';
    require_once __DIR__ . '/../vendor/autoload.php';
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error de rutas o dependencias: " . $e->getMessage()]);
    exit();
}

if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }

$method = $_SERVER['REQUEST_METHOD'];
$accion = $_GET['accion'] ?? '';

$mp_access_token = "APP_USR-7568207963537239-110920-78b39e869228617828811cb86b39105d-3784910404"; 
$ngrok_base_url = "https://outmost-grew-spearmint.ngrok-free.dev"; 

// 1. LISTAR ORDENES LISTAS PARA ENTREGAR
if ($method === 'GET' && empty($accion)) {
    try {
        $busqueda = trim($_GET['busqueda'] ?? '');

        $sql = "SELECT 
                    ro.reparacion_orden_id,
                    ro.diagnostico_cliente,
                    ro.total AS presupuesto,
                    ro.monto_seña,
                    (ro.total - ro.monto_seña) AS saldo_pendiente,
                    ro.pagado,
                    ro.codigo_seguridad,
                    ro.tipo_entrega,
                    ro.fecha_registro,
                    ro.imagen AS orden_imagen,
                    ro.estados_or_id,
                    ro.equipo_id,
                    ro.usuario_id,
                    ro.empleado_id,
                    ro.servicios_id,
                    eo.nombre AS estado_nombre,
                    u.nombre AS cliente_nombre,
                    u.apellido AS cliente_apellido,
                    u.dni_cuit AS cliente_dni,
                    e.numero_serie,
                    e.imei,
                    me.marcas_equipos AS marca_nombre,
                    moe.modelo_equipos AS modelo_nombre,
                    fp.forma AS forma_pago_nombre
                FROM reparacion_orden ro
                INNER JOIN usuarios u ON ro.usuario_id = u.usuario_id
                INNER JOIN equipos e ON ro.equipo_id = e.equipo_id
                LEFT JOIN marcas_equipos me ON e.marca_equipo_id = me.marca_equipo_id
                LEFT JOIN modelo_equipos moe ON e.modelo_equipo_id = moe.modelo_equipo_id
                LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
                LEFT JOIN formas_pago fp ON ro.formas_pago_id = fp.formas_pago_id
                WHERE ro.estados_or_id = 3 
                  AND ro.tipo_entrega = 'sucursal'";

        $params = [];
        if (!empty($busqueda)) {
            $sql .= " AND (u.dni_cuit LIKE :busqueda OR ro.codigo_seguridad LIKE :busquedaExacta OR ro.reparacion_orden_id = :busquedaId)";
            $params[':busqueda'] = "%{$busqueda}%";
            $params[':busquedaExacta'] = $busqueda;
            $params[':busquedaId'] = is_numeric($busqueda) ? intval($busqueda) : 0;
        }

        $sql .= " ORDER BY ro.reparacion_orden_id DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->execute($params);
        $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formasPago = $conexion->query("SELECT formas_pago_id, forma FROM formas_pago WHERE estado_general_id = 1")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "ordenes" => $ordenes, "formas_pago" => $formasPago], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error al consultar: " . $e->getMessage()]);
    }
    exit();
}

// 2. CREAR PREFERENCIA DE PAGO (Usando stream_context para evitar conflictos de cURL local)
if ($method === 'POST' && $accion === 'crear_preferencia') {
    try {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $reparacion_orden_id = $input['reparacion_orden_id'] ?? null;
        $monto = floatval($input['monto'] ?? 0);

        if (!$reparacion_orden_id || $monto <= 0) {
            echo json_encode(["success" => false, "message" => "Monto u orden inválida para Mercado Pago."]);
            exit();
        }

        $preferenceData = [
            "items" => [
                [
                    "title" => "Orden de Reparación #" . $reparacion_orden_id,
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
            "external_reference" => strval($reparacion_orden_id)
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
        echo json_encode(["success" => false, "message" => "Error interno SDK/API: " . $e->getMessage()]);
    }
    exit();
}

// 3. CONFIRMAR LA ENTREGA Y REGISTRAR EN LA BASE DE DATOS
if ($method === 'POST' && empty($accion)) {
    try {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $reparacion_orden_id = $input['reparacion_orden_id'] ?? null;
        $pagos = $input['pagos'] ?? [];
        $empleado_id = $input['empleado_id'] ?? null;

        if (!$reparacion_orden_id || !$empleado_id) {
            echo json_encode(["success" => false, "message" => "Faltan datos obligatorios (Orden o Empleado)."]);
            exit();
        }

        $conexion->beginTransaction();

        $stmtOrd = $conexion->prepare("SELECT * FROM reparacion_orden WHERE reparacion_orden_id = :id");
        $stmtOrd->execute([':id' => $reparacion_orden_id]);
        $orden = $stmtOrd->fetch(PDO::FETCH_ASSOC);

        if (!$orden || $orden['estados_or_id'] != 3) {
            $conexion->rollBack();
            echo json_encode(["success" => false, "message" => "La orden no está disponible para entregar."]);
            exit();
        }

        $stmtVenta = $conexion->prepare("INSERT INTO venta (fecha_venta, total, empleado_id, usuario_id, estado_general_id) VALUES (NOW(), :total, :empleado_id, :usuario_id, 1)");
        $stmtVenta->execute([
            ':total' => $orden['total'],
            ':empleado_id' => $empleado_id,
            ':usuario_id' => $orden['usuario_id']
        ]);
        $venta_id = $conexion->lastInsertId();

        foreach ($pagos as $pago) {
            $forma_pago_id = $pago['forma_pago_id'];
            $montoPago = $pago['monto'];

            $stmtDetVenta = $conexion->prepare("INSERT INTO detalle_venta (forma_pago_id, cantidad, subtotal, venta_id, estado_general_id, observaciones, servicio_id, producto_id) 
                                                VALUES (:forma_pago_id, 1, :subtotal, :venta_id, 1, :obs, :servicio_id, NULL)");
            $stmtDetVenta->execute([
                ':forma_pago_id' => $forma_pago_id,
                ':subtotal' => $montoPago,
                ':venta_id' => $venta_id,
                ':obs' => "Pago de servicio técnico orden #" . $reparacion_orden_id,
                ':servicio_id' => $orden['servicios_id']
            ]);
        }

        $primaryPagoId = !empty($pagos) ? $pagos[0]['forma_pago_id'] : $orden['formas_pago_id'];
        $stmtDetRep = $conexion->prepare("INSERT INTO detalle_reparacion (equipo_id, forma_pago_id, subtotal, reparacion_orden_id, hora_venta, garantia, estado_general_id, observaciones) 
                                            VALUES (:equipo_id, :forma_pago_id, :subtotal, :reparacion_orden_id, NOW(), 1, 1, :obs)");
        $stmtDetRep->execute([
            ':equipo_id' => $orden['equipo_id'],
            ':forma_pago_id' => $primaryPagoId,
            ':subtotal' => $orden['total'],
            ':reparacion_orden_id' => $reparacion_orden_id,
            ':obs' => "Reparación Orden #" . $reparacion_orden_id
        ]);

        $stmtUpd = $conexion->prepare("UPDATE reparacion_orden SET estados_or_id = 5, pagado = 1, empleado_id = :empleado_id WHERE reparacion_orden_id = :id");
        $stmtUpd->execute([
            ':empleado_id' => $empleado_id,
            ':id' => $reparacion_orden_id
        ]);

        $conexion->commit();
        echo json_encode(["success" => true, "message" => "¡Entrega registrada y venta guardada correctamente!"]);
    } catch (Exception $e) {
        if ($conexion->inTransaction()) $conexion->rollBack();
        echo json_encode(["success" => false, "message" => "Error al procesar: " . $e->getMessage()]);
    }
    exit();
}
?>