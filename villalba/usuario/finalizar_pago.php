<?php
session_start();
require("../conexion.php");

if (!isset($_SESSION['id_usuario'])) {
    header("location: ../login.php");
    exit();
}

$id_user = $_SESSION['id_usuario'];

$res_metodos = $conexion->query("SELECT * FROM metodos_pago");

$query_total = "SELECT SUM(c.cantidad * p.precio) as total FROM carrito c JOIN productos p ON c.id_producto = p.id_producto WHERE c.id_usuario = $id_user";
$total_res = $conexion->query($query_total)->fetch_object();
$total_final = $total_res->total ?? 0;
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../estilos/estilo.css">
    <link rel="stylesheet" href="../estilos/carrito.css">
    <title>Pagar | Terabyte</title>
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
                <a href="../logout.php" class="btn-login">CERRAR SESIÓN</a>
            </nav>
        </div>
    </header>

    <main class="main-carrito" style="display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 40px;">
        
        <div class="alerta-sesion" style="max-width: 500px; width: 100%; margin: 0;"> 
            <div class="decoracion-barra" style="background: #3483fa;"></div>
            <section class="contenido-alerta" style="padding: 30px; text-align: center;">
                <h1 style="margin-bottom: 20px;">Finalizar Compra</h1>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="color: #666; margin-bottom: 5px;">Total a abonar:</p>
                    <h2 style="font-size: 2.5em; color: #000; margin: 0;">$<?php echo number_format($total_final, 0, ',', '.'); ?></h2>
                </div>

                <form action="procesar_compra.php" method="POST">
                    <div style="text-align: left; margin-bottom: 25px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 10px; color: midnightblue;">Método de Pago:</label>
                        <select name="id_metodo_pago" required style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 1em; background-color: white;">
                            <option value="" disabled selected>Elegí una opción...</option>
                            <?php while($m = $res_metodos->fetch_object()){ ?>
                                <option value="<?php echo $m->id_metodos_pago; ?>"><?php echo $m->metodo; ?></option>
                            <?php } ?>
                        </select>
                    </div>

                    <button type="submit" name="btnconfirmar" class="btn-ingreso" style="width: 100%; border: none; padding: 15px; background: #3483fa; color: white; font-weight: bold; font-size: 1.1em; border-radius: 5px; cursor: pointer; transition: background 0.3s;">
                        CONFIRMAR Y PAGAR
                    </button>
                    
                    <a href="carrito.php" style="display: block; margin-top: 15px; color: #3483fa; text-decoration: none; font-size: 0.9em;">Volver al carrito</a>
                </form>
            </section>
        </div>

    </main>

</body>
</html>