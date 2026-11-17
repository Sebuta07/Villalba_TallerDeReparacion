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

// Garantizar tabla de mensajes/notificaciones directas al cliente
try {
    $conexion->exec("
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
} catch (Exception $e) {
    // Continuar incluso si no tiene permisos DDL
}

// ============================================================================
// POST: Marcar notificaciones como leídas o registrar un mensaje nuevo
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) {
        $input = $_POST;
    }

    $accion = $input['accion'] ?? 'marcar_leida';
    $usuario_id = intval($input['usuario_id'] ?? 0);
    $notificacion_id = intval($input['notificacion_id'] ?? 0);

    try {
        if ($accion === 'marcar_todas_leidas' && $usuario_id > 0) {
            $stmt = $conexion->prepare("UPDATE notificaciones_cliente SET leida = 1 WHERE usuario_id = ?");
            $stmt->execute([$usuario_id]);
            echo json_encode(["success" => true, "message" => "Todas marcadas como leídas"]);
            exit;
        }

        if ($accion === 'marcar_leida' && $notificacion_id > 0) {
            $stmt = $conexion->prepare("UPDATE notificaciones_cliente SET leida = 1 WHERE notificacion_id = ?");
            $stmt->execute([$notificacion_id]);
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

// ============================================================================
// GET: Obtener todas las notificaciones del cliente (Mensajes + Eventos de Orden)
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : 0;

    if ($usuario_id <= 0) {
        echo json_encode(["success" => false, "error" => "ID de usuario inválido"]);
        exit;
    }

    $listaNotificaciones = [];

    try {
        // 1. Mensajes directos y alertas guardadas en `notificaciones_cliente`[cite: 3]
        $stmtMsg = $conexion->prepare("
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
            $listaNotificaciones[] = [
                "id" => "msg-" . $m['notificacion_id'],
                "notificacion_id" => intval($m['notificacion_id']),
                "reparacion_orden_id" => $m['reparacion_orden_id'] ? intval($m['reparacion_orden_id']) : null,
                "categoria" => $m['tipo'] ?: 'mensaje',
                "titulo" => $m['titulo'],
                "descripcion" => $m['mensaje'],
                "fecha" => $m['fecha_creacion'],
                "leida" => intval($m['leida']) === 1
            ];
        }

        // 2. Generar notificaciones dinámicas desde el estado real de las órdenes del cliente[cite: 1]
        $sqlOrdenes = "
            SELECT 
                ro.reparacion_orden_id,
                ro.diagnostico_cliente,
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
                MAX(r.observaciones_tecnico) AS obs_tecnico
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
        $stmtOrd = $conexion->prepare($sqlOrdenes);
        $stmtOrd->execute([$usuario_id]);
        $ordenes = $stmtOrd->fetchAll(PDO::FETCH_ASSOC);

        foreach ($ordenes as $ord) {
            $ordenId = intval($ord['reparacion_orden_id']);
            $equipo = trim($ord['marca'] . ' ' . $ord['modelo']);
            $estadoId = intval($ord['estados_or_id']);
            $total = floatval($ord['total']);
            $sena = floatval($ord['monto_sena']);
            $pagado = floatval($ord['pagado']);
            $tecnico = trim($ord['tecnico_nombre'] ?? '');
            $fechaBase = $ord['fecha_registro'] ?: date('Y-m-d H:i:s');

            // A) Notificación de Estado Actual de la Orden (Pendiente, En Proceso, Finalizado, Entregado)[cite: 1]
            if ($estadoId === 1) {
                $listaNotificaciones[] = [
                    "id" => "ord-estado-1-$ordenId",
                    "notificacion_id" => null,
                    "reparacion_orden_id" => $ordenId,
                    "categoria" => "estado",
                    "titulo" => "Orden #$ordenId en estado Pendiente",
                    "descripcion" => "Tu $equipo está registrado en cola de ingreso esperando asignación o revisión técnica.",
                    "fecha" => $fechaBase,
                    "leida" => false
                ];
            } elseif ($estadoId === 2) {
                $descTecnico = $tecnico ? "El técnico $tecnico tomó tu orden y está trabajando en tu $equipo." : "Un técnico tomó tu orden y ya está revisando tu $equipo.";
                $listaNotificaciones[] = [
                    "id" => "ord-estado-2-$ordenId",
                    "notificacion_id" => null,
                    "reparacion_orden_id" => $ordenId,
                    "categoria" => "tecnico",
                    "titulo" => "Orden #$ordenId tomada por el taller",
                    "descripcion" => $descTecnico,
                    "fecha" => $fechaBase,
                    "leida" => false
                ];
            } elseif ($estadoId === 3) {
                $listaNotificaciones[] = [
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
                ];
            } elseif ($estadoId === 5 || $estadoId === 6) {
                $listaNotificaciones[] = [
                    "id" => "ord-estado-5-$ordenId",
                    "notificacion_id" => null,
                    "reparacion_orden_id" => $ordenId,
                    "categoria" => "estado",
                    "titulo" => "Orden #$ordenId · Equipo Entregado",
                    "descripcion" => "Se confirmó la entrega de tu $equipo. ¡Gracias por confiar en Fénix Lab!",
                    "fecha" => $fechaBase,
                    "leida" => true
                ];
            } elseif ($estadoId === 4) {
                $listaNotificaciones[] = [
                    "id" => "ord-estado-4-$ordenId",
                    "notificacion_id" => null,
                    "reparacion_orden_id" => $ordenId,
                    "categoria" => "estado",
                    "titulo" => "Orden #$ordenId Cancelada",
                    "descripcion" => "La orden de reparación de tu $equipo figura como cancelada.",
                    "fecha" => $fechaBase,
                    "leida" => true
                ];
            }

            // B) Notificación de Presupuesto
            if ($total > 0) {
                $totalFmt = number_format($total, 2, ',', '.');
                $listaNotificaciones[] = [
                    "id" => "ord-presup-$ordenId-$total",
                    "notificacion_id" => null,
                    "reparacion_orden_id" => $ordenId,
                    "categoria" => "presupuesto",
                    "titulo" => "Presupuesto actualizado · Orden #$ordenId",
                    "descripcion" => "El técnico estableció un presupuesto total de $$totalFmt para la reparación de tu $equipo.",
                    "fecha" => $fechaBase,
                    "leida" => false
                ];
            }

            // C) Notificación de Seña o Pago registrado[cite: 1]
            if ($sena > 0 || $pagado > 0) {
                $montoMostrar = $pagado > 0 ? $pagado : $sena;
                $montoFmt = number_format($montoMostrar, 2, ',', '.');
                $saldo = max(0, $total - $montoMostrar);
                $saldoFmt = number_format($saldo, 2, ',', '.');

                $listaNotificaciones[] = [
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
                ];
            }

            // D) Diagnóstico técnico modificado / detallado[cite: 1]
            if (!empty($ord['diagnostico_cliente'])) {
                $listaNotificaciones[] = [
                    "id" => "ord-diag-$ordenId",
                    "notificacion_id" => null,
                    "reparacion_orden_id" => $ordenId,
                    "categoria" => "tecnico",
                    "titulo" => "Diagnóstico registrado · Orden #$ordenId",
                    "descripcion" => "Detalle de falla / diagnóstico: " . $ord['diagnostico_cliente'],
                    "fecha" => $fechaBase,
                    "leida" => false
                ];
            }

            // E) Notificación de Envío / Logística[cite: 1]
            if (!empty($ord['estado_envio'])) {
                $listaNotificaciones[] = [
                    "id" => "ord-envio-$ordenId",
                    "notificacion_id" => null,
                    "reparacion_orden_id" => $ordenId,
                    "categoria" => "logistica",
                    "titulo" => "Estado de Envío · Orden #$ordenId",
                    "descripcion" => "Estado logístico actual de tu $equipo: " . $ord['estado_envio'] . ".",
                    "fecha" => $fechaBase,
                    "leida" => false
                ];
            }
        }

        // Ordenar por fecha más reciente
        usort($listaNotificaciones, function ($a, $b) {
            return strtotime($b['fecha']) <=> strtotime($a['fecha']);
        });

        echo json_encode([
            "success" => true,
            "total" => count($listaNotificaciones),
            "notificaciones" => $listaNotificaciones
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}