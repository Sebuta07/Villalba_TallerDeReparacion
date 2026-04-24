<?php
session_start();
require("../conexion.php");

if (!isset($_SESSION['id_usuario']) || $_SESSION['id_rol'] != 1) {
    header("location: ../login.php");
    exit();
}

if (isset($_POST['btnregistrar'])) {
    $apellido = $_POST['apellido'];
    $nombre = $_POST['nombre'];
    $correo = $_POST['correo'];
    $telefono = $_POST['telefono'];
    $pass = $_POST['contrasena'];
    $rol = $_POST['id_rol'];
    $metodo = $_POST['id_metodo_pago'];

    $sql_insert = "INSERT INTO usuarios (apellido, nombre, correo, telefono, contraseña, id_rol, id_metodo_pago) 
                   VALUES ('$apellido', '$nombre', '$correo', '$telefono', '$pass', $rol, $metodo)";
    
    if ($conexion->query($sql_insert)) {
        echo "<script>alert('¡Usuario registrado correctamente!'); window.location='usuarios_abml.php';</script>";
    } else {
        echo "<script>alert('Error al registrar usuario.');</script>";
    }
}

if (isset($_POST['btnactualizar'])) {
    $id_u = $_POST['id_usuario'];
    $ape = $_POST['apellido'];
    $nom = $_POST['nombre'];
    $eml = $_POST['correo'];
    $tel = $_POST['telefono'];
    $pwd = $_POST['contrasena'];
    $rol = $_POST['id_rol'];

    $sql_update = "UPDATE usuarios SET apellido='$ape', nombre='$nom', correo='$eml', telefono='$tel', contraseña='$pwd', id_rol=$rol WHERE id_usuario=$id_u";
    
    if($conexion->query($sql_update)){
        header("location: usuarios_abml.php");
    }
}

if (isset($_GET['eliminar'])) {
    $id_el = $_GET['eliminar'];
    if($id_el == $_SESSION['id_usuario']){
        echo "<script>alert('No podés eliminar tu propia cuenta de administrador.'); window.location='usuarios_abml.php';</script>";
    } else {
        $conexion->query("DELETE FROM usuarios WHERE id_usuario = $id_el");
        header("location: usuarios_abml.php");
    }
}

$usuarios = $conexion->query("SELECT * FROM usuarios");
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../estilos/estilo.css">
    <link rel="stylesheet" href="estilos/admin.css">
    <title>Gestión de Usuarios | Terabyte</title>
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
        
        <div class="contenedor-tabla" style="max-width: 900px; margin-bottom: 30px;">
            <h2 style="color: midnightblue;">Registrar Nuevo Usuario</h2>
            <form action="usuarios_abml.php" method="POST" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <input type="text" name="apellido" placeholder="Apellido" required>
                <input type="text" name="nombre" placeholder="Nombre" required>
                <input type="email" name="correo" placeholder="Correo electrónico" required>
                <input type="text" name="telefono" placeholder="Teléfono" required>
                <input type="text" name="contrasena" placeholder="Contraseña" required>
                
                <select name="id_rol" required>
                    <option value="" disabled selected>Seleccionar Rol</option>
                    <option value="1">Administrador</option>
                    <option value="2">Usuario</option>
                </select>

                <select name="id_metodo_pago" required>
                    <option value="0">Sin método (Default)</option>
                    <option value="1">Tarjeta de Crédito</option>
                    <option value="2">Efectivo / Transferencia</option>
                </select>

                <button type="submit" name="btnregistrar" class="btn-admin" style="grid-column: span 1; border:none; cursor:pointer;">REGISTRAR</button>
            </form>
        </div>

        <div class="contenedor-tabla">
            <h2 style="color: midnightblue;">Usuarios en el Sistema</h2>
            <table class="tabla-admin">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre y Apellido</th>
                        <th>Contacto</th>
                        <th>Pass</th>
                        <th>Rol</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while($u = $usuarios->fetch_object()){ ?>
                    <tr>
                        <form action="usuarios_abml.php" method="POST">
                            <input type="hidden" name="id_usuario" value="<?php echo $u->id_usuario; ?>">
                            
                            <td style="font-size: 0.8em; color: gray;"><?php echo $u->id_usuario; ?></td>
                            
                            <td>
                                <input type="text" name="nombre" value="<?php echo $u->nombre; ?>" style="width: 45%; margin-right: 2%;">
                                <input type="text" name="apellido" value="<?php echo $u->apellido; ?>" style="width: 45%;">
                            </td>
                            
                            <td>
                                <input type="text" name="correo" value="<?php echo $u->correo; ?>" style="width: 100%; font-size: 0.8em; margin-bottom: 3px;">
                                <input type="text" name="telefono" value="<?php echo $u->telefono; ?>" style="width: 100%; font-size: 0.8em;">
                            </td>
                            
                            <td>
                                <input type="text" name="contrasena" value="<?php echo $u->contraseña; ?>" style="width: 80px;">
                            </td>

                            <td>
                                <select name="id_rol" style="width: 70px;">
                                    <option value="1" <?php if($u->id_rol == 1) echo 'selected'; ?>>Admin</option>
                                    <option value="2" <?php if($u->id_rol == 2) echo 'selected'; ?>>Usuario</option>
                                </select>
                            </td>
                            
                            <td>
                                <button type="submit" name="btnactualizar" title="Actualizar" style="background: #28a745; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">💾</button>
                                <a href="usuarios_abml.php?eliminar=<?php echo $u->id_usuario; ?>" onclick="return confirm('¿Eliminar a este usuario?')" style="color: red; text-decoration: none; font-weight: bold; margin-left: 8px;">✕</a>
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