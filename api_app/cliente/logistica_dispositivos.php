<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : 0;

    if ($usuario_id <= 0) {
        echo json_encode(["success" => false, "error" => "ID de usuario inválido"]);
        exit;
    }

    try {
        // GROUP BY ro.reparacion_orden_id evita filas duplicadas si hay múltiples registros en reparacion o detalle_envios_sucursal
        $sqlOrdenes = "
            SELECT 
                ro.reparacion_orden_id,
                ro.codigo_seguridad,
                ro.diagnostico_cliente,
                ro.estados_or_id,
                eo.nombre AS estado_taller,
                ro.tipo_entrega,
                ro.fecha_registro,
                COALESCE(me.marcas_equipos, 'Equipo') AS marca,
                COALESCE(mo.modelo_equipos, '') AS modelo,
                MAX(r.codigo_seguimiento) AS codigo_seguimiento,
                MAX(r.estado_envio) AS estado_envio,
                MAX(r.coordenadas_gps) AS coordenadas_gps,
                MAX(r.direccion_logistica) AS direccion_logistica,
                MAX(r.distancia_km) AS distancia_km,
                MAX(r.codigo_envio_logistica) AS codigo_envio_logistica,
                MAX(des.detalle_envios_sucursal_id) AS detalle_envios_sucursal_id,
                MAX(des.calle) AS calle,
                MAX(des.barrio) AS barrio,
                MAX(des.manzana) AS manzana,
                MAX(des.casa) AS casa,
                MAX(des.observaciones) AS obs_envio
            FROM reparacion_orden ro
            INNER JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
            LEFT JOIN equipos e ON ro.equipo_id = e.equipo_id
            LEFT JOIN marcas_equipos me ON e.marca_equipo_id = me.marca_equipo_id
            LEFT JOIN modelo_equipos mo ON e.modelo_equipo_id = mo.modelo_equipo_id
            LEFT JOIN reparacion r ON r.reparacion_orden_id = ro.reparacion_orden_id
            LEFT JOIN detalle_envios_sucursal des ON des.reparacion_orden_id = ro.reparacion_orden_id
            WHERE ro.usuario_id = ? 
              AND ro.estado_general_id = 1
              AND ro.estados_or_id != 4
            GROUP BY ro.reparacion_orden_id
            ORDER BY ro.reparacion_orden_id DESC
        ";
        $stmtOrd = $conexion->prepare($sqlOrdenes);
        $stmtOrd->execute([$usuario_id]);
        $ordenes = $stmtOrd->fetchAll(PDO::FETCH_ASSOC);

        $stmtDir = $conexion->prepare("
            SELECT dc.direccion_calle, dc.localidad, dc.referencia, dc.coordenadas_gps
            FROM direcciones_cliente dc
            WHERE dc.id_cliente = ?
            ORDER BY dc.id_direccion DESC LIMIT 1
        ");
        $stmtDir->execute([$usuario_id]);
        $dirCliente = $stmtDir->fetch(PDO::FETCH_ASSOC);

        if (!$dirCliente) {
            $stmtDirBase = $conexion->prepare("
                SELECT CONCAT(d.calle, ' ', COALESCE(d.numero, '')) AS direccion_calle,
                       d.barrio AS localidad,
                       d.observaciones AS referencia,
                       '-26.1849, -58.1731' AS coordenadas_gps
                FROM usuarios u
                INNER JOIN direccion d ON u.direccion_id = d.direccion_id
                WHERE u.usuario_id = ? LIMIT 1
            ");
            $stmtDirBase->execute([$usuario_id]);
            $dirCliente = $stmtDirBase->fetch(PDO::FETCH_ASSOC);
        }

        echo json_encode([
            "success" => true,
            "direccion_respaldo" => $dirCliente ?: null,
            "ordenes" => $ordenes
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = intval($_POST['usuario_id'] ?? 0);
    $reparacion_orden_id = intval($_POST['reparacion_orden_id'] ?? 0);
    $franja_horaria = trim($_POST['franja_horaria'] ?? 'Lo antes posible');

    if ($usuario_id <= 0 || $reparacion_orden_id <= 0) {
        echo json_encode(["success" => false, "error" => "Orden inválida."]);
        exit;
    }

    try {
        $conexion->beginTransaction();

        $stmtInfo = $conexion->prepare("
            SELECT ro.reparacion_orden_id, ro.codigo_seguridad, ro.diagnostico_cliente,
                   r.reparacion_id, r.direccion_logistica, r.coordenadas_gps,
                   des.detalle_envios_sucursal_id, des.calle, des.barrio
            FROM reparacion_orden ro
            LEFT JOIN reparacion r ON r.reparacion_orden_id = ro.reparacion_orden_id
            LEFT JOIN detalle_envios_sucursal des ON des.reparacion_orden_id = ro.reparacion_orden_id
            WHERE ro.reparacion_orden_id = ? AND ro.usuario_id = ?
            LIMIT 1
        ");
        $stmtInfo->execute([$reparacion_orden_id, $usuario_id]);
        $info = $stmtInfo->fetch(PDO::FETCH_ASSOC);

        if (!$info) {
            throw new Exception("No se encontró la orden seleccionada.");
        }

        $calle = $info['calle'] ?? '';
        $barrio = $info['barrio'] ?? '';
        $gps = $info['coordenadas_gps'] ?? '-26.1849, -58.1731';

        if (empty($calle) && !empty($info['direccion_logistica'])) {
            $calle = $info['direccion_logistica'];
        }

        if (empty($calle)) {
            $stmtDir = $conexion->prepare("
                SELECT direccion_calle, localidad, coordenadas_gps 
                FROM direcciones_cliente WHERE id_cliente = ? ORDER BY id_direccion DESC LIMIT 1
            ");
            $stmtDir->execute([$usuario_id]);
            $dir = $stmtDir->fetch(PDO::FETCH_ASSOC);
            if ($dir) {
                $calle = $dir['direccion_calle'];
                $barrio = $dir['localidad'];
                $gps = $dir['coordenadas_gps'] ?: $gps;
            } else {
                $calle = 'Domicilio registrado en cuenta';
                $barrio = 'Formosa Capital';
            }
        }

        $codigo_logistica = 'RET-' . strtoupper(substr(md5(uniqid()), 0, 6));

        $stmtUpdOrd = $conexion->prepare("UPDATE reparacion_orden SET tipo_entrega = 'envio' WHERE reparacion_orden_id = ?");
        $stmtUpdOrd->execute([$reparacion_orden_id]);

        if (!empty($info['detalle_envios_sucursal_id'])) {
            $stmtUpdDet = $conexion->prepare("
                UPDATE detalle_envios_sucursal 
                SET observaciones = ?, observarciones = ?, fecha_hora_pedido = NOW()
                WHERE detalle_envios_sucursal_id = ?
            ");
            $stmtUpdDet->execute([
                "RETIRO A TALLER SOLICITADO - Orden #$reparacion_orden_id ($franja_horaria)",
                "Retiro por Cadete | GPS: $gps | Franja: $franja_horaria",
                $info['detalle_envios_sucursal_id']
            ]);
        } else {
            $stmtInsDet = $conexion->prepare("
                INSERT INTO detalle_envios_sucursal 
                (productos_id, cantidad, observaciones, estado_general_id, calle, barrio, observarciones, fecha_hora_pedido, reparacion_orden_id) 
                VALUES (1, 1, ?, 1, ?, ?, ?, NOW(), ?)
            ");
            $stmtInsDet->execute([
                "RETIRO A TALLER SOLICITADO - Orden #$reparacion_orden_id ($franja_horaria)",
                $calle,
                $barrio,
                "Retiro por Cadete | GPS: $gps | Franja: $franja_horaria",
                $reparacion_orden_id
            ]);
        }

        if (!empty($info['reparacion_id'])) {
            $stmtUpdRep = $conexion->prepare("
                UPDATE reparacion SET 
                    metodo_envio = 'Retiro a Domicilio por Paquetería',
                    coordenadas_gps = ?,
                    codigo_envio_logistica = ?,
                    estado_envio = 'Retiro Solicitado a Paquetería'
                WHERE reparacion_id = ?
            ");
            $stmtUpdRep->execute([$gps, $codigo_logistica, $info['reparacion_id']]);
        } else {
            $stmtInsRep = $conexion->prepare("
                INSERT INTO reparacion 
                (reparacion_orden_id, codigo_seguimiento, id_cliente, usuario_id, falla_reportada, metodo_envio, direccion_logistica, coordenadas_gps, codigo_envio_logistica, estado_envio)
                VALUES (?, ?, ?, ?, ?, 'Retiro a Domicilio por Paquetería', ?, ?, ?, 'Retiro Solicitado a Paquetería')
            ");
            $stmtInsRep->execute([
                $reparacion_orden_id,
                'OR-' . str_pad($reparacion_orden_id, 5, '0', STR_PAD_LEFT),
                $usuario_id,
                $usuario_id,
                $info['diagnostico_cliente'],
                "$calle ($barrio)",
                $gps,
                $codigo_logistica
            ]);
        }

        $conexion->commit();

        echo json_encode([
            "success" => true,
            "codigo_logistica" => $codigo_logistica,
            "mensaje" => "Solicitud #$codigo_logistica enviada. Un cadete de paquetería pasará a retirar tu dispositivo por tu dirección registrada."
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}
?>