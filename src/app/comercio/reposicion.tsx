import { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/comercio/reposicion.php`;

export default function ReposicionScreen() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [filtrados, setFiltrados] = useState<any[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', 'pendiente', 'verificado'

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => { 
        if (data.success) {
          setPedidos(data.pedidos);
          aplicarFiltro(filtroEstado, data.pedidos);
        } else {
          Alert.alert('Error', data.message || 'No se pudieron cargar los pedidos.');
        }
      })
      .catch(() => Alert.alert('Error', 'Falla de conexión con el servidor.'));
  };

  const aplicarFiltro = (estado: string, listaPedidos = pedidos) => {
    setFiltroEstado(estado);
    if (estado === 'todos') {
      setFiltrados(listaPedidos);
    } else {
      setFiltrados(listaPedidos.filter(item => {
        const est = item.estado ? item.estado.toLowerCase() : 'pendiente';
        return est === estado;
      }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historial de Reposiciones</Text>

      {/* Botones de Filtrado */}
      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={[styles.filterBtn, filtroEstado === 'todos' && styles.filterBtnActive]} 
          onPress={() => aplicarFiltro('todos')}
        >
          <Text style={[styles.filterText, filtroEstado === 'todos' && styles.filterTextActive]}>Todos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, filtroEstado === 'pendiente' && styles.filterBtnActive]} 
          onPress={() => aplicarFiltro('pendiente')}
        >
          <Text style={[styles.filterText, filtroEstado === 'pendiente' && styles.filterTextActive]}>Pendientes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, filtroEstado === 'verificado' && styles.filterBtnActive]} 
          onPress={() => aplicarFiltro('verificado')}
        >
          <Text style={[styles.filterText, filtroEstado === 'verificado' && styles.filterTextActive]}>Verificadas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.detalle_pedido_sucursales_id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const esPendiente = (!item.estado || item.estado === 'pendiente');
          return (
            <View style={styles.card}>
              <View style={styles.rowHeader}>
                <Text style={styles.cardHeader}>Pedido #{item.detalle_pedido_sucursales_id}</Text>
                <View style={[styles.badge, esPendiente ? styles.badgePendiente : styles.badgeVerificado]}>
                  <Text style={styles.badgeText}>{esPendiente ? 'PENDIENTE' : 'VERIFICADO'}</Text>
                </View>
              </View>

              <Text style={styles.text}>Fecha: {item.fecha_hora_pedido}</Text>
              <Text style={styles.text}>Producto: <Text style={styles.highlight}>{item.producto_nombre}</Text></Text>
              <Text style={styles.text}>Cantidad solicitada: <Text style={styles.highlight}>{item.cantidad}</Text></Text>
              <Text style={styles.text}>Descripción: {item.observaciones}</Text>
            </View>
          );
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 15 },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15, gap: 8 },
  filterBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1' },
  filterBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  filterText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardHeader: { color: '#2563EB', fontWeight: 'bold', fontSize: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgePendiente: { backgroundColor: '#FEF3C7' },
  badgeVerificado: { backgroundColor: '#DCFCE7' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#92400E' },
  text: { color: '#475569', fontSize: 13, marginBottom: 3 },
  highlight: { color: '#0F172A', fontWeight: 'bold' }
});