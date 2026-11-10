<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $usuario_id = $_GET['usuario_id'] ?? 3;

    try {
        $stmt = $conexion->prepare("SELECT usuario_id, username, email, nombre, apellido, dni_cuit, fecha_nacimiento FROM usuarios WHERE usuario_id = ?");
        $stmt->execute([$usuario_id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            echo json_encode(["success" => true, "usuario" => $usuario], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(["success" => false, "error" => "Usuario no encontrado"]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} 
elseif ($method === 'POST') {
    $usuario_id = $_POST['usuario_id'] ?? 3;
    $nombre = $_POST['nombre'] ?? '';
    $apellido = $_POST['apellido'] ?? '';
    $email = $_POST['email'] ?? '';
    $dni_cuit = $_POST['dni_cuit'] ?? null;
    $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? null;

    try {
        $stmt = $conexion->prepare("UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, dni_cuit = ?, fecha_nacimiento = ? WHERE usuario_id = ?");
        $stmt->execute([$nombre, $apellido, $email, $dni_cuit, $fecha_nacimiento, $usuario_id]);

        echo json_encode(["success" => true, "mensaje" => "Datos de perfil actualizados correctamente"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>