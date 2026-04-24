<?php
session_start();
require("../conexion.php");

if (!isset($_SESSION['id_usuario']) || $_SESSION['id_rol'] != 1) {
    header("location: ../login.php");
    exit();
}

if (isset($_POST['btnregistrar'])) {
    $nuevo_metodo = $_POST['metodo'];
    
    $sql_insert = "INSERT INTO metodos_pago (metodo) VALUES ('$nuevo_metodo')";
    
    if ($conexion->query($sql_insert)) {
        echo "<script>alert('¡Método de pago agregado!'); window.location='metodos_abml.php';</script>";
    }
}

if (isset($_POST['btnactualizar'])) {
    $id_m = $_POST['id_metodos_pago'];
    $nom = $_POST['metodo'];

    $sql_update = "UPDATE metodos_pago SET metodo='$nom' WHERE id_metodos_pago=$id_m";
    
    if($conexion->query($sql_update)){
        header("location: metodos_abml.php");
    }
}

if (isset($_GET['eliminar'])) {
    $id_el = $_GET['eliminar'];
    $conexion->query("DELETE FROM metodos_pago WHERE id_metodos_pago = $id_el");
    header("location: metodos_abml.php");
}

$metodos = $conexion->query("SELECT * FROM metodos_pago");
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../estilos/estilo.css">
    <link rel="stylesheet" href="estilos/admin.css">
    <title>Configuración | Métodos de Pago</title>
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
        
        <div class="contenedor-tabla" style="max-width: 500px; margin-bottom: 30px;">
            <h2 style="color: midnightblue;">Nuevo Método de Pago</h2>
            <form action="metodos_abml.php" method="POST" style="display: flex; gap: 10px;">
                <input type="text" name="metodo" placeholder="Ej: Mercado Pago" required style="flex-grow: 1;">
                <button type="submit" name="btnregistrar" class="btn-admin" style="width: auto; padding: 0 20px; border:none; cursor:pointer;">AÑADIR</button>
            </form>
        </div>

        <div class="contenedor-tabla" style="max-width: 600px;">
            <h2 style="color: midnightblue;">Métodos de Pago Registrados</h2>
            <table class="tabla-admin">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre del Método</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while($m = $metodos->fetch_object()){ ?>
                    <tr>
                        <form action="metodos_abml.php" method="POST">
                            <input type="hidden" name="id_metodos_pago" value="<?php echo $m->id_metodos_pago; ?>">
                            
                            <td style="width: 50px; color: gray;">#<?php echo $m->id_metodos_pago; ?></td>
                            
                            <td>
                                <input type="text" name="metodo" value="<?php echo $m->metodo; ?>" style="width: 100%;">
                            </td>
                            
                            <td style="width: 100px; text-align: center;">
                                <button type="submit" name="btnactualizar" title="Guardar cambios" style="background: #28a745; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">💾</button>
                                <a href="metodos_abml.php?eliminar=<?php echo $m->id_metodos_pago; ?>" onclick="return confirm('¿Eliminar este método?')" style="color: red; text-decoration: none; font-weight: bold; margin-left: 10px;">✕</a>
                            </td>
                        </form>
                    </tr>
                    <?php } ?>
                </tbody>
            </table>
        </div>

    </main>

</body>
</html>