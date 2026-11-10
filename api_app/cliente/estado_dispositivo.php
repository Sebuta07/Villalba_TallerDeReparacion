<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET: Obtener órdenes y sus mensajes de chat filtrados por el usuario actual
if ($method === 'GET') {
    $usuario_id = $_GET['usuario_id'] ?? null;

    if (!$usuario_id) {
        echo json_encode(["estado" => "error", "mensaje" => "Falta el parámetro usuario_id"]);
        exit;
    }

    try {
        $sql = "SELECT 
                    ro.reparacion_orden_id as orden_id,
                    ro.fecha_registro,
                    ro.total,
                    ro.codigo_seguridad,
                    ro.diagnostico_cliente,
                    ro.pagado,
                    eo.nombre as estado_orden,
                    s.nombre as servicio_nombre,
                    ce.nombre as categoria_nombre,
                    me.marcas_equipos as marca_nombre,
                    mo.modelo_equipos as modelo_nombre,
                    eq.numero_serie,
                    eq.imei
                FROM reparacion_orden ro
                INNER JOIN equipos eq ON ro.equipo_id = eq.equipo_id
                INNER JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
                INNER JOIN servicios s ON ro.servicios_id = s.servicios_id
                LEFT JOIN categorias_equipo ce ON eq.categoria_equipo_id = ce.categoria_id
                LEFT JOIN marcas_equipos me ON eq.marca_equipo_id = me.marca_equipo_id
                LEFT JOIN modelo_equipos mo ON eq.modelo_equipo_id = mo.modelo_equipo_id
                WHERE ro.usuario_id = ?
                ORDER BY ro.fecha_registro DESC";

        $stmt = $conexion->prepare($sql);
        $stmt->execute([$usuario_id]);
        $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($ordenes as &$orden) {
            $stmtNotas = $conexion->prepare("SELECT remitente, mensaje, fecha FROM notas_reparacion WHERE reparacion_orden_id = ? ORDER BY fecha ASC");
            $stmtNotas->execute([$orden['orden_id']]);
            $orden['notas'] = $stmtNotas->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode([
            "estado" => "success",
            "ordenes" => $ordenes ?: []
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
    }
    exit;
}

// POST: Enviar mensaje del cliente al técnico
if ($method === 'POST') {
    $orden_id = $_POST['reparacion_orden_id'] ?? null;
    $mensaje = $_POST['mensaje'] ?? '';

    if (!$orden_id || empty(trim($mensaje))) {
        echo json_encode(["success" => false, "error" => "Datos incompletos"]);
        exit;
    }

    try {
        $stmt = $conexion->prepare("INSERT INTO notas_reparacion (reparacion_orden_id, remitente, mensaje, fecha) VALUES (?, 'cliente', ?, NOW())");
        $stmt->execute([$orden_id, $mensaje]);

        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}
?>