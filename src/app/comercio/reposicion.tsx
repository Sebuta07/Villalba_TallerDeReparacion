import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/comercio/reposicion.php`;
const API_PRODUCTOS = `${process.env.EXPO_PUBLIC_API_URL}/comercio/productos.php`;

export default function ReposicionScreen() {
  const params = useLocalSearchParams();
  const usuarioId = params.comercioId ? Number(params.comercioId) : 1;

  const [pedidos, setPedidos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [cantidad, setCantidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => { if (data.success) setPedidos(data.pedidos); });

    fetch(API_PRODUCTOS)
      .then(res => res.json())
      .then(data => { if (data.success) setProductos(data.productos); });
  };

  const enviarPedido = async () => {
    if (!productoSeleccionado || !cantidad.trim()) {
      Alert.alert('Atención', 'Seleccioná un producto e ingresá la cantidad.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos_id: productoSeleccionado.productos_id,
          cantidad: parseInt(cantidad),
          observaciones: observaciones.trim() || 'Reposición solicitada',
          usuario_id: usuarioId
        })
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('Éxito', 'Pedido de reposición generado correctamente.');
        setCantidad('');
        setObservaciones('');
        setProductoSeleccionado(null);
        cargarDatos();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch {
      Alert.alert('Error', 'Falla de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pedidos de Reposición de Stock</Text>

      <View style={styles.formCard}>
        <Text style={styles.subtitle}>Nuevo Pedido</Text>

        <Text style={styles.label}>1. Seleccionar Producto:</Text>
        <ScrollView horizontal style={{ marginBottom: 12 }} showsHorizontalScrollIndicator={false}>
          {productos.map(p => (
            <TouchableOpacity
              key={p.productos_id}
              style={[styles.chip, productoSeleccionado?.productos_id === p.productos_id && styles.chipActive]}
              onPress={() => setProductoSeleccionado(p)}
            >
              <Text style={[styles.chipText, productoSeleccionado?.productos_id === p.productos_id && styles.chipTextActive]}>{p.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>2. Cantidad a pedir:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 10"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
        />

        <Text style={styles.label}>3. Descripción / Observaciones:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Reposición urgente por rotura o alta demanda"
          placeholderTextColor="#64748B"
          value={observaciones}
          onChangeText={setObservaciones}
        />

        <TouchableOpacity style={styles.btn} onPress={enviarPedido} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Enviando...' : 'Registrar Pedido de Reposición'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitleHistorial}>Historial de Pedidos Realizados</Text>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.envios_sucursal_id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Pedido #{item.envios_sucursal_id} - Fecha: {item.fecha_pedido}</Text>
            <Text style={styles.text}>Producto: <Text style={styles.highlight}>{item.producto_nombre}</Text></Text>
            <Text style={styles.text}>Cantidad solicitada: <Text style={styles.highlight}>{item.cantidad}</Text></Text>
            <Text style={styles.text}>Descripción: {item.observaciones}</Text>
            <Text style={styles.textUser}>Solicitado por: {item.usuario_nombre} {item.usuario_apellido}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#2563EB', marginBottom: 10 },
  subtitleHistorial: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginTop: 20, marginBottom: 10 },
  formCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  label: { color: '#64748B', fontSize: 13, marginBottom: 6, fontWeight: '600' },
  chip: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { color: '#334155', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  input: { backgroundColor: '#FFFFFF', color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 14 },
  btn: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 5, shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  cardHeader: { color: '#2563EB', fontWeight: 'bold', fontSize: 14, marginBottom: 6 },
  text: { color: '#475569', fontSize: 13, marginBottom: 3 },
  highlight: { color: '#0F172A', fontWeight: 'bold' },
  textUser: { color: '#64748B', fontSize: 12, marginTop: 6, fontStyle: 'italic', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 6 }
});