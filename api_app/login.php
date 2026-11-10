<?php
if (ob_get_length()) ob_clean();

ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexion.php';

if (!isset($conexion)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "La variable \$conexion no existe."]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido."]);
    exit();
}

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "JSON no válido."]);
    exit();
}

if (empty($data['usuario_o_email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Ingresá tu usuario/email y contraseña."]);
    exit();
}

$inputUser = trim($data['usuario_o_email']);
$password  = trim($data['password']);

try {
    $query = "SELECT u.usuario_id, u.username, u.email, u.password_hash, u.nombre, u.apellido, u.rol_id, r.nombre AS rol_nombre, u.estado_general_id 
              FROM usuarios u
              INNER JOIN roles r ON u.rol_id = r.roles_id
              WHERE (u.username = :input OR u.email = :input) LIMIT 1";

    $stmt = $conexion->prepare($query);
    $stmt->execute([':input' => $inputUser]);

    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Credenciales incorrectas."]);
        exit();
    }

    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ((int)$usuario['estado_general_id'] !== 1) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Tu cuenta se encuentra inactiva."]);
        exit();
    }

    if (!password_verify($password, $usuario['password_hash'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Credenciales incorrectas."]);
        exit();
    }

    $rolId = (int)$usuario['rol_id'];
    $rolNombreNormalizado = strtolower(trim($usuario['rol_nombre']));

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Inicio de sesión exitoso.",
        "usuario" => [
            "id"         => (int)$usuario['usuario_id'],
            "username"   => $usuario['username'],
            "email"      => $usuario['email'],
            "nombre"     => $usuario['nombre'],
            "apellido"   => $usuario['apellido'],
            "rol_id"     => $rolId,
            "rol_nombre" => $rolNombreNormalizado
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
}
?>