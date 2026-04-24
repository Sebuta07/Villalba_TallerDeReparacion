<?php
require("conexion.php");

if (isset($_POST['btnregistrar'])) {
    $apellido = $_POST['apellido'];
    $nombre = $_POST['nombre'];
    $correo = $_POST['correo'];
    $pass = $_POST['password'];

    $sql = "INSERT INTO usuarios (apellido, nombre, correo, contraseña, id_rol, id_metodo_pago) VALUES ('$apellido', '$nombre', '$correo', '$pass', 2, 1)";
    
    if ($conexion->query($sql)) {
        echo "<script>alert('¡Registro exitoso! Ahora podés iniciar sesión.'); window.location='login.php';</script>";
    } else {
        echo "<div style='color:red; text-align:center; padding:10px; background: #ffe6e6;'>Error al registrar: " . $conexion->error . "</div>";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro | Terabyte</title>
    <link rel="stylesheet" href="estilos/estilo.css">
    <link rel="stylesheet" href="estilos/registrarse.css">
</head>
<body>
    <header>
        <div id="uno">T E R A B Y T E</div>
        <div id="dos">
            <nav id="opciones">
                <a href="index.html" class="nav-btn">INICIO</a>
                <a href="productos.php" class="nav-btn">PRODUCTOS</a>
                <a href="contacto.html" class="nav-btn">CONTACTO</a>
                <a href="carrito.php" class="nav-btn">CARRITO</a>
                <a href="login.php" class="btn-login">INICIAR SESIÓN</a>
            </nav>
        </div>
    </header>

    <main id="contenedor-registro">
        <form action="" method="POST" id="cuadro">
            <div id="titulo">
                <h2>REGISTRARSE</h2>
            </div>
            
            <div id="inputs">
                <label>Apellido</label>
                <input type="text" name="apellido" required>
                
                <label>Nombre</label>
                <input type="text" name="nombre" required>
                
                <label>Correo Electrónico</label>
                <input type="email" name="correo" required>
                
                <label>Contraseña</label>
                <input type="password" name="password" required>
                
                <div id="botones">
                    <input type="submit" name="btnregistrar" value="CREAR CUENTA" class="btn-comprar" style="width: 100%; border:none; cursor:pointer;">
                    <a href="login.php" class="link-volver">Ya tengo cuenta, quiero entrar</a>
                </div>
            </div>
        </form>
    </main>
</body>
</html>