<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../conexion.php';
if (!isset($conexion) && isset($pdo)) { $conexion =$pdo; }

function extraerUbicacionDeTexto(?string $texto): ?array {
    if (!$texto) {
        return null;
    }

    if (preg_match('/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/', $texto, $m)) {$coords = "{$m[1]},{$m[2]}";
        return [
            'coordenadas' => $coords,
            'google_maps_url' => "https://www.google.com/maps/search/?api=1&query=" . urlencode($coords)
        ];
    }

    if (preg_match('/(https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)\S*)/i', $texto,$m)) {
        $url = rtrim($m[1], ".,);]");
        if (preg_match('/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/', $url, $c)) {$coords = "{$c[1]},{$c[2]}";
            return [
                'coordenadas' => $coords,
                'google_maps_url' => "https://www.google.com/maps/search/?api=1&query=" . urlencode($coords)
            ];
        }
        return [
            'coordenadas' => null,
            'google_maps_url' => $url
        ];
    }

    return null;
}

try {
    $sql = "SELECT 
                ro.reparacion_orden_id,
                ro.diagnostico_cliente,
                ro.total AS presupuesto,
                ro.codigo_seguridad,
                ro.estados_or_id,
                ro.tipo_entrega,
                u.nombre AS cliente_nombre,
                u.apellido AS cliente_apellido,
                u.dni_cuit,
                u.telefono AS cliente_telefono,
                e.numero_serie,
                me.marcas_equipos AS marca,
                moe.modelo_equipos AS modelo,
                eo.nombre AS estado_or,

                MAX(r.coordenadas_gps) AS coordenadas_gps,
                MAX(r.estado_envio) AS estado_envio,
                MAX(r.codigo_envio_logistica) AS codigo_envio_logistica,

                MAX(des.calle) AS calle,
                MAX(des.manzana) AS manzana,
                MAX(des.casa) AS casa,
                MAX(des.barrio) AS barrio,
                COALESCE(NULLIF(TRIM(MAX(des.observaciones)), ''), NULLIF(TRIM(MAX(des.observarciones)), ''), '') AS observaciones_retiro,

                COALESCE(
                    NULLIF(TRIM(CONCAT_WS(', ',
                        NULLIF(MAX(des.calle), ''),
                        IF(MAX(des.manzana) IS NOT NULL AND MAX(des.manzana) != '', CONCAT('Mz. ', MAX(des.manzana)), NULL),
                        IF(MAX(des.casa) IS NOT NULL AND MAX(des.casa) != '', CONCAT('Casa ', MAX(des.casa)), NULL),
                        IF(MAX(des.barrio) IS NOT NULL AND MAX(des.barrio) != '', CONCAT('B° ', MAX(des.barrio)), NULL)
                    )), ''),
                    NULLIF(TRIM(CONCAT_WS(', ',
                        NULLIF(u.direccion_principal, ''),
                        NULLIF(u.localidad, ''),
                        NULLIF(u.codigo_postal, '')
                    )), ''),
                    'Formosa Capital (Sin dirección cargada)'
                ) AS direccion_retiro,

                COALESCE(
                    NULLIF(TRIM(MAX(des.observarciones)), ''),
                    NULLIF(TRIM(MAX(des.observaciones)), ''),
                    NULLIF(TRIM(d.observaciones), ''),
                    ''
                ) AS referencia_direccion

            FROM reparacion_orden ro
            INNER JOIN usuarios u ON ro.usuario_id = u.usuario_id
            INNER JOIN equipos e ON ro.equipo_id = e.equipo_id
            LEFT JOIN marcas_equipos me ON e.marca_equipo_id = me.marca_equipo_id
            LEFT JOIN modelo_equipos moe ON e.modelo_equipo_id = moe.modelo_equipo_id
            LEFT JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
            LEFT JOIN detalle_envios_sucursal des ON des.reparacion_orden_id = ro.reparacion_orden_id
            LEFT JOIN reparacion r ON r.reparacion_orden_id = ro.reparacion_orden_id
            LEFT JOIN direccion d ON u.direccion_id = d.direccion_id
            WHERE ro.estados_or_id = 1
              AND ro.tipo_entrega = 'envio'
              AND ro.estado_general_id = 1
              AND (r.estado_envio IS NULL OR LOWER(r.estado_envio) NOT LIKE '%ingresado en taller%')
            GROUP BY ro.reparacion_orden_id
            ORDER BY ro.reparacion_orden_id DESC";

    $stmt = $conexion->query($sql);
    $retiros =$stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($retiros as &$retiro) {$fuente = trim(($retiro['coordenadas_gps'] ?? '') . ' ' . ($retiro['referencia_direccion'] ?? ''));
        $ubicacionObs = extraerUbicacionDeTexto($fuente);

        if ($ubicacionObs !== null) {
            $retiro['coordenadas_detectadas'] =$ubicacionObs['coordenadas'];
            $retiro['google_maps_url'] =$ubicacionObs['google_maps_url'];
        } else {
            $retiro['coordenadas_detectadas'] = null;
            $busqueda =$retiro['direccion_retiro'];
            if (stripos($busqueda, 'Formosa') === false) {$busqueda .= ', Formosa, Argentina';
            }
            $retiro['google_maps_url'] = "https://www.google.com/maps/search/?api=1&query=" . urlencode($busqueda);
        }
    }

    echo json_encode(["success" => true, "retiros" => $retiros], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>