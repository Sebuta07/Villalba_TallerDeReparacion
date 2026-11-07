import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Producto {
  productos_id: number;
  nombre: string;
  descripcion: string;
  precio_venta: string;
  garantia: number;
  observaciones?: string;
  categoria: string;
  marca: string;
  modelo: string;
  codigo_barra: string;
  imagen?: string;
  estado_general_id: number;
}

interface ItemCarrito extends Producto {
  cantidad: number;
  observacionesItem?: string; 
}

interface Usuario {
  [key: string]: any; 
  nombre: string;
  apellido?: string;
  dni_cuit: number | string;
  email: string;
}

interface MetodoPagoAsignado {
  forma_pago_id: number;
  nombre: string;
  monto: string;
}

export default function CarritoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const carritoInicial: ItemCarrito[] = params.carritoInicial 
    ? JSON.parse(params.carritoInicial as string).map((item: any) => ({ ...item, observacionesItem: '' })) 
    : [];
  
  const empleadoId = params.empleadoId ? Number(params.empleadoId) : 1;

  const [carrito, setCarrito] = useState<ItemCarrito[]>(carritoInicial);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);
  const [busquedaUsuario, setBusquedaUsuario] = useState<string>('');
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(true);
  const [procesandoVenta, setProcesandoVenta] = useState<boolean>(false);

  const [pagosSeleccionados, setPagosSeleccionados] = useState<MetodoPagoAsignado[]>([
    { forma_pago_id: 1, nombre: 'Efectivo', monto: '' }
  ]);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [nuevoApellido, setNuevoApellido] = useState<string>('');
  const [nuevoDni, setNuevoDni] = useState<string>('');
  const [nuevoEmail, setNuevoEmail] = useState<string>('');
  const [nuevoTelefono, setNuevoTelefono] = useState<string>('');
  const [nuevoDireccion, setNuevoDireccion] = useState<string>('');
  const [nuevoLocalidad, setNuevoLocalidad] = useState<string>('');
  const [nuevoUsername, setNuevoUsername] = useState<string>('');

  const obtenerIdUsuario = (item: any): number => {
    if (!item) return 0;
    const posibleId = item.usuario_id || item.usuarios_id || item.id || item.id_usuario;
    return Number(posibleId) || 0;
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/recepcionista/registrar_venta.php`);
      const data = await response.json();
      
      let listaUsuarios = [];
      if (Array.isArray(data)) {
        listaUsuarios = data;
      } else if (data.datos && Array.isArray(data.datos)) {
        listaUsuarios = data.datos;
      } else if (data.usuarios && Array.isArray(data.usuarios)) {
        listaUsuarios = data.usuarios;
      }

      setUsuarios(listaUsuarios);

      if (listaUsuarios.length > 0) {
        const primerId = obtenerIdUsuario(listaUsuarios[0]);
        if (primerId > 0) setUsuarioSeleccionado(primerId);
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const modificarCantidad = (productos_id: number, operacion: 'sumar' | 'restar') => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.productos_id === productos_id) {
            const nuevaCantidad = operacion === 'sumar' ? item.cantidad + 1 : item.cantidad - 1;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean) as ItemCarrito[]
    );
  };

  const actualizarObservacionItem = (productos_id: number, texto: string) => {
    setCarrito((prev) =>
      prev.map((item) => 
        item.productos_id === productos_id ? { ...item, observacionesItem: texto } : item
      )
    );
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, item) => acc + Number(item.precio_venta) * item.cantidad, 0);
  };

  const agregarMetodoPago = () => {
    setPagosSeleccionados([...pagosSeleccionados, { forma_pago_id: 2, nombre: 'Tarjeta Débito/Crédito', monto: '' }]);
  };

  const eliminarMetodoPago = (index: number) => {
    if (pagosSeleccionados.length === 1) {
      Alert.alert('Atención', 'Debe haber al menos un método de pago.');
      return;
    }
    const nuevosPagos = pagosSeleccionados.filter((_, i) => i !== index);
    setPagosSeleccionados(nuevosPagos);
  };

  const actualizarMontoPago = (index: number, monto: string) => {
    const nuevosPagos = [...pagosSeleccionados];
    nuevosPagos[index].monto = monto;
    setPagosSeleccionados(nuevosPagos);
  };

  const actualizarTipoPago = (index: number, id: number, nombre: string) => {
    const nuevosPagos = [...pagosSeleccionados];
    nuevosPagos[index].forma_pago_id = id;
    nuevosPagos[index].nombre = nombre;
    setPagosSeleccionados(nuevosPagos);
  };

  const validarPagos = (totalVenta: number) => {
    const sumaPagos = pagosSeleccionados.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
    if (Math.abs(sumaPagos - totalVenta) > 0.05) {
      Alert.alert('Error en pagos', `La suma de los pagos ($${sumaPagos.toFixed(2)}) no coincide con el total de la venta ($${totalVenta.toFixed(2)}).`);
      return false;
    }
    return true;
  };

  const registrarVenta = async () => {
    if (carrito.length === 0) {
      Alert.alert('Error', 'El carrito está vacío.');
      return;
    }
    
    if (!usuarioSeleccionado || isNaN(usuarioSeleccionado) || usuarioSeleccionado === 0) {
      Alert.alert('Atención', 'Por favor selecciona un cliente antes de cobrar.');
      return;
    }

    const totalVenta = calcularTotal();
    if (!validarPagos(totalVenta)) return;

    setProcesandoVenta(true);

    try {
      const datosVenta = {
        empleado_id: empleadoId,
        usuario_id: Number(usuarioSeleccionado),
        total: totalVenta.toFixed(2),
        estado_general_id: 1,
        pagos: pagosSeleccionados.map(p => ({
          forma_pago_id: p.forma_pago_id,
          monto: Number(p.monto)
        })),
        productos: carrito.map((item) => ({
          productos_id: item.productos_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta,
          subtotal: Number(item.precio_venta) * item.cantidad,
          observaciones: item.observacionesItem || ''
        }))
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/recepcionista/registrar_venta.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosVenta),
      });

      const resultado = await response.json();

      if (resultado.estado === 'success') {
        const idVentaGenerado = resultado.venta_id || resultado.id || 'N/D';
        
        router.replace({
          pathname: './ticket',
          params: {
            ventaId: String(idVentaGenerado),
            empleadoId: String(empleadoId),
            carrito: JSON.stringify(carrito),
            total: String(totalVenta),
            fecha: new Date().toLocaleString()
          }
        });
      } else {
        Alert.alert('Error', resultado.mensaje || 'No se pudo registrar la venta.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setProcesandoVenta(false);
    }
  };

  const registrarVentaConUsuarioNuevo = async () => {
    if (!nuevoNombre.trim() || !nuevoDni.trim() || !nuevoTelefono.trim() || !nuevoEmail.trim()) {
      Alert.alert('Atención', 'Complete Nombre, DNI/CUIT, Teléfono y Correo.');
      return;
    }

    const totalVenta = calcularTotal();
    if (!validarPagos(totalVenta)) return;

    setProcesandoVenta(true);

    try {
      const datosVenta = {
        empleado_id: empleadoId,
        usuario_id: null,
        total: totalVenta.toFixed(2),
        estado_general_id: 1,
        pagos: pagosSeleccionados.map(p => ({
          forma_pago_id: p.forma_pago_id,
          monto: Number(p.monto)
        })),
        productos: carrito.map((item) => ({
          productos_id: item.productos_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta,
          subtotal: Number(item.precio_venta) * item.cantidad,
          observaciones: item.observacionesItem || ''
        })),
        nuevo_usuario: {
          nombre: nuevoNombre,
          apellido: nuevoApellido,
          dni_cuit: Number(nuevoDni),
          email: nuevoEmail,
          telefono: nuevoTelefono,
          direccion: nuevoDireccion || 'Sin dirección',
          localidad: nuevoLocalidad || 'Sin localidad',
          username: nuevoUsername.trim() || nuevoNombre.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
          password: '123'
        }
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/recepcionista/registrar_venta.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosVenta),
      });

      const resultado = await response.json();

      if (resultado.estado === 'success') {
        setModalVisible(false);
        const idVentaGenerado = resultado.venta_id || resultado.id || 'N/D';

        router.replace({
          pathname: './ticket',
          params: {
            ventaId: String(idVentaGenerado),
            empleadoId: String(empleadoId),
            carrito: JSON.stringify(carrito),
            total: String(totalVenta),
            fecha: new Date().toLocaleString()
          }
        });
      } else {
        Alert.alert('Error', resultado.mensaje || 'No se pudo registrar la venta.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error de conexión', 'No se pudo conectar.');
    } finally {
      setProcesandoVenta(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) || 
    (u.apellido && u.apellido.toLowerCase().includes(busquedaUsuario.toLowerCase())) ||
    String(u.dni_cuit).includes(busquedaUsuario)
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Carrito de Compras</Text>

      <View style={styles.seccionCliente}>
        <View style={styles.clienteHeaderRow}>
          <Text style={styles.label}>
            Cliente: {usuarioSeleccionado ? <Text style={{color: '#166534', fontWeight: 'bold'}}>ID [{usuarioSeleccionado}]</Text> : <Text style={{color: '#DC2626'}}>Ninguno</Text>}
          </Text>
          <TouchableOpacity style={styles.btnNuevoCliente} onPress={() => setModalVisible(true)}>
            <Ionicons name="person-add" size={14} color="#fff" />
            <Text style={styles.btnNuevoClienteText}> Nuevo</Text>
          </TouchableOpacity>
        </View>

        {loadingUsuarios ? (
          <ActivityIndicator color="#2563EB" />
        ) : (
          <View>
            <TextInput
              style={styles.searchUser}
              placeholder="Buscar por nombre o DNI..."
              placeholderTextColor="#64748B"
              value={busquedaUsuario}
              onChangeText={setBusquedaUsuario}
            />
            <FlatList
              data={usuariosFiltrados}
              keyExtractor={(item, index) => {
                const id = obtenerIdUsuario(item);
                return id > 0 ? id.toString() : index.toString();
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const currentId = Number(obtenerIdUsuario(item));
                const isSelected = Number(usuarioSeleccionado) === currentId;
                return (
                  <TouchableOpacity
                    style={[styles.userChip, isSelected && styles.userChipSelected]}
                    onPress={() => {
                      if (currentId > 0) {
                        setUsuarioSeleccionado(currentId);
                      }
                    }}
                  >
                    <Text style={[styles.userChipText, isSelected && styles.userChipTextSelected]}>
                      {item.nombre} {item.apellido || ''}
                    </Text>
                    <Text style={[styles.userChipSubText, isSelected && {color: '#FFFFFF'}]}>
                      DNI: {item.dni_cuit}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
              ListEmptyComponent={
                <Text style={styles.emptyUserText}>No se encontró el cliente.</Text>
              }
            />
          </View>
        )}
      </View>

      <Text style={styles.subTitle}>Productos en Carrito</Text>
      {carrito.map((item, index) => (
        <View key={item.productos_id ? item.productos_id.toString() : index.toString()} style={styles.carritoCard}>
          <View style={styles.carritoRowTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNombre}>{item.nombre}</Text>
              <Text style={styles.itemPrecio}>${item.precio_venta} c/u</Text>
            </View>

            <View style={styles.cantidadContenedor}>
              <TouchableOpacity style={styles.btnQty} onPress={() => modificarCantidad(item.productos_id, 'restar')}>
                <Text style={styles.btnQtyText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.cantidadText}>{item.cantidad}</Text>
              <TouchableOpacity style={styles.btnQty} onPress={() => modificarCantidad(item.productos_id, 'sumar')}>
                <Text style={styles.btnQtyText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={styles.inputObservacionItem}
            placeholder="Observación opcional para este producto..."
            placeholderTextColor="#64748B"
            value={item.observacionesItem}
            onChangeText={(text) => actualizarObservacionItem(item.productos_id, text)}
          />
        </View>
      ))}

      {carrito.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>El carrito está vacío.</Text>
        </View>
      )}

      {carrito.length > 0 && (
        <View style={styles.seccionPago}>
          <View style={styles.pagoHeaderRow}>
            <Text style={styles.subTitlePago}>Método(s) de Pago</Text>
            <TouchableOpacity style={styles.btnAddPago} onPress={agregarMetodoPago}>
              <Ionicons name="add" size={14} color="#fff" />
              <Text style={styles.btnAddPagoText}> Agregar Pago</Text>
            </TouchableOpacity>
          </View>

          {pagosSeleccionados.map((pago, index) => (
            <View key={index} style={styles.pagoRowCard}>
              <View style={styles.pagoOptionsContainer}>
                <TouchableOpacity 
                  style={[styles.tipoPagoBtn, pago.forma_pago_id === 1 && styles.tipoPagoBtnSelected]}
                  onPress={() => actualizarTipoPago(index, 1, 'Efectivo')}
                >
                  <Text style={[styles.tipoPagoText, pago.forma_pago_id === 1 && {color: '#fff'}]}>Efectivo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.tipoPagoBtn, pago.forma_pago_id === 2 && styles.tipoPagoBtnSelected]}
                  onPress={() => actualizarTipoPago(index, 2, 'Tarjeta')}
                >
                  <Text style={[styles.tipoPagoText, pago.forma_pago_id === 2 && {color: '#fff'}]}>Tarjeta</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.tipoPagoBtn, pago.forma_pago_id === 3 && styles.tipoPagoBtnSelected]}
                  onPress={() => actualizarTipoPago(index, 3, 'Transferencia')}
                >
                  <Text style={[styles.tipoPagoText, pago.forma_pago_id === 3 && {color: '#fff'}]}>Transferencia</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.pagoInputRow}>
                <TextInput
                  style={styles.inputMonto}
                  placeholder="Monto"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={pago.monto}
                  onChangeText={(val) => actualizarMontoPago(index, val)}
                />
                {pagosSeleccionados.length > 1 && (
                  <TouchableOpacity onPress={() => eliminarMetodoPago(index)} style={styles.btnEliminarPago}>
                    <Ionicons name="trash" size={18} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {carrito.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a Pagar:</Text>
            <Text style={styles.totalAmount}>${calcularTotal().toFixed(2)}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.btnFinalizar, procesandoVenta && { opacity: 0.6 }]} 
            onPress={registrarVenta}
            disabled={procesandoVenta}
          >
            {procesandoVenta ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnFinalizarText}>Confirmar Venta y Cobrar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Nuevo Cliente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput style={styles.inputModal} placeholder="Nombre *" placeholderTextColor="#64748B" value={nuevoNombre} onChangeText={setNuevoNombre} />
              <TextInput style={styles.inputModal} placeholder="Apellido" placeholderTextColor="#64748B" value={nuevoApellido} onChangeText={setNuevoApellido} />
              <TextInput style={styles.inputModal} placeholder="DNI / CUIT *" placeholderTextColor="#64748B" keyboardType="numeric" value={nuevoDni} onChangeText={setNuevoDni} />
              <TextInput style={styles.inputModal} placeholder="Teléfono *" placeholderTextColor="#64748B" keyboardType="phone-pad" value={nuevoTelefono} onChangeText={setNuevoTelefono} />
              <TextInput style={styles.inputModal} placeholder="Correo Electrónico *" placeholderTextColor="#64748B" keyboardType="email-address" autoCapitalize="none" value={nuevoEmail} onChangeText={setNuevoEmail} />
              <TextInput style={styles.inputModal} placeholder="Dirección" placeholderTextColor="#64748B" value={nuevoDireccion} onChangeText={setNuevoDireccion} />
              <TextInput style={styles.inputModal} placeholder="Localidad" placeholderTextColor="#64748B" value={nuevoLocalidad} onChangeText={setNuevoLocalidad} />

              <TouchableOpacity 
                style={[styles.btnGuardarCliente, procesandoVenta && { opacity: 0.6 }]} 
                onPress={registrarVentaConUsuarioNuevo}
                disabled={procesandoVenta}
              >
                {procesandoVenta ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnGuardarClienteText}>Crear Usuario y Cobrar</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 16, marginTop: 10 },
  subTitle: { color: '#0F172A', fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
  seccionCliente: { marginBottom: 16, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  clienteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  btnNuevoCliente: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnNuevoClienteText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  searchUser: { backgroundColor: '#F8FAFC', color: '#0F172A', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, fontSize: 13, marginBottom: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  
  userChip: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, justifyContent: 'center', borderWidth: 1, borderColor: '#CBD5E1', minWidth: 130 },
  userChipSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  userChipText: { color: '#334155', fontSize: 13, fontWeight: 'bold' },
  userChipTextSelected: { color: '#fff', fontWeight: 'bold' },
  userChipSubText: { color: '#64748B', fontSize: 11 },

  emptyUserText: { color: '#64748B', fontSize: 12, fontStyle: 'italic', paddingVertical: 4 },
  carritoCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  carritoRowTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemNombre: { color: '#0F172A', fontSize: 15, fontWeight: 'bold' },
  itemPrecio: { color: '#166534', fontSize: 13, marginTop: 2, fontWeight: '600' },
  cantidadContenedor: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnQty: { backgroundColor: '#E2E8F0', width: 30, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
  btnQtyText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  cantidadText: { color: '#0F172A', fontSize: 15, fontWeight: 'bold' },
  inputObservacionItem: { backgroundColor: '#F8FAFC', color: '#0F172A', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, fontSize: 12, borderWidth: 1, borderColor: '#CBD5E1', marginTop: 4 },
  
  emptyContainer: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  emptyText: { color: '#64748B', fontSize: 14 },

  seccionPago: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 10, marginBottom: 16, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  pagoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subTitlePago: { color: '#0F172A', fontSize: 15, fontWeight: 'bold' },
  btnAddPago: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnAddPagoText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  pagoRowCard: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  pagoOptionsContainer: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  tipoPagoBtn: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 6, alignItems: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1' },
  tipoPagoBtnSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  tipoPagoText: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
  pagoInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputMonto: { flex: 1, backgroundColor: '#FFFFFF', color: '#0F172A', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, fontSize: 13, borderWidth: 1, borderColor: '#CBD5E1' },
  btnEliminarPago: { padding: 4 },

  footer: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 16, marginTop: 10, marginBottom: 30 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  totalAmount: { color: '#0F172A', fontSize: 22, fontWeight: 'bold' },
  btnFinalizar: { backgroundColor: '#2563EB', padding: 14, borderRadius: 10, alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  btnFinalizarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.55)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', maxHeight: '85%', shadowColor: '#0F172A', shadowOpacity: 0.15, shadowRadius: 16, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: '#0F172A', fontSize: 17, fontWeight: 'bold' },
  inputModal: { backgroundColor: '#F8FAFC', color: '#0F172A', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, fontSize: 14, marginBottom: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  btnGuardarCliente: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5, marginBottom: 10 },
  btnGuardarClienteText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});