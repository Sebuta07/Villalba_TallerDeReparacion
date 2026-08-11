<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "taller_electronica";

try {
    $conexion = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
    exit();
}