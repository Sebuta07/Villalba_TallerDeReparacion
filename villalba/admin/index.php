<?php
session_start();
require("../conexion.php");

if (!isset($_SESSION['id_usuario']) || $_SESSION['id_rol'] != 1) {
    header("location: ../login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../estilos/estilo.css">
    <link rel="stylesheet" href="../estilos/admin.css">
    <title>Panel Admin | Terabyte</title>
</head>
<body>

    <header>
        <div id="uno">T E R A B Y T E - ADMIN</div>
        <div id="dos">
            <nav id="opciones">
                <a href="productos_abml.php" class="nav-btn">PRODUCTOS</a>
                <a href="usuarios_abml.php" class="nav-btn">USUARIOS</a>
                <a href="metodos_abml.php" class="nav-btn">PAGOS</a>
                <a href="ventas_reporte.php" class="nav-btn">VENTAS</a>
                <a href="../logout.php" class="btn-login">CERRAR SESIÓN</a>
            </nav>
        </div>
    </header>

    <main style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh;">
        
        <div class="admin-welcome" style="background: white; padding: 60px; border-radius: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); max-width: 800px; text-align: center; border-top: 5px solid midnightblue;">
            <h1 style="color: midnightblue; margin-bottom: 20px;">¡Bienvenido, Administrador!</h1>
            <p style="font-size: 1.2em; color: #555; line-height: 1.6;">
                Estás en el panel de control de <strong>Terabyte</strong>. <br>
                Usá la barra de navegación superior para gestionar el sistema.
            </p>
        </div>

    </main>

</body>
</html>