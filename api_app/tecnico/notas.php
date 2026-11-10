<?php
if (ob_get_length()) ob_clean();

ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../conexion.php';
if (!isset($conexion) && isset($pdo)) { $conexion = $pdo; }

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $reparacion_orden_id = $_GET['reparacion_orden_id'] ?? null;
    $accion = $_GET['accion'] ?? null;
    $tecnico_id = $_GET['tecnico_id'] ?? null;

    if ($accion === 'ordenes' || !$reparacion_orden_id) {
        try {
            $sql = "SELECT 
                        ro.reparacion_orden_id,
                        ro.usuario_id,
                        u.nombre as cliente_nombre,
                        u.apellido as cliente_apellido,
                        me.marcas_equipos as marca_nombre,
                        mo.modelo_equipos as modelo_nombre,
                        eo.nombre as estado_nombre,
                        ro.estados_or_id,
                        ro.tecnico_id
                    FROM reparacion_orden ro
                    INNER JOIN usuarios u ON ro.usuario_id = u.usuario_id
                    INNER JOIN equipos eq ON ro.equipo_id = eq.equipo_id
                    LEFT JOIN marcas_equipos me ON eq.marca_equipo_id = me.marca_equipo_id
                    LEFT JOIN modelo_equipos mo ON eq.modelo_equipo_id = mo.modelo_equipo_id
                    INNER JOIN estados_or eo ON ro.estados_or_id = eo.estados_or_id
                    WHERE 1=1";

            $params = [];
            if ($tecnico_id) {
                $sql .= " AND ro.tecnico_id = :tecnico_id";
                $params[':tecnico_id'] = $tecnico_id;
            }

            $sql .= " ORDER BY ro.reparacion_orden_id DESC";
            $stmt = $conexion->prepare($sql);
            $stmt->execute($params);
            $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["success" => true, "ordenes" => $ordenes], JSON_UNESCAPED_UNICODE);
            exit();
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error SQL órdenes: " . $e->getMessage()]);
            exit();
        }
    } else {
        try {
            $stmt = $conexion->prepare("SELECT * FROM notas_reparacion WHERE reparacion_orden_id = :id ORDER BY fecha ASC");
            $stmt->execute([':id' => $reparacion_orden_id]);
            $notas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
            $host = $_SERVER['HTTP_HOST'];
            $baseUrl = "$protocol://$host/api_app/uploads/chat/";

            foreach ($notas as &$nota) {
                if (!empty($nota['archivo'])) {
                    $nota['archivo_url'] = $baseUrl . $nota['archivo'];
                }
            }

            echo json_encode(["success" => true, "notas" => $notas], JSON_UNESCAPED_UNICODE);
            exit();
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error SQL notas: " . $e->getMessage()]);
            exit();
        }
    }
}

if ($method === 'POST') {
    try {
        $reparacion_orden_id = $_POST['reparacion_orden_id'] ?? null;
        $remitente = $_POST['remitente'] ?? 'tecnico';
        $mensaje = $_POST['mensaje'] ?? '';
        $tipo = $_POST['tipo'] ?? 'texto';
        $nombreArchivoBD = null;

        if (!$reparacion_orden_id) {
            $inputData = json_decode(file_get_contents("php://input"), true) ?? [];
            $reparacion_orden_id = $inputData['reparacion_orden_id'] ?? null;
            $remitente = $inputData['remitente'] ?? 'tecnico';
            $mensaje = $inputData['mensaje'] ?? '';
            $tipo = $inputData['tipo'] ?? 'texto';
        }

        if (!$reparacion_orden_id) {
            echo json_encode(["success" => false, "message" => "Falta el ID de la orden"]);
            exit();
        }

        if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../uploads/chat/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileTmpPath = $_FILES['archivo']['tmp_name'];
            $fileName = $_FILES['archivo']['name'];
            $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            
            $nuevoNombre = "chat_" . $reparacion_orden_id . "_" . time() . "_" . rand(1000, 9999) . "." . $fileExtension;
            $dest_path = $uploadDir . $nuevoNombre;

            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                $nombreArchivoBD = $nuevoNombre;
                if (in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                    $tipo = 'imagen';
                } elseif (in_array($fileExtension, ['mp4', 'mov', 'avi', 'm4v'])) {
                    $tipo = 'video';
                } elseif (in_array($fileExtension, ['m4a', 'mp3', 'wav', 'aac', 'caf'])) {
                    $tipo = 'audio';
                }
            }
        }

        $stmt = $conexion->prepare("INSERT INTO notas_reparacion (reparacion_orden_id, remitente, mensaje, tipo, archivo) VALUES (:id, :remitente, :mensaje, :tipo, :archivo)");
        $stmt->execute([
            ':id'        => $reparacion_orden_id,
            ':remitente' => $remitente,
            ':mensaje'   => $mensaje,
            ':tipo'      => $tipo,
            ':archivo'   => $nombreArchivoBD
        ]);

        echo json_encode(["success" => true, "message" => "Mensaje enviado con éxito"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Excepción PHP: " . $e->getMessage()]);
    }
    exit();
}
?>