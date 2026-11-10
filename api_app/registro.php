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

if (
    empty($data['username']) || 
    empty($data['password']) || 
    empty($data['email']) || 
    empty($data['nombre']) || 
    empty($data['apellido']) || 
    empty($data['dni_cuit']) ||
    empty($data['genero_id'])
) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Faltan campos obligatorios."]);
    exit();
}

$username       = trim($data['username']);
$password_plain = trim($data['password']);
$email          = trim($data['email']);
$nombre         = trim($data['nombre']);
$apellido       = trim($data['apellido']);
$dni_cuit       = (int)$data['dni_cuit'];
$genero_id      = (int)$data['genero_id'];

$rol_id            = 4; 
$estado_general_id = 1;
$fecha_nacimiento  = !empty($data['fecha_nacimiento']) ? $data['fecha_nacimiento'] : NULL;
$direccion_id      = !empty($data['direccion_id']) ? (int)$data['direccion_id'] : NULL;

try {
    $checkQuery = "SELECT username, email, dni_cuit FROM usuarios WHERE username = :username OR email = :email OR dni_cuit = :dni_cuit LIMIT 1";
    $stmtCheck = $conexion->prepare($checkQuery);
    $stmtCheck->execute([
        ':username' => $username,
        ':email'    => $email,
        ':dni_cuit' => $dni_cuit
    ]);

    if ($stmtCheck->rowCount() > 0) {
        $existente = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        $msg = "El registro ya existe.";
        if ($existente['username'] === $username) $msg = "El usuario ya existe.";
        elseif ($existente['email'] === $email) $msg = "El correo ya está registrado.";
        elseif ((int)$existente['dni_cuit'] === $dni_cuit) $msg = "El DNI/CUIT ya está registrado.";

        http_response_code(409);
        echo json_encode(["success" => false, "message" => $msg]);
        exit();
    }

    $password_hash = password_hash($password_plain, PASSWORD_BCRYPT);

    $insertQuery = "INSERT INTO usuarios 
        (username, password_hash, email, fecha_registro, nombre, apellido, dni_cuit, direccion_id, rol_id, genero_id, fecha_nacimiento, estado_general_id) 
        VALUES 
        (:username, :password_hash, :email, NOW(), :nombre, :apellido, :dni_cuit, :direccion_id, :rol_id, :genero_id, :fecha_nacimiento, :estado_general_id)";

    $stmtInsert = $conexion->prepare($insertQuery);
    $stmtInsert->execute([
        ':username'          => $username,
        ':password_hash'     => $password_hash,
        ':email'             => $email,
        ':nombre'            => $nombre,
        ':apellido'          => $apellido,
        ':dni_cuit'          => $dni_cuit,
        ':direccion_id'      => $direccion_id,
        ':rol_id'            => $rol_id,
        ':genero_id'         => $genero_id,
        ':fecha_nacimiento'  => $fecha_nacimiento,
        ':estado_general_id' => $estado_general_id
    ]);

    http_response_code(201);
    echo json_encode([
        "success"    => true,
        "message"    => "Usuario registrado exitosamente como Cliente.",
        "usuario_id" => (int)$conexion->lastInsertId()
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
}