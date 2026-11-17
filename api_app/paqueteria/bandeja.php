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

    // Coordenadas decimales tipo "-26.169294, -58.190476"
    if (preg_match('/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/', $texto, $m)) {$coords = "{$m[1]},{$m[2]}";
        return [
            'coordenadas' => $coords,
            'google_maps_url' => "https://www.google.com/maps/search/?api=1&query=" . urlencode($coords)
        ];
    }

    // Enlace directo de Google Maps
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

                des.calle,
                des.manzana,
                des.casa,
                des.barrio,
                COALESCE(NULLIF(TRIM(des.observaciones), ''), NULLIF(TRIM(des.observarciones), ''), '') AS observaciones_envio,

                COALESCE(
                    NULLIF(TRIM(CONCAT_WS(', ',
                        NULLIF(des.calle, ''),
                        IF(des.manzana IS NOT NULL AND des.manzana != '', CONCAT('Mz. ', des.manzana), NULL),
                        IF(des.casa IS NOT NULL AND des.casa != '', CONCAT('Casa ', des.casa), NULL),
                        IF(des.barrio IS NOT NULL AND des.barrio != '', CONCAT('B° ', des.barrio), NULL)
                    )), ''),
                    NULLIF(TRIM(CONCAT_WS(', ',
                        NULLIF(u.direccion_principal, ''),
                        NULLIF(u.localidad, ''),
                        NULLIF(u.codigo_postal, '')
                    )), ''),
                    'Formosa Capital (Sin dirección cargada)'
                ) AS direccion_entrega,

                COALESCE(
                    NULLIF(TRIM(des.observaciones), ''),
                    NULLIF(TRIM(des.observarciones), ''),
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
            LEFT JOIN direccion d ON u.direccion_id = d.direccion_id
            WHERE LOWER(eo.nombre) LIKE '%finalizado%' 
              AND ro.tipo_entrega = 'envio'
            GROUP BY ro.reparacion_orden_id
            ORDER BY ro.reparacion_orden_id DESC";

    $stmt = $conexion->query($sql);
    $ordenes =$stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($ordenes as &$orden) {
        $ubicacionObs = extraerUbicacionDeTexto($orden['referencia_direccion']);

        if ($ubicacionObs !== null) {
            $orden['coordenadas_detectadas'] =$ubicacionObs['coordenadas'];
            $orden['google_maps_url'] =$ubicacionObs['google_maps_url'];
        } else {
            $orden['coordenadas_detectadas'] = null;
            $busqueda =$orden['direccion_entrega'];
            if (stripos($busqueda, 'Formosa') === false) {$busqueda .= ', Formosa, Argentina';
            }
            $orden['google_maps_url'] = "https://www.google.com/maps/search/?api=1&query=" . urlencode($busqueda);
        }
    }

    echo json_encode(["success" => true, "ordenes" => $ordenes], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>