<?php
session_start();
require("../conexion.php");

if (!isset($_SESSION['id_usuario']) || $_SESSION['id_rol'] != 1) {
    header("location: ../login.php");
    exit();
}

if (isset($_POST['btnregistrar'])) {
    $nombre = $_POST['nombre'];
    $desc = $_POST['descripcion'];
    $precio = $_POST['precio'];
    $stock = $_POST['stock'];
    $min = $_POST['minimo'];
    $max = $_POST['maximo'];
    
    $nombre_img = $_FILES['imagen']['name'];
    $ruta_temporal = $_FILES['imagen']['tmp_name'];
    $carpeta_destino = "imagenes/productos/";

    if (!file_exists($carpeta_destino)) {
        mkdir($carpeta_destino, 0777, true);
    }

    $ruta_final = $carpeta_destino . $nombre_img;

    if (move_uploaded_file($ruta_temporal, $ruta_final)) {
        $sql_insert = "INSERT INTO productos (nombre, descripcion, precio, stock, minimo, maximo, imagen) 
                       VALUES ('$nombre', '$desc', $precio, $stock, $min, $max, '$nombre_img')";
        
        if ($conexion->query($sql_insert)) {
            echo "<script>alert('¡Producto y foto guardados!'); window.location='productos_abml.php';</script>";
        }
    } else {
        echo "<script>alert('Error al subir la imagen física. Revisá los permisos de la carpeta.');</script>";
    }
}

if (isset($_POST['btnactualizar'])) {
    $id_p = $_POST['id_producto'];
    $nom = $_POST['nombre'];
    $des = $_POST['descripcion'];
    $pre = $_POST['precio'];
    $stk = $_POST['stock'];
    $min = $_POST['minimo'];
    $max = $_POST['maximo'];

    $sql_update = "UPDATE productos SET nombre='$nom', descripcion='$des', precio=$pre, stock=$stk, minimo=$min, maximo=$max WHERE id_producto=$id_p";
    
    if($conexion->query($sql_update)){
        header("location: productos_abml.php");
    }
}

if (isset($_GET['eliminar'])) {
    $id_el = $_GET['eliminar'];
    $conexion->query("DELETE FROM productos WHERE id_producto = $id_el");
    header("location: productos_abml.php");
}

$productos = $conexion->query("SELECT * FROM productos");
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../estilos/estilo.css">
    <link rel="stylesheet" href="estilos/admin.css">
    <title>Inventario | Terabyte</title>
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
        
        <div class="contenedor-tabla" style="max-width: 800px; margin-bottom: 30px;">
            <h2 style="color: midnightblue;">Registrar Nuevo Componente</h2>
            <form action="productos_abml.php" method="POST" enctype="multipart/form-data" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <input type="text" name="nombre" placeholder="Nombre (Ej: RX 580)" required>
                <input type="text" name="descripcion" placeholder="Descripción breve" required>
                <input type="number" name="precio" placeholder="Precio ($)" required>
                <input type="number" name="stock" placeholder="Stock Inicial" required>
                <input type="number" name="minimo" placeholder="Mínimo" required>
                <input type="number" name="maximo" placeholder="Máximo" required>
                
                <div style="grid-column: span 2;">
                    <label style="font-size: 0.8em; color: #666;">Seleccionar Imagen:</label>
                    <input type="file" name="imagen" accept="image/*" required>
                </div>

                <button type="submit" name="btnregistrar" class="btn-admin" style="grid-column: span 2; border:none; cursor:pointer;">GUARDAR PRODUCTO</button>
            </form>
        </div>

        <div class="contenedor-tabla">
            <h2 style="color: midnightblue;">Inventario Actual</h2>
            <table class="tabla-admin">
                <thead>
                    <tr>
                        <th>IMG</th>
                        <th>Producto / Descripción</th>
                        <th>Stock (Mín/Máx)</th>
                        <th>Precio</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while($p = $productos->fetch_object()){ ?>
                    <tr>
                        <form action="productos_abml.php" method="POST">
                            <input type="hidden" name="id_producto" value="<?php echo $p->id_producto; ?>">
                            
                            <td>
                                <img src="imagenes/productos/<?php echo $p->imagen; ?>" width="50" height="50" style="object-fit: cover; border-radius: 4px;">
                            </td>
                            
                            <td>
                                <input type="text" name="nombre" value="<?php echo $p->nombre; ?>" style="width: 100%; font-weight: bold; margin-bottom: 4px;">
                                <input type="text" name="descripcion" value="<?php echo $p->descripcion; ?>" style="width: 100%; font-size: 0.8em;">
                            </td>
                            
                            <td>
                                <input type="number" name="stock" value="<?php echo $p->stock; ?>" style="width: 45px;">
                                <span style="font-size: 0.7em;">( <input type="number" name="minimo" value="<?php echo $p->minimo; ?>" style="width: 35px;"> / <input type="number" name="maximo" value="<?php echo $p->maximo; ?>" style="width: 35px;"> )</span>
                            </td>
                            
                            <td>
                                <input type="number" name="precio" value="<?php echo $p->precio; ?>" style="width: 85px;">
                            </td>
                            
                            <td>
                                <button type="submit" name="btnactualizar" title="Guardar cambios" style="background: #28a745; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">💾</button>
                                <a href="productos_abml.php?eliminar=<?php echo $p->id_producto; ?>" onclick="return confirm('¿Eliminar producto?')" style="color: red; text-decoration: none; font-weight: bold; margin-left: 8px;">✕</a>
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