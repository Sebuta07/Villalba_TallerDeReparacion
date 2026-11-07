import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ListadoReparacionesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const empleadoId = params.empleadoId ? Number(params.empleadoId) : 9;

  const [reparaciones, setReparaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardExpandida, setCardExpandida] = useState<number | null>(null);

  const obtenerReparaciones = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tecnico/listado_reparaciones.php?empleado_id=${empleadoId}`
      );
      const json = await response.json();

      if (json.success) {
        setReparaciones(json.data);
      } else {
        setError(json.message || 'No se pudieron cargar las reparaciones.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor local.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerReparaciones();
  }, [empleadoId]);

  const handleCambiarEstado = async (reparacionOrdenId: number, nuevoEstadoId: number) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tecnico/listado_reparaciones.php`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reparacion_orden_id: reparacionOrdenId,
            estados_or_id: nuevoEstadoId,
          }),
        }
      );
      const json = await response.json();
      if (json.success) {
        setCardExpandida(null);
        obtenerReparaciones();
      } else {
        Alert.alert('Error', json.message || 'No se pudo actualizar el estado.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Fallo de conexión al actualizar estado.');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isExpanded = cardExpandida === item.id;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.9}
          onPress={() => setCardExpandida(isExpanded ? null : item.id)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.equipoTitle}>
              {item.categoria_nombre || 'Equipo'} — {item.marca_nombre || 'Genérica'} {item.modelo_nombre || ''}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.estado_orden || 'Sin estado'}</Text>
            </View>
          </View>
          
          <Text style={styles.subEquipo}>
            {item.numero_serie ? `Serie: ${item.numero_serie}` : ''} {item.imei ? `| IMEI: ${item.imei}` : ''}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.infoText}><Text style={styles.boldText}>Cliente:</Text> {item.cliente_nombre || 'No asignado'}</Text>
          <Text style={styles.infoText}><Text style={styles.boldText}>Servicio:</Text> {item.servicio_nombre || 'No especificado'}</Text>
          
          <Text style={styles.diagnostico} numberOfLines={2}>
            <Text style={styles.boldText}>Diagnóstico:</Text> {item.diagnostico_cliente || 'Sin observaciones'}
          </Text>

          <View style={styles.footerCard}>
            <Text style={styles.total}>Total: ${item.total || 0}</Text>
            <Text style={styles.pago}>Pago: {item.forma_pago || 'No especificada'}</Text>
          </View>

          <Text style={styles.fecha}>Ingreso: {item.fecha_registro}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Actualizar estado de la orden:</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#D97706' }]}
                onPress={() => handleCambiarEstado(item.id, 1)}
              >
                <Text style={styles.estadoBtnText}>Pendiente</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => handleCambiarEstado(item.id, 2)}
              >
                <Text style={styles.estadoBtnText}>En Proceso</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#16A34A' }]}
                onPress={() => handleCambiarEstado(item.id, 3)}
              >
                <Text style={styles.estadoBtnText}>Finalizado</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => handleCambiarEstado(item.id, 4)}
              >
                <Text style={styles.estadoBtnText}>Cancelado</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Reparaciones Activas</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : reparaciones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tenés reparaciones asignadas actualmente.</Text>
        </View>
      ) : (
        <FlatList
          data={reparaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { paddingBottom: 20 },
  cardContainer: { marginBottom: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  equipoTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', flex: 1, marginRight: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#1D4ED8' },
  subEquipo: { fontSize: 12, color: '#64748B', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 },
  infoText: { fontSize: 13, color: '#334155', marginBottom: 4 },
  boldText: { fontWeight: '600', color: '#0F172A' },
  diagnostico: { fontSize: 13, color: '#475569', marginBottom: 10 },
  footerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  total: { fontSize: 14, fontWeight: 'bold', color: '#166534' },
  pago: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  fecha: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 12,
    marginTop: -4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 0,
    elevation: 1,
  },
  optionsTitle: { fontSize: 12, color: '#64748B', marginBottom: 8, textAlign: 'center', fontWeight: '600' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  estadoBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  estadoBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { color: '#64748B', textAlign: 'center', fontSize: 14 },
  errorText: { color: '#DC2626', textAlign: 'center', fontSize: 14 },
});