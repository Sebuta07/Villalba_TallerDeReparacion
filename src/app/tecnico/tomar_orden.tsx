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

export default function TomarOrdenScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const empleadoId = params.empleadoId ? Number(params.empleadoId) : 9;

  const [loading, setLoading] = useState(true);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [ordenExpandidaId, setOrdenExpandidaId] = useState<number | null>(null);
  
  // Estado para la imagen ampliada en pantalla completa
  const [imagenModalUrl, setImagenModalUrl] = useState<string | null>(null);

  const fetchOrdenesDisponibles = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tecnico/tomar_orden.php?empleado_id=${empleadoId}`);
      const json = await response.json();
      if (json.success) {
        setOrdenes(json.data);
      } else {
        Alert.alert('Error', json.message || 'No se pudieron cargar las órdenes.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Fallo de conexión al cargar las órdenes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenesDisponibles();
  }, []);

  const confirmarTomarOrden = (reparacionOrdenId: number) => {
    Alert.alert(
      'Tomar Orden',
      '¿Quieres tomar la orden?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí', onPress: () => handleTomarOrden(reparacionOrdenId) }
      ]
    );
  };

  const handleTomarOrden = async (reparacionOrdenId: number) => {
    setProcesandoId(reparacionOrdenId);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tecnico/tomar_orden.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reparacion_orden_id: reparacionOrdenId,
          tecnico_id: empleadoId,
        }),
      });

      const json = await response.json();
      if (json.success) {
        Alert.alert('Éxito', '¡Has tomado el dispositivo para repararlo!', [
          { text: 'OK', onPress: () => fetchOrdenesDisponibles() }
        ]);
      } else {
        Alert.alert('Error', json.message || 'No se pudo tomar la orden.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Error de conexión con el servidor.');
    } finally {
      setProcesandoId(null);
    }
  };

  const toggleExpandir = (id: number) => {
    setOrdenExpandidaId(ordenExpandidaId === id ? null : id);
  };

  const renderItem = ({ item }: { item: any }) => {
    const estaExpandida = ordenExpandidaId === item.id;

    return (
      <View style={styles.card}>
        {/* Cabecera interactiva: solo esto abre o cierra la tarjeta */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => toggleExpandir(item.id)}>
          <View style={styles.cardHeader}>
            <Text style={styles.equipo}>
              {item.categoria_nombre || 'Celular'} — {item.marca_nombre || 'Samsung'} {item.modelo_nombre || 'Galaxy A 11'}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.estado_orden || 'pendiente'}</Text>
            </View>
          </View>
          
          <Text style={styles.subEquipo}>
            {item.numero_serie ? `Serie: ${item.numero_serie}` : 'Sin serie'} {item.imei ? `| IMEI: ${item.imei}` : ''}
          </Text>
        </TouchableOpacity>

        {estaExpandida && (
          <View style={styles.detailsContainer}>
            <View style={styles.divider} />

            <Text style={styles.infoText}><Text style={styles.boldText}>Cliente:</Text> {item.cliente_nombre || 'No asignado'}</Text>
            <Text style={styles.infoText}><Text style={styles.boldText}>Servicio:</Text> {item.servicio_nombre || 'No especificado'}</Text>

            <Text style={styles.diagnostico}>
              <Text style={styles.boldText}>Diagnóstico:</Text> {item.diagnostico_cliente || 'Sin observaciones'}
            </Text>

            <View style={styles.footerCard}>
              <Text style={styles.total}>Total: ${item.total || 0}</Text>
              <Text style={styles.pago}>Método de Pago: {item.forma_pago || 'No especificada'}</Text>
            </View>

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

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => confirmarTomarOrden(item.id)}
              disabled={procesandoId === item.id}
            >
              {procesandoId === item.id ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Tomar Orden</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Órdenes Disponibles</Text>
      <Text style={styles.subtitle}>Toca el título del equipo para desplegar u ocultar detalles</Text>

      {ordenes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay órdenes pendientes en este momento.</Text>
        </View>
      ) : (
        <FlatList
          data={ordenes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal para ver la imagen en pantalla completa */}
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
  loaderContainer: { flex: 1, backgroundColor: '#F4F6FA', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
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
  equipo: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', flex: 1, marginRight: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#B45309', textTransform: 'lowercase' },
  subEquipo: { fontSize: 12, color: '#64748B' },
  detailsContainer: { marginTop: 4 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  infoText: { fontSize: 13, color: '#334155', marginBottom: 4 },
  boldText: { fontWeight: '600', color: '#0F172A' },
  diagnostico: { fontSize: 13, color: '#475569', marginBottom: 10 },
  footerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  total: { fontSize: 14, fontWeight: 'bold', color: '#166534' },
  pago: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  imagenesContainer: { marginBottom: 12 },
  previewImage: { width: 65, height: 65, borderRadius: 8, marginRight: 8, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' },
  actionButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { color: '#64748B', textAlign: 'center', fontSize: 14 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: width * 0.95, height: width * 0.95 },
  modalCloseButton: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  modalCloseText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});