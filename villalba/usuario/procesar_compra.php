<?php
session_start();
require("../conexion.php");

if (isset($_POST['btnconfirmar'])) {
    $id_user = $_SESSION['id_usuario'];
    $id_metodo = $_POST['id_metodo_pago'];
    $fecha = date("Y-m-d");

    $conexion->begin_transaction();

    try {
        $res_carrito = $conexion->query("SELECT c.*, p.precio, p.stock FROM carrito c JOIN productos p ON c.id_producto = p.id_producto WHERE c.id_usuario = $id_user");
        
        if ($res_carrito->num_rows == 0) {
            throw new Exception("Carrito vacío");
        }

        $total_venta = 0;
        $items = [];
        while ($r = $res_carrito->fetch_assoc()) {
            $total_venta += ($r['precio'] * $r['cantidad']);
            $items[] = $r;
        }

        $conexion->query("INSERT INTO ventas (fecha, id_cliente, id_metodo_pago, total) VALUES ('$fecha', $id_user, $id_metodo, $total_venta)");
        $id_venta = $conexion->insert_id;

        foreach ($items as $i) {
            $id_p = $i['id_producto'];
            $cant = $i['cantidad'];
            $pre = $i['precio'];

            $conexion->query("INSERT INTO detalles_ventas (id_venta, id_producto, cantidad, precio_unidad) VALUES ($id_venta, $id_p, $cant, $pre)");
            $conexion->query("UPDATE productos SET stock = stock - $cant WHERE id_producto = $id_p");
        }

        $conexion->query("DELETE FROM carrito WHERE id_usuario = $id_user");

        $conexion->commit();
        echo "<script>alert('Compra Exitosa'); window.location='carrito.php';</script>";

    } catch (Exception $e) {
        $conexion->rollback();
        echo "Error: " . $e->getMessage();
    }
} else {
    header("location: carrito.php");
}
?>