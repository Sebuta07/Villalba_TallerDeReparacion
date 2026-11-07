import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/recepcionista/avance.php`; 

interface ReparacionOrden {
  reparacion_orden_id: number;
  equipo_id: number;
  diagnostico_cliente: string;
  fecha_registro: string;
  total: number | string;
  nombre_usuario: string;
  nombre_empleado: string;
  nombre_servicio: string;
  estado_orden: string;
  forma_pago: string;
}

export default function AvanceScreen() {
  const params = useLocalSearchParams();
  const empleadoId = params.empleadoId ? Number(params.empleadoId) : 1;

  const [ordenes, setOrdenes] = useState<ReparacionOrden[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>('');

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async (queryString = '') => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}${queryString}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setOrdenes(data);
      } else {
        setOrdenes([]);
      }
    } catch (err) {
      console.error('Error al cargar avance de reparaciones:', err);
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  const ordenesFiltradas = ordenes.filter(item => 
    (item.nombre_usuario && item.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase())) ||
    (item.diagnostico_cliente && item.diagnostico_cliente.toLowerCase().includes(busqueda.toLowerCase())) ||
    (item.nombre_servicio && item.nombre_servicio.toLowerCase().includes(busqueda.toLowerCase())) ||
    (item.estado_orden && item.estado_orden.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const renderItemOrden = ({ item }: { item: ReparacionOrden }) => {
    const totalNumerico = Number(item.total) || 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nombreServicio}>Orden de Reparación</Text>
            <Text style={styles.categoriaText}>
              Cliente: <Text style={{ color: '#0F172A', fontWeight: '600' }}>{item.nombre_usuario || 'Desconocido'}</Text>
            </Text>
          </View>
          <View style={styles.precioBadge}>
            <Text style={styles.precioText}>${totalNumerico.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoContainer}>
          <Text style={styles.labelBold}>Servicio: <Text style={styles.infoText}>{item.nombre_servicio || 'No especificado'}</Text></Text>
          <Text style={styles.labelBold}>Diagnóstico: <Text style={styles.infoText}>{item.diagnostico_cliente || 'Sin diagnóstico'}</Text></Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfoItem}>
            <Ionicons name="person-outline" size={13} color="#64748B" />
            <Text style={styles.footerInfoText}> Atendió: {item.nombre_empleado || 'N/D'}</Text>
          </View>
          
          <View style={styles.badgeEstado}>
            <Text style={styles.badgeEstadoText}>
              {item.estado_orden || 'Pendiente'}
            </Text>
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopWidth: 0, paddingTop: 4 }]}>
          <View style={styles.footerInfoItem}>
            <Ionicons name="calendar-outline" size={13} color="#64748B" />
            <Text style={styles.footerInfoText}> {item.fecha_registro}</Text>
          </View>
          <View style={styles.footerInfoItem}>
            <Ionicons name="card-outline" size={13} color="#64748B" />
            <Text style={styles.footerInfoText}> {item.forma_pago || 'Efectivo'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avance de Reparaciones</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente, diagnóstico, servicio..."
          placeholderTextColor="#64748B"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Cargando registros...</Text>
        </View>
      ) : (
        <FlatList
          data={ordenesFiltradas}
          keyExtractor={(item) => item.reparacion_orden_id ? item.reparacion_orden_id.toString() : Math.random().toString()}
          renderItem={renderItemOrden}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No se encontraron órdenes de reparación.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 16, marginTop: 10 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#0F172A', paddingVertical: 10, fontSize: 14 },

  listContainer: { gap: 12, paddingBottom: 20 },

  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  nombreServicio: { color: '#0F172A', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  categoriaText: { color: '#64748B', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 },

  precioBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#BBF7D0' },
  precioText: { color: '#166534', fontSize: 15, fontWeight: 'bold' },

  infoContainer: { marginBottom: 12, gap: 4 },
  labelBold: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  infoText: { color: '#334155', fontWeight: 'normal', fontSize: 13 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 8, alignItems: 'center' },
  footerInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerInfoText: { color: '#64748B', fontSize: 12 },

  badgeEstado: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' },
  badgeEstadoText: { color: '#1D4ED8', fontSize: 11, fontWeight: 'bold' },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#64748B', marginTop: 10, fontSize: 13 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { color: '#64748B', fontSize: 14, marginTop: 10 },
});