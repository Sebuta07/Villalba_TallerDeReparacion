<?php
session_start();
require("conexion.php");

if (isset($_POST['btningresar'])) {
    $correo = $_POST['usuario']; 
    $password = $_POST['password'];

    $sql = "SELECT * FROM usuarios WHERE correo = '$correo' AND contraseña = '$password'";
    $resultado = $conexion->query($sql);

    if ($datos = $resultado->fetch_object()) {
        $_SESSION['id_usuario'] = $datos->id_usuario;
        $_SESSION['nombre'] = $datos->nombre;
        $_SESSION['id_rol'] = $datos->id_rol;
    
        if($_SESSION['id_rol'] == 2) {
            header("location: usuario/index.html"); 
            exit();
        } else {
            header("location: admin/index.php");
            exit();
        }
    } else {
        echo "<script>alert('Datos incorrectos');</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="estilos/estilo.css">
    <title>Login | Terabyte</title>
    <style>
        body {
            background-color: #f0f2f5;
            margin: 0;
        }
        .contenedor-login {
            display: flex;
            justify-content: center;
            align-items: center;
            height: calc(100vh - 80px);
        }
        .formulario {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            width: 350px;
            text-align: center;
        }
        h2 { color: midnightblue; margin-bottom: 20px; font-family: 'Franklin Gothic Medium', Arial; }
        input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-sizing: border-box; 
        }
        .btn-enviar {
            background-color: midnightblue;
            color: white;
            border: none;
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            transition: 0.3s;
        }
        .btn-enviar:hover { background-color: #001f3f; transform: scale(1.02); }
    </style>
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
            <a href="registrarse.php" class="btn-login">REGISTRARSE</a>
        </nav>
    </div>
</header>

<main class="contenedor-login">
    <form action="" method="POST" class="formulario">
        <h2>Iniciar Sesión</h2>
        
        <input type="text" name="usuario" placeholder="Nombre de Usuario" required>
        <input type="password" name="password" placeholder="Contraseña" required>
        
        <input type="submit" name="btningresar" value="INGRESAR" class="btn-enviar">
        
        <p style="margin-top:20px; font-size: 14px; color: #555;">
            ¿No tenés cuenta? <a href="registrarse.php" style="color: midnightblue; font-weight: bold; text-decoration: none;">Registrate acá</a>
        </p>
    </form>
</main>

</body>
</html>