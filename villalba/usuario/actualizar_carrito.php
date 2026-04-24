<?php
session_start();
require("../conexion.php");

if (isset($_POST['id_p']) && isset($_POST['accion'])) {
    $id_user = $_SESSION['id_usuario'];
    $id_prod = $_POST['id_p'];
    $accion = $_POST['accion'];

    $res = $conexion->query("SELECT stock, precio FROM productos WHERE id_producto = $id_prod");
    $p = $res->fetch_object();

    $check = $conexion->query("SELECT cantidad FROM carrito WHERE id_usuario = $id_user AND id_producto = $id_prod");
    
    if ($check->num_rows > 0) {
        $fila = $check->fetch_object();
        $cant_actual = $fila->cantidad;

        if ($accion == 'sumar' && $cant_actual < $p->stock) {
            $conexion->query("UPDATE carrito SET cantidad = cantidad + 1 WHERE id_usuario = $id_user AND id_producto = $id_prod");
        } else if ($accion == 'restar' && $cant_actual > 1) {
            $conexion->query("UPDATE carrito SET cantidad = cantidad - 1 WHERE id_usuario = $id_user AND id_producto = $id_prod");
        } else if ($accion == 'eliminar') {
            $conexion->query("DELETE FROM carrito WHERE id_usuario = $id_user AND id_producto = $id_prod");
        }
    }

    $res_cant = $conexion->query("SELECT cantidad FROM carrito WHERE id_usuario = $id_user AND id_producto = $id_prod");
    $nueva_cant = ($res_cant->num_rows > 0) ? $res_cant->fetch_object()->cantidad : 0;
    
    $total_res = $conexion->query("SELECT SUM(c.cantidad * p.precio) as total FROM carrito c JOIN productos p ON c.id_producto = p.id_producto WHERE c.id_usuario = $id_user");
    $total_final = $total_res->fetch_object()->total ?? 0;

    echo json_encode([
        'nueva_cantidad' => $nueva_cant,
        'nuevo_subtotal' => number_format($p->precio * $nueva_cant, 0, ',', '.'),
        'nuevo_total' => number_format($total_final, 0, ',', '.')
    ]);
}