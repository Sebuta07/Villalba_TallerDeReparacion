import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/comercio/productos.php`;
const API_REPOSICION = `${process.env.EXPO_PUBLIC_API_URL}/comercio/reposicion.php`;

export default function ProductosScreen() {
  const params = useLocalSearchParams();
  const comercioId = params.comercioId ? Number(params.comercioId) : 1;

  const [productos, setProductos] = useState<any[]>([]);
  const [filtrados, setFiltrados] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  
  const [prodSeleccionado, setProdSeleccionado] = useState<any>(null);
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stock, setStock] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [productoAPedir, setProductoAPedir] = useState<any>(null);
  const [cantidadPedido, setCantidadPedido] = useState('');
  const [observacionesPedido, setObservacionesPedido] = useState('');

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => { 
        if (data.success) {
          setProductos(data.productos);
          setFiltrados(data.productos);
        }
      })
      .catch(() => Alert.alert('Error', 'No se pudo conectar con el servidor.'));
  };

  const handleBuscar = (texto: string) => {
    setBusqueda(texto);
    if (!texto.trim()) {
      setFiltrados(productos);
      return;
    }
    const query = texto.toLowerCase();
    setFiltrados(productos.filter(p => p.nombre.toLowerCase().includes(query)));
  };

  const guardarCambios = async () => {
    if (!prodSeleccionado) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productos_id: prodSeleccionado.productos_id, 
          precio_venta: parseFloat(precio), 
          descripcion,
          stock_disponible: parseInt(stock) || 0
        })
      });
      const json = await res.json();
      if (json.success) { 
        Alert.alert('Éxito', 'Inventario modificado correctamente'); 
        cargarProductos(); 
        setProdSeleccionado(null); 
      } else {
        Alert.alert('Error', json.message);
      }
    } catch { 
      Alert.alert('Error', 'Falla de conexión'); 
    }
  };

  const abrirPedirStock = (producto: any) => {
    setProductoAPedir(producto);
    setCantidadPedido('10');
    setObservacionesPedido(`Reposición para ${producto.nombre}`);
    setModalVisible(true);
  };

  const confirmarPedidoStock = async () => {
    if (!productoAPedir || !cantidadPedido.trim()) {
      Alert.alert('Atención', 'Ingresá una cantidad válida.');
      return;
    }

    try {
      const res = await fetch(API_REPOSICION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos_id: productoAPedir.productos_id,
          cantidad: parseInt(cantidadPedido),
          observaciones: observacionesPedido.trim(),
          usuario_id: comercioId
        })
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('Éxito', 'Pedido de reposición registrado con éxito.');
        setModalVisible(false);
        setProductoAPedir(null);
      } else {
        Alert.alert('Error', json.message);
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Control de Inventario y Productos</Text>

      <TextInput
        style={styles.inputBusqueda}
        placeholder="Buscar producto por nombre..."
        placeholderTextColor="#64748B"
        value={busqueda}
        onChangeText={handleBuscar}
      />

      {prodSeleccionado && (
        <View style={styles.editBox}>
          <Text style={styles.editTitle}>Editando: {prodSeleccionado.nombre}</Text>
          
          <Text style={styles.subLabel}>Precio de Venta ($)</Text>
          <TextInput style={styles.input} placeholderTextColor="#64748B" keyboardType="numeric" value={precio} onChangeText={setPrecio} />
          
          <Text style={styles.subLabel}>Stock Disponible</Text>
          <TextInput style={styles.input} placeholderTextColor="#64748B" keyboardType="numeric" value={stock} onChangeText={setStock} />

          <Text style={styles.subLabel}>Descripción</Text>
          <TextInput style={styles.input} placeholderTextColor="#64748B" value={descripcion} onChangeText={setDescripcion} />
          
          <TouchableOpacity style={styles.btnGuardar} onPress={guardarCambios}>
            <Text style={styles.btnText}>Guardar Modificaciones</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.btnCancelar} onPress={() => setProdSeleccionado(null)}>
            <Text style={styles.btnTextCancel}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.productos_id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.text}>Categoría: {item.categoria || 'General'}</Text>
              <Text style={styles.price}>Precio: ${item.precio_venta}</Text>
              <Text style={[styles.stock, item.stock_disponible <= item.stock_minimo && styles.stockAlerta]}>
                Stock Actual: {item.stock_disponible} unidades {item.stock_disponible <= item.stock_minimo ? '(Stock Bajo)' : ''}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity 
                style={styles.btnModificar} 
                onPress={() => { 
                  setProdSeleccionado(item); 
                  setPrecio(item.precio_venta?.toString() || ''); 
                  setStock(item.stock_disponible?.toString() || '0');
                  setDescripcion(item.descripcion || ''); 
                }}
              >
                <Text style={styles.btnActionText}>Modificar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnPedirStock} 
                onPress={() => abrirPedirStock(item)}
              >
                <Text style={styles.btnActionText}>Pedir Stock</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Solicitar Reposición</Text>
            <Text style={styles.modalSub}>{productoAPedir?.nombre}</Text>

            <Text style={styles.subLabel}>Cantidad a solicitar:</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={cantidadPedido} 
              onChangeText={setCantidadPedido} 
              placeholderTextColor="#64748B"
            />

            <Text style={styles.subLabel}>Observaciones / Notas:</Text>
            <TextInput 
              style={styles.input} 
              value={observacionesPedido} 
              onChangeText={setObservacionesPedido} 
              placeholderTextColor="#64748B"
            />

            <TouchableOpacity style={styles.btnGuardar} onPress={confirmarPedidoStock}>
              <Text style={styles.btnText}>Confirmar Pedido</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnTextCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, textAlign: 'center' },
  inputBusqueda: { backgroundColor: '#FFFFFF', color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 15, fontSize: 14, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardTitle: { color: '#0F172A', fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  text: { color: '#475569', fontSize: 12, marginVertical: 1 },
  price: { color: '#166534', fontWeight: 'bold', fontSize: 13, marginVertical: 2 },
  stock: { color: '#64748B', fontSize: 12, marginBottom: 8 },
  stockAlerta: { color: '#D97706', fontWeight: 'bold' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8, marginTop: 4 },
  btnModificar: { backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  btnPedirStock: { backgroundColor: '#D97706', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  btnActionText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  editBox: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#2563EB', shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  editTitle: { color: '#0F172A', fontWeight: 'bold', marginBottom: 10, fontSize: 15 },
  subLabel: { color: '#64748B', fontSize: 11, marginBottom: 4, fontWeight: '600' },
  input: { backgroundColor: '#FFFFFF', color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14 },
  btnGuardar: { backgroundColor: '#166534', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnCancelar: { backgroundColor: '#E2E8F0', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  btnTextCancel: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.55)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.15, shadowRadius: 16, elevation: 5 },
  modalTitle: { color: '#0F172A', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  modalSub: { color: '#2563EB', fontSize: 14, textAlign: 'center', marginBottom: 15, fontWeight: '600' }
});