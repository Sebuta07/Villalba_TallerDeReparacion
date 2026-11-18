<?php
ini_set('display_errors', 0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../conexion.php';
if (!isset($conexion) && isset($pdo)) {
    $conexion = $pdo;
}

function asegurarTablasNotificaciones(PDO $db): void {
    try {
        $db->exec("
            CREATE TABLE IF NOT EXISTS notificaciones_cliente (
                notificacion_id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                reparacion_orden_id INT NULL,
                tipo VARCHAR(40) NOT NULL DEFAULT 'mensaje',
                titulo VARCHAR(150) NOT NULL,
                mensaje TEXT NOT NULL,
                leida TINYINT(1) NOT NULL DEFAULT 0,
                fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS notificaciones_leidas_usuario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                notif_clave VARCHAR(140) NOT NULL,
                fecha_leida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_user_notif (usuario_id, notif_clave)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
    } catch (Exception $e) {
        // Silencioso si no hay permisos DDL
    }
}

function obtenerNotificacionesCliente(PDO $db, int $usuario_id): array {
    asegurarTablasNotificaciones($db);

    $clavesLeidas = [];
    try {
        $stmtLeidas = $db->prepare("SELECT notif_clave FROM notificaciones_leidas_usuario WHERE usuario_id = ?");
        $stmtLeidas->execute([$usuario_id]);
        foreach ($stmtLeidas->fetchAll(PDO::FETCH_COLUMN) as $clave) {
            $clavesLeidas[$clave] = true;
        }
    } catch (Exception $e) {
        // Ignorar si la tabla no existe aún
    }

    $listaNotificaciones = [];

    // 1. Mensajes directos en notificaciones_cliente
    $stmtMsg = $db->prepare("
        SELECT 
            notificacion_id,
            reparacion_orden_id,
            tipo,
            titulo,
            mensaje,
            leida,
            fecha_creacion
        FROM notificaciones_cliente
        WHERE usuario_id = ?
        ORDER BY fecha_creacion DESC
        LIMIT 40
    ");
    $stmtMsg->execute([$usuario_id]);
    $mensajesDirectos = $stmtMsg->fetchAll(PDO::FETCH_ASSOC);

    foreach ($mensajesDirectos as $m) {
        $clave = "msg-" . intval($m['notificacion_id']);
        $leida = (intval($m['leida']) === 1) || isset($clavesLeidas[$clave]);
        $listaNotificaciones[] = [
            "id" => $clave,
            "notificacion_id" => intval($m['notificacion_id']),
            "reparacion_orden_id" => $m['reparacion_orden_id'] ? intval($m['reparacion_orden_id']) : null,
            "categoria" => $m['tipo'] ?: 'mensaje',
            "titulo" => $m['titulo'],
            "descripcion" => $m['mensaje'],
            "fecha" => $m['fecha_creacion'],
            "leida" => $leida
        ];
    }

    // 2. Eventos dinámicos de órdenes
    $sqlOrdenes = "
        SELECT 
            ro.reparacion_orden_id,
            ro.diagnostico_cliente,
            ro.diagnostico_tecnico AS ro_diag_tecnico,
            ro.total,
            ro.monto_seña AS monto_sena,
            ro.pagado,
            ro.estados_or_id,
            ro.empleado_id,
            ro.tipo_entrega,
            ro.fecha_registro,
            eo.nombre AS estado_nombre,
            COALESCE(me.marcas_equipos, 'Equipo') AS marca,
            COALESCE(mo.modelo_equipos, '') AS modelo,
            CONCAT(emp.nombre, ' ', emp.apellido) AS tecnico_nombre,
            MAX(r.estado_envio) AS estado_envio,
            MAX(r.diagnostico_tecnico) AS rep_diag_tecnico
        FROM reparacion_orden ro
        INNER JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
        LEFT JOIN equipos e ON ro.equipo_id = e.equipo_id
        LEFT JOIN marcas_equipos me ON e.marca_equipo_id = me.marca_equipo_id
        LEFT JOIN modelo_equipos mo ON e.modelo_equipo_id = mo.modelo_equipo_id
        LEFT JOIN usuarios emp ON ro.empleado_id = emp.usuario_id
        LEFT JOIN reparacion r ON r.reparacion_orden_id = ro.reparacion_orden_id
        WHERE ro.usuario_id = ? AND ro.estado_general_id = 1
        GROUP BY ro.reparacion_orden_id
        ORDER BY ro.reparacion_orden_id DESC
    ";
    $stmtOrd = $db->prepare($sqlOrdenes);
    $stmtOrd->execute([$usuario_id]);
    $ordenes = $stmtOrd->fetchAll(PDO::FETCH_ASSOC);

    $agregarItem = function (array $item) use (&$listaNotificaciones, $clavesLeidas) {
        $clave = $item['id'];
        $item['leida'] = !empty($item['leida']) || isset($clavesLeidas[$clave]);
        $listaNotificaciones[] = $item;
    };

    foreach ($ordenes as $ord) {
        $ordenId = intval($ord['reparacion_orden_id']);
        $equipo = trim($ord['marca'] . ' ' . $ord['modelo']);
        $estadoId = intval($ord['estados_or_id']);
        $total = floatval($ord['total']);
        $sena = floatval($ord['monto_sena']);
        $pagado = floatval($ord['pagado']);
        $tecnico = trim($ord['tecnico_nombre'] ?? '');
        $fechaBase = $ord['fecha_registro'] ?: date('Y-m-d H:i:s');

        if ($estadoId === 1) {
            $agregarItem([
                "id" => "ord-estado-1-$ordenId",
                "notificacion_id" => null,
                "reparacion_orden_id" => $ordenId,
                "categoria" => "estado",
                "titulo" => "Orden #$ordenId en estado Pendiente",
                "descripcion" => "Tu $equipo está registrado en cola de ingreso esperando asignación o revisión técnica.",
                "fecha" => $fechaBase,
                "leida" => false
            ]);
        } elseif ($estadoId === 2) {
            $descTecnico = $tecnico
                ? "El técnico $tecnico tomó tu orden y está trabajando en tu $equipo."
                : "Un técnico tomó tu orden y ya está revisando tu $equipo.";
            $agregarItem([
                "id" => "ord-estado-2-$ordenId",
                "notificacion_id" => null,
                "reparacion_orden_id" => $ordenId,
                "categoria" => "tecnico",
                "titulo" => "Orden #$ordenId tomada por el taller",
                "descripcion" => $descTecnico,
                "fecha" => $fechaBase,
                "leida" => false
            ]);
        } elseif ($estadoId === 3) {
            $agregarItem([
                "id" => "ord-estado-3-$ordenId",
                "notificacion_id" => null,
                "reparacion_orden_id" => $ordenId,
                "categoria" => "estado",
                "titulo" => "¡Tu $equipo ya está Finalizado! (Orden #$ordenId)",
                "descripcion" => $ord['tipo_entrega'] === 'envio'
                    ? "La reparación terminó. Pronto coordinaremos la entrega a tu domicilio."
                    : "Ya puedes pasar por la sucursal a retirar tu dispositivo.",
                "fecha" => $fechaBase,
                "leida" => false
            ]);
        } elseif ($estadoId === 5 || $estadoId === 6) {
            $agregarItem([
                "id" => "ord-estado-5-$ordenId",
                "notificacion_id" => null,
                "reparacion_orden_id" => $ordenId,
                "categoria" => "estado",
                "titulo" => "Orden #$ordenId · Equipo Entregado",
                "descripcion" => "Se confirmó la entrega de tu $equipo. ¡Gracias por confiar en Fénix Lab!",
                "fecha" => $fechaBase,
                "leida" => true
            ]);
        } elseif ($estadoId === 4) {
            $agregarItem([
                "id" => "ord-estado-4-$ordenId",
                "notificacion_id" => null,
                "reparacion_orden_id" => $ordenId,
                "categoria" => "estado",
                "titulo" => "Orden #$ordenId Cancelada",
                "descripcion" => "La orden de reparación de tu $equipo figura como cancelada.",
                "fecha" => $fechaBase,
                "leida" => true
            ]);
        }

        if ($total > 0) {
            $totalFmt = number_format($total, 2, ',', '.');
            $agregarItem([
                "id" => "ord-presup-$ordenId-$total",
                "notificacion_id" => null,
                "reparacion_orden_id" => $ordenId,
                "categoria" => "presupuesto",
                "titulo" => "Presupuesto actualizado · Orden #$ordenId",
                "descripcion" => "El técnico estableció un presupuesto total de $$totalFmt para la reparación de tu $equipo.",
                "fecha" => $fechaBase,
                "leida" => false
            ]);
        }

        if ($sena > 0 || $pagado > 0) {
            $montoMostrar = $pagado > 0 ? $pagado : $sena;
            $montoFmt = number_format($montoMostrar, 2, ',', '.');
            $saldo = max(0, $total - $montoMostrar);
            $saldoFmt = number_format($saldo, 2, ',', '.');

            $agregarItem([
                "id" => "ord-sena-$ordenId-$montoMostrar",
                "notificacion_id" => null,
                "reparacion_orden_id" => $ordenId,
                "categoria" => "sena",
                "titulo" => "Seña / Pago registrado · Orden #$ordenId",
                "descripcion" => $saldo > 0
                    ? "Se registró un pago/seña de $$montoFmt en tu $equipo. Saldo restante: $$saldoFmt."
                    : "Tu orden #$ordenId por $$montoFmt figura abonada al 100%.",
                "fecha" => $fechaBase,
                "leida" => false
            ]);
        }

        $diagTexto = $ord['rep_diag_tecnico'] ?: ($ord['ro_diag_tecnico'] ?: $ord['diagnostico_cliente']);
        if (!empty($diagTexto)) {
            $agregarItem([
                "id" => "ord-diag-$ordenId",
                "notificacion_id" => null,
                "reparacion_orden_id" => $ordenId,
                "categoria" => "tecnico",
                "titulo" => "Diagnóstico registrado · Orden #$ordenId",
                "descripcion" => "Detalle de falla / diagnóstico: " . $diagTexto,
                "fecha" => $fechaBase,
                "leida" => false
            ]);
        }

        if (!empty($ord['estado_envio'])) {
            $agregarItem([
                "id" => "ord-envio-$ordenId",
                "notificacion_id" => null,
                "reparacion_orden_id" => $ordenId,
                "categoria" => "logistica",
                "titulo" => "Estado de Envío · Orden #$ordenId",
                "descripcion" => "Estado logístico actual de tu $equipo: " . $ord['estado_envio'] . ".",
                "fecha" => $fechaBase,
                "leida" => false
            ]);
        }
    }

    usort($listaNotificaciones, function ($a, $b) {
        return strtotime($b['fecha']) <=> strtotime($a['fecha']);
    });

    return $listaNotificaciones;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) {
        $input = $_POST;
    }

    asegurarTablasNotificaciones($conexion);

    $accion = $input['accion'] ?? 'marcar_leida';
    $usuario_id = intval($input['usuario_id'] ?? 0);
    $notificacion_id = intval($input['notificacion_id'] ?? 0);
    $notif_id_str = trim((string)($input['notif_id'] ?? ''));

    try {
        if ($accion === 'marcar_todas_leidas' && $usuario_id > 0) {
            $stmtMsg = $conexion->prepare("UPDATE notificaciones_cliente SET leida = 1 WHERE usuario_id = ?");
            $stmtMsg->execute([$usuario_id]);

            $todas = obtenerNotificacionesCliente($conexion, $usuario_id);
            $stmtIns = $conexion->prepare("
                INSERT IGNORE INTO notificaciones_leidas_usuario (usuario_id, notif_clave)
                VALUES (?, ?)
            ");
            foreach ($todas as $item) {
                $stmtIns->execute([$usuario_id, $item['id']]);
            }

            echo json_encode(["success" => true, "sin_leer" => 0]);
            exit;
        }

        if ($accion === 'marcar_leida') {
            if ($notificacion_id > 0) {
                $stmt = $conexion->prepare("UPDATE notificaciones_cliente SET leida = 1 WHERE notificacion_id = ?");
                $stmt->execute([$notificacion_id]);
                if ($usuario_id <= 0) {
                    $stmtU = $conexion->prepare("SELECT usuario_id FROM notificaciones_cliente WHERE notificacion_id = ?");
                    $stmtU->execute([$notificacion_id]);
                    $usuario_id = intval($stmtU->fetchColumn());
                }
                if ($notif_id_str === '') {
                    $notif_id_str = "msg-" . $notificacion_id;
                }
            }

            if ($usuario_id > 0 && $notif_id_str !== '') {
                $stmtIns = $conexion->prepare("
                    INSERT IGNORE INTO notificaciones_leidas_usuario (usuario_id, notif_clave)
                    VALUES (?, ?)
                ");
                $stmtIns->execute([$usuario_id, $notif_id_str]);
            }

            echo json_encode(["success" => true]);
            exit;
        }

        if ($accion === 'crear' && $usuario_id > 0) {
            $stmt = $conexion->prepare("
                INSERT INTO notificaciones_cliente (usuario_id, reparacion_orden_id, tipo, titulo, mensaje)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $usuario_id,
                !empty($input['reparacion_orden_id']) ? intval($input['reparacion_orden_id']) : null,
                $input['tipo'] ?? 'mensaje',
                $input['titulo'] ?? 'Mensaje del Taller',
                $input['mensaje'] ?? ''
            ]);
            echo json_encode(["success" => true, "id" => $conexion->lastInsertId()]);
            exit;
        }

        echo json_encode(["success" => false, "error" => "Acción no válida"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : 0;

    if ($usuario_id <= 0) {
        echo json_encode(["success" => false, "error" => "ID de usuario inválido"]);
        exit;
    }

    try {
        $lista = obtenerNotificacionesCliente($conexion, $usuario_id);
        $sinLeer = 0;
        foreach ($lista as $n) {
            if (empty($n['leida'])) {
                $sinLeer++;
            }
        }

        echo json_encode([
            "success" => true,
            "total" => count($lista),
            "sin_leer" => $sinLeer,
            "notificaciones" => $lista
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}