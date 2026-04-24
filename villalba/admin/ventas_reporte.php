<?php
session_start();
require("../conexion.php");

if (!isset($_SESSION['id_usuario']) || $_SESSION['id_rol'] != 1) {
    header("location: ../login.php");
    exit();
}

$sql = "SELECT v.id_venta, v.fecha, v.total, u.nombre, u.apellido, u.correo 
        FROM ventas v 
        INNER JOIN usuarios u ON v.id_cliente = u.id_usuario 
        ORDER BY v.fecha DESC";

$reporte = $conexion->query($sql);

if (isset($_GET['eliminar'])) {
    $id_v = $_GET['eliminar'];
    $conexion->query("DELETE FROM ventas WHERE id_venta = $id_v");
    header("location: ventas_reporte.php");
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../estilos/estilo.css">
    <link rel="stylesheet" href="estilos/admin.css">
    <title>Reporte de Ventas | Terabyte</title>
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
                <a href="logout.php" class="btn-login">CERRAR SESIÓN</a>
            </nav>
        </div>
    </header>   

    <main style="padding: 20px;">
        <div class="contenedor-tabla">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: midnightblue;">Historial de Transacciones</h2>
                <button onclick="window.print();" class="btn-admin" style="background: #6c757d; border:none; width: auto; padding: 10px 20px;">Imprimir Reporte</button>
            </div>

            <table class="tabla-admin">
                <thead>
                    <tr>
                        <th>ID Venta</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Contacto</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <?php 
                    $recaudacion_total = 0;
                    if($reporte && $reporte->num_rows > 0){
                        while($v = $reporte->fetch_object()){ 
                            $recaudacion_total += $v->total;
                    ?>
                    <tr>
                        <td>#<?php echo $v->id_venta; ?></td>
                        <td><?php echo date("d/m/Y", strtotime($v->fecha)); ?></td>
                        <td><?php echo $v->apellido . ", " . $v->nombre; ?></td>
                        <td style="font-size: 0.85em; color: #666;"><?php echo $v->correo; ?></td>
                        <td style="font-weight: bold; color: #28a745;">$<?php echo number_format($v->total, 0, ',', '.'); ?></td>
                    </tr>
                    <?php 
                        } 
                    } else {
                        echo "<tr><td colspan='6' style='text-align:center;'>No hay ventas.</td></tr>";
                    }
                    ?>
                </tbody>
                <tfoot>
                    <tr style="background: #f1f1f1; font-size: 1.1em;">
                        <td colspan="4" style="text-align: right; font-weight: bold; padding: 10px;">RECAUDACIÓN TOTAL:</td>
                        <td style="font-weight: bold; color: #28a745;">$<?php echo number_format($recaudacion_total, 0, ',', '.'); ?></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </main>
</body>
</html>