import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ListadoReparacionesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const empleadoId = params.empleadoId ? Number(params.empleadoId) : 9;

  const [reparaciones, setReparaciones] = useState<any[]>([]);
  const [reparacionesFiltradas, setReparacionesFiltradas] = useState<any[]>([]);
  const [filtroActivo, setFiltroActivo] = useState<string>('todos'); // 'todos', '1', '2', '3', '4'
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardExpandida, setCardExpandida] = useState<number | null>(null);

  // Estado para la imagen ampliada en pantalla completa
  const [imagenModalUrl, setImagenModalUrl] = useState<string | null>(null);

  const obtenerReparaciones = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tecnico/listado_reparaciones.php?empleado_id=${empleadoId}`
      );
      const json = await response.json();

      if (json.success) {
        const lista = json.data || json.ordenes || [];
        setReparaciones(lista);
        aplicarFiltro(filtroActivo, lista);
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

  const aplicarFiltro = (estadoId: string, listaBase = reparaciones) => {
    setFiltroActivo(estadoId);
    const baseSegura = listaBase || [];
    if (estadoId === 'todos') {
      setReparacionesFiltradas(baseSegura);
    } else {
      const filtradas = baseSegura.filter((item) => String(item.estados_or_id) === estadoId);
      setReparacionesFiltradas(filtradas);
    }
  };

  const confirmarCambioEstado = (reparacionOrdenId: number, nuevoEstadoId: number, nombreEstado: string) => {
    let mensajeExtra = `¿Estás seguro de cambiar el estado de la orden #${reparacionOrdenId} a "${nombreEstado}"?`;
    
    if (nuevoEstadoId === 4) {
      mensajeExtra = `⚠️ ATENCIÓN (Cancelación):\n¿Estás seguro de cancelar la orden #${reparacionOrdenId}? Esto liberará cualquier componente reservado y cerrará el proceso en taller.`;
    }

    Alert.alert(
      'Confirmar Cambio de Estado',
      mensajeExtra,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, cambiar', 
          style: nuevoEstadoId === 4 ? 'destructive' : 'default',
          onPress: () => handleCambiarEstado(reparacionOrdenId, nuevoEstadoId) 
        }
      ]
    );
  };

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
    const itemId = item.id || item.reparacion_orden_id;
    const isExpanded = cardExpandida === itemId;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.9}
          onPress={() => setCardExpandida(isExpanded ? null : itemId)}
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
            Orden #{itemId} {item.numero_serie ? `| Serie: ${item.numero_serie}` : ''}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.infoText}><Text style={styles.boldText}>Cliente:</Text> {item.cliente_nombre || 'No asignado'}</Text>
          <Text style={styles.infoText}><Text style={styles.boldText}>Servicio:</Text> {item.servicio_nombre || 'No especificado'}</Text>
          
          <Text style={styles.diagnostico} numberOfLines={2}>
            <Text style={styles.boldText}>Diagnóstico:</Text> {item.diagnostico_cliente || 'Sin observaciones'}
          </Text>

          <View style={styles.footerCard}>
            <Text style={styles.total}>Total: ${item.total || item.presupuesto || 0}</Text>
            <Text style={styles.pago}>Pago: {item.forma_pago || 'No especificada'}</Text>
          </View>

          <Text style={styles.fecha}>Ingreso: {item.fecha_registro}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.optionsContainer}>
            
            {/* GALERÍA DE IMÁGENES AL EXPANDIR */}
            {item.imagenes && item.imagenes.length > 0 && (
              <View style={styles.imagenesContainer}>
                <Text style={styles.boldText}>Imágenes del dispositivo:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  {item.imagenes.map((imgUrl: string, idx: number) => (
                    <TouchableOpacity key={idx} onPress={() => setImagenModalUrl(imgUrl)}>
                      <Image source={{ uri: imgUrl }} style={styles.previewImage} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.optionsTitle}>Actualizar estado de la orden:</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#D97706' }]}
                onPress={() => confirmarCambioEstado(itemId, 1, 'Pendiente')}
              >
                <Text style={styles.estadoBtnText}>Pendiente</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => confirmarCambioEstado(itemId, 2, 'En Proceso')}
              >
                <Text style={styles.estadoBtnText}>En Proceso</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#16A34A' }]}
                onPress={() => confirmarCambioEstado(itemId, 3, 'Finalizado')}
              >
                <Text style={styles.estadoBtnText}>Finalizado</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => confirmarCambioEstado(itemId, 4, 'Cancelado')}
              >
                <Text style={styles.estadoBtnText}>Cancelar</Text>
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

      {/* BARRA DE FILTROS SUPERIOR */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroScroll} contentContainerStyle={styles.filtroContainer}>
        <TouchableOpacity 
          style={[styles.filtroChip, filtroActivo === 'todos' && styles.filtroChipActive]}
          onPress={() => aplicarFiltro('todos')}
        >
          <Text style={[styles.filtroText, filtroActivo === 'todos' && styles.filtroTextActive]}>Todas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filtroChip, filtroActivo === '1' && styles.filtroChipActive]}
          onPress={() => aplicarFiltro('1')}
        >
          <Text style={[styles.filtroText, filtroActivo === '1' && styles.filtroTextActive]}>Pendientes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filtroChip, filtroActivo === '2' && styles.filtroChipActive]}
          onPress={() => aplicarFiltro('2')}
        >
          <Text style={[styles.filtroText, filtroActivo === '2' && styles.filtroTextActive]}>En Proceso</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filtroChip, filtroActivo === '3' && styles.filtroChipActive]}
          onPress={() => aplicarFiltro('3')}
        >
          <Text style={[styles.filtroText, filtroActivo === '3' && styles.filtroTextActive]}>Finalizadas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filtroChip, filtroActivo === '4' && styles.filtroChipActive]}
          onPress={() => aplicarFiltro('4')}
        >
          <Text style={[styles.filtroText, filtroActivo === '4' && styles.filtroTextActive]}>Canceladas</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : reparacionesFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay reparaciones en este filtro.</Text>
        </View>
      ) : (
        <FlatList
          data={reparacionesFiltradas}
          keyExtractor={(item, index) => String(item.id || item.reparacion_orden_id || index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal para ver la imagen en pantalla completa (Zoom) */}
      <Modal visible={!!imagenModalUrl} transparent={true} onRequestClose={() => setImagenModalUrl(null)}>
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setImagenModalUrl(null)}>
            <Text style={styles.modalCloseText}>✕ Cerrar</Text>
          </TouchableOpacity>
          {imagenModalUrl && (
            <Image source={{ uri: imagenModalUrl }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  
  filtroScroll: { maxHeight: 45, marginBottom: 14 },
  filtroContainer: { alignItems: 'center', gap: 8 },
  filtroChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    height: 36,
    justifyContent: 'center',
  },
  filtroChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filtroText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  filtroTextActive: { color: '#FFFFFF' },

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
  
  imagenesContainer: { marginBottom: 12 },
  previewImage: { width: 65, height: 65, borderRadius: 8, marginRight: 8, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' },

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

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 40 },
  emptyText: { color: '#64748B', textAlign: 'center', fontSize: 14 },
  errorText: { color: '#DC2626', textAlign: 'center', fontSize: 14 },

  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: width * 0.95, height: width * 0.95 },
  modalCloseButton: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  modalCloseText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});