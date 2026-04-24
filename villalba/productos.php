<?php
require("conexion.php");
$sql = "SELECT * FROM productos";
$productito = $conexion->query($sql);
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="estilos/estilo.css">
    <link rel="stylesheet" href="estilos/productos.css">
    <title>Productos | Terabyte</title>
</head>

<body>
    <div id="sidebar" class="sidebar">
        <div class="sidebar-header">
            <h3>Categorías</h3>
            <button class="close-btn" onclick="toggleSidebar()">×</button>
        </div>
        <ul>
            <li><a href="productos.php">Todos</a></li>
            <li><a href="#">Celulares</a></li>
            <li><a href="#">Computadoras</a></li>
            <li><a href="#">Componentes</a></li>
            <li><a href="#">Auriculares</a></li>
            <li><a href="#">Accesorios</a></li>
        </ul>
    </div>

    <header>
        <div id="btn-menu-lateral" onclick="toggleSidebar()">≡</div>
        
        <div id="uno">T E R A B Y T E</div>
        <div id="dos">
            <nav id="opciones">
                <a href="index.html" class="nav-btn">INICIO</a>
                <a href="productos.php" class="nav-btn">PRODUCTOS</a>
                <a href="contacto.html" class="nav-btn">CONTACTO</a>
                <a href="login.php" class="nav-btn">CARRITO</a>
                <a href="login.php" class="btn-login">INICIAR SESIÓN</a>
            </nav>
        </div>
    </header>

    <main class="contenedor-productos">
        <h2 class="titulo-seccion">Nuestro Catálogo Tech</h2>

        <div class="grilla-productos">
            <?php while ($producto = mysqli_fetch_assoc($productito)) { ?>
                <div class="carta">
                    <div class="imagen-contenedor" style="height: 200px; display: flex; align-items: center; justify-content: center; background: #fff; overflow: hidden;">
                        <?php if (!empty($producto['imagen'])): ?>
                            <img src="admin/imagenes/productos/<?php echo $producto['imagen']; ?>" 
                                 alt="<?php echo $producto['nombre'] ?>" 
                                 style="max-width: 100%; max-height: 100%; object-fit: contain;">
                        <?php else: ?>
                            <img src="img/placeholder.jpg" alt="Sin imagen">
                        <?php endif; ?>
                    </div>

                    <div class="info-producto">
                        <h3 class="nombre"><?php echo $producto["nombre"] ?></h3>
                        <p class="descripcion"><?php echo $producto["descripcion"] ?></p>
                        <div class="footer-carta">
                            <span class="precio">$<?php echo number_format($producto["precio"], 0, ',', '.'); ?></span>
                            <a href="login.php" class="btn-comprar">Agregar</a>
                        </div>
                    </div>
                </div>
            <?php } ?>
        </div>
    </main>

    <script>
        function toggleSidebar() {
            document.getElementById("sidebar").classList.toggle("active");
        }
    </script>
</body>
</html>