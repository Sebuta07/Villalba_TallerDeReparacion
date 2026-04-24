<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="estilos/estilo.css">
    <link rel="stylesheet" href="estilos/carrito.css">
    <title>Carrito de Compras | Terabyte</title>
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

    <main class="main-carrito">
        <div class="alerta-sesion">
            <div class="decoracion-barra"></div>
            
            <section class="contenido-alerta">
                <h1>ACCESO AL CARRITO</h1>
                <p>Para gestionar pedidos, reservar stock de componentes y procesar pagos, es necesario validar tu identidad en nuestro sistema.</p>

                <div class="acciones-carrito">
                    <a href="login.php" class="btn-ingreso">INICIAR SESIÓN</a>
                    <span class="separador">o</span>
                    <a href="registrarse.php" class="btn-registro-link">REGISTRARSE</a>
                </div>
            </section>

            <div class="footer-alerta">
                <a href="productos.php">VOLVER AL CATÁLOGO DE PRODUCTOS</a>
            </div>
        </div>
    </main>

</body>
</html>