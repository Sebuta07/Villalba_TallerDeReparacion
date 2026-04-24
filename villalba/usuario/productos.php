<?php
session_start();
require("../conexion.php");

if (!isset($_SESSION['id_usuario']) || $_SESSION['id_rol'] != 2) {
    header("location: ../login.php");
    exit();
}

$id_user = $_SESSION['id_usuario'];

if (isset($_GET['agregar_id'])) {
    $id_prod = $_GET['agregar_id'];
    $nombre_p = $_GET['nombre_p'];

    $check = $conexion->query("SELECT cantidad FROM carrito WHERE id_usuario = $id_user AND id_producto = $id_prod");

    if ($check->num_rows > 0) {
        $conexion->query("UPDATE carrito SET cantidad = cantidad + 1 WHERE id_usuario = $id_user AND id_producto = $id_prod");
    } else {
        $conexion->query("INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES ($id_user, $id_prod, 1)");
    }

    echo "<script>alert('¡$nombre_p agregado al carrito!'); window.location='productos.php';</script>";
}

$sql = "SELECT * FROM productos";
$productito = $conexion->query($sql);
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../estilos/estilo.css">
    <link rel="stylesheet" href="../estilos/productos.css">
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
                <a href="carrito.php" class="nav-btn">CARRITO</a>
                <a href="logout.php" class="btn-login">CERRAR SESIÓN</a>
            </nav>
        </div>
    </header>

    <main class="contenedor-productos">
        <h2 class="titulo-seccion">Nuestro Catálogo Tech</h2>

        <div class="grilla-productos">
            <?php while ($producto = mysqli_fetch_assoc($productito)) { ?>
                <div class="carta">
                    <div class="imagen-contenedor">
                        <?php if (!empty($producto['imagen'])): ?>
                            <img src="../admin/imagenes/productos/<?php echo $producto['imagen']; ?>"
                                alt="<?php echo $producto['nombre']; ?>"
                                style="width: 100%; height: 200px; object-fit: contain;">
                        <?php else: ?>
                            <img src="../imagenes/placeholder.jpg" alt="Sin imagen">
                        <?php endif; ?>
                    </div>

                    <div class="info-producto">
                        <h3 class="nombre"><?php echo $producto["nombre"] ?></h3>
                        <p class="descripcion" style="height: 40px; overflow: hidden; font-size: 0.9em; color: #666;">
                            <?php echo $producto["descripcion"] ?>
                        </p>

                        <div class="footer-carta">
                            <span class="precio">$<?php echo number_format($producto["precio"], 0, ',', '.'); ?></span>
                            <a href="productos.php?agregar_id=<?php echo $producto['id_producto']; ?>&nombre_p=<?php echo urlencode($producto['nombre']); ?>"
                                class="btn-comprar">
                                AGREGAR
                            </a>
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