<?php
session_start();
require("../conexion.php");

if (!isset($_SESSION['id_usuario']) || $_SESSION['id_rol'] != 2) {
    header("location: ../login.php");
    exit();
}

$id_user = $_SESSION['id_usuario'];

$query = "SELECT c.cantidad, p.nombre, p.precio, p.stock, p.id_producto 
          FROM carrito c 
          JOIN productos p ON c.id_producto = p.id_producto 
          WHERE c.id_usuario = $id_user";
$res_carrito = $conexion->query($query);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../estilos/estilo.css">
    <link rel="stylesheet" href="../estilos/carrito.css">
    <title>Mi Pedido | Terabyte</title>
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
                <a href="logout.php" class="btn-login">CERRAR SESIÓN</a>
            </nav>
        </div>
    </header>

    <main class="main-carrito" style="display: flex; gap: 20px; align-items: flex-start; justify-content: center; padding: 40px;">
        
        <div class="alerta-sesion" style="flex: 2; max-width: 800px; margin: 0;"> 
            <div class="decoracion-barra"></div>
            <section class="contenido-alerta">
                <h1>Productos</h1>
                <div class="lista-productos-tech">
                    <?php
                    $total = 0;
                    if ($res_carrito->num_rows > 0) {
                        while($item = $res_carrito->fetch_assoc()){ 
                            $id_p = $item['id_producto'];
                            $subtotal = $item['precio'] * $item['cantidad'];
                            $total += $subtotal;
                    ?>
                    <div class="fila-producto-carrito" id="fila-<?php echo $id_p; ?>" style="display: flex; border-bottom: 1px solid #eee; padding: 20px 0;">
                        <div style="flex: 2;">
                            <strong style="font-size: 1.1em; color: midnightblue;"><?php echo $item['nombre']; ?></strong>
                            <p style="color: #666; font-size: 0.9em;">Precio unitario: $<?php echo number_format($item['precio'], 0, ',', '.'); ?></p>
                        </div>
                        
                        <div class="controles-p" style="flex: 1; text-align: center;">
                            <div style="display: flex; align-items: center; border: 1px solid #ccc; border-radius: 5px; width: fit-content; margin: 0 auto;">
                                <button onclick="modificarCantidad(<?php echo $id_p; ?>, 'restar')" class="btn-mini" style="border:none; background:none; padding: 5px 15px; cursor:pointer;">-</button>
                                <span id="cant-<?php echo $id_p; ?>" style="padding: 0 10px; font-weight: bold; border-left: 1px solid #ccc; border-right: 1px solid #ccc;"><?php echo $item['cantidad']; ?></span>
                                <button onclick="modificarCantidad(<?php echo $id_p; ?>, 'sumar')" class="btn-mini" style="border:none; background:none; padding: 5px 15px; cursor:pointer;">+</button>
                            </div>
                            <small style="color: #999; display: block; margin-top: 5px;"><?php echo $item['stock']; ?> disponibles</small>
                        </div>

                        <div style="flex: 1; text-align: right;">
                            <strong style="font-size: 1.1em;">$<span id="sub-<?php echo $id_p; ?>"><?php echo number_format($subtotal, 0, ',', '.'); ?></span></strong>
                        </div>
                    </div>
                    <?php } } else { ?>
                        <p style="text-align:center; padding: 40px;">Tu carrito está vacío.</p>
                    <?php } ?>
                </div>
            </section>
        </div>

        <?php if ($total > 0) { ?>
        <div class="alerta-sesion" style="flex: 1; max-width: 350px; margin: 0; position: sticky; top: 20px;">
            <div class="decoracion-barra" style="background: #00d4ff;"></div>
            <section class="contenido-alerta" style="padding: 20px;">
                <h2 style="font-size: 1.2em; margin-bottom: 20px;">Resumen de compra</h2>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #555;">
                    <span>Subtotal</span>
                    <span>$<span id="total-resumen"><?php echo number_format($total, 0, ',', '.'); ?></span></span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; font-size: 1.3em; color: #000; border-top: 1px solid #eee; padding-top: 15px;">
                    <span>Total</span>
                    <span>$<span id="total-final"><?php echo number_format($total, 0, ',', '.'); ?></span></span>
                </div>
                <a href="finalizar_pago.php" class="btn-ingreso" style="display: block; text-align: center; text-decoration: none; width: 90%; border: none; padding: 15px; background: #3483fa; color: white; font-weight: bold; border-radius: 5px;">Continuar compra</a>
            </section>
        </div>
        <?php } ?>

    </main>

    <script>
        function modificarCantidad(id, accion) {
            const formData = new FormData();
            formData.append('id_p', id);
            formData.append('accion', accion);

            fetch('actualizar_carrito.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.nueva_cantidad > 0) {
                    document.getElementById('cant-' + id).innerText = data.nueva_cantidad;
                    document.getElementById('sub-' + id).innerText = data.nuevo_subtotal;
                    document.getElementById('total-resumen').innerText = data.nuevo_total;
                    document.getElementById('total-final').innerText = data.nuevo_total;
                } else {
                    location.reload(); 
                }
            })
            .catch(error => console.error('Error:', error));
        }
    </script>
</body>
</html>