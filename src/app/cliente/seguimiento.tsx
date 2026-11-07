import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

export default function SeguimientoDispositivoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordenes, setOrdenes] = useState<any[]>([]);

  // Estados para el Modal del Chat
  const [chatVisible, setChatVisible] = useState(false);
  const [ordenActiva, setOrdenActiva] = useState<any>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (usuarioId) {
      fetchOrdenes();
    } else {
      setLoading(false);
    }
  }, [usuarioId]);

  const fetchOrdenes = async () => {
    if (!usuarioId) return;
    try {
      const res = await fetch(`${API_BASE}/cliente/estado_dispositivo.php?usuario_id=${usuarioId}`);
      const json = await res.json();
      if (json.estado === 'success') {
        setOrdenes(json.ordenes || []);
        if (ordenActiva) {
          const actualizada = json.ordenes.find((o: any) => o.orden_id === ordenActiva.orden_id);
          if (actualizada) setOrdenActiva(actualizada);
        }
      }
    } catch (e) {
      console.error('Error al obtener seguimiento:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (!usuarioId) return;
    setRefreshing(true);
    fetchOrdenes();
  };

  const abrirChat = (orden: any) => {
    setOrdenActiva(orden);
    setChatVisible(true);
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !ordenActiva) return;

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('reparacion_orden_id', String(ordenActiva.orden_id));
      formData.append('mensaje', nuevoMensaje.trim());

      const res = await fetch(`${API_BASE}/cliente/estado_dispositivo.php`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setNuevoMensaje('');
        fetchOrdenes();
      }
    } catch (e) {
      console.error('Error al enviar mensaje:', e);
    } finally {
      setEnviando(false);
    }
  };

  const getBadgeColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return '#F59E0B';
      case 'en proceso': return '#38BDF8';
      case 'finalizado': return '#10B981';
      case 'entregado': return '#6366F1';
      case 'cancelado': return '#EF4444';
      default: return '#64748B';
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loaderText}>Consultando estado de tus equipos...</Text>
      </View>
    );
  }

  if (!usuarioId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#38BDF8" />
          </TouchableOpacity>
          <Text style={styles.title}>Estado del Dispositivo</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.emptyTitle}>Sesión no identificada</Text>
          <Text style={styles.emptySub}>Por favor inicia sesión correctamente</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#38BDF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Estado del Dispositivo</Text>
        <Text style={styles.subtitle}>Seguimiento de órdenes en taller</Text>
      </View>

      <FlatList
        data={ordenes}
        keyExtractor={(item) => item.orden_id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="phone-portrait-outline" size={48} color="#64748B" />
            <Text style={styles.emptyTitle}>No tienes equipos en reparación</Text>
            <Text style={styles.emptySub}>Solicita un turno desde el listado de servicios</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.ordenIdText}>Orden #{item.orden_id}</Text>
                <Text style={styles.fechaText}>{item.fecha_registro}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getBadgeColor(item.estado_orden) + '22', borderColor: getBadgeColor(item.estado_orden) }]}>
                <Text style={[styles.badgeText, { color: getBadgeColor(item.estado_orden) }]}>
                  {item.estado_orden.toUpperCase()}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.chatOpenBtn} onPress={() => abrirChat(item)}>
              <Ionicons name="chatbubbles-outline" size={16} color="#38BDF8" />
              <Text style={styles.chatOpenBtnText}>
                Chat con el Técnico {item.notas?.length > 0 ? `(${item.notas.length})` : ''}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#38BDF8" />
            </TouchableOpacity>

            <View style={styles.sectionBox}>
              <Text style={styles.deviceTitle}>
                {item.marca_nombre || 'Genérico'} {item.modelo_nombre || item.categoria_nombre || 'Dispositivo'}
              </Text>
              <Text style={styles.serviceName}>{item.servicio_nombre}</Text>
              <Text style={styles.diagnostico}>Falla: {item.diagnostico_cliente}</Text>
              
              {item.numero_serie ? (
                <Text style={styles.serialText}>Nro Serie: {item.numero_serie}</Text>
              ) : null}
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>CÓDIGO SEGURIDAD</Text>
                <Text style={styles.codeValue}>{item.codigo_seguridad || 'PENDIENTE'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>TOTAL ESTIMADO</Text>
                <Text style={styles.priceValue}>${Number(item.total).toLocaleString('es-AR')}</Text>
              </View>
            </View>

          </View>
        )}
      />

      <Modal visible={chatVisible} animationType="slide" transparent={true} onRequestClose={() => setChatVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Soporte Técnico</Text>
                <Text style={styles.modalSub}>Orden #{ordenActiva?.orden_id} - {ordenActiva?.modelo_nombre || 'Dispositivo'}</Text>
              </View>
              <TouchableOpacity onPress={() => setChatVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatScroll} contentContainerStyle={{ padding: 12 }}>
              {ordenActiva?.notas && ordenActiva.notas.length > 0 ? (
                ordenActiva.notas.map((nota: any, idx: number) => {
                  const esCliente = nota.remitente === 'cliente';
                  return (
                    <View key={idx} style={[styles.bubbleContainer, esCliente ? styles.bubbleCliente : styles.bubbleTecnico]}>
                      <Text style={styles.bubbleRemitente}>{esCliente ? 'Tú' : 'Técnico'}</Text>
                      <Text style={styles.bubbleText}>{nota.mensaje}</Text>
                      <Text style={styles.bubbleDate}>{nota.fecha}</Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyChat}>
                  <Ionicons name="chatbubble-outline" size={32} color="#64748B" />
                  <Text style={styles.emptyChatText}>No hay mensajes aún. ¡Escribe al técnico!</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Escribe un mensaje al técnico..."
                placeholderTextColor="#64748B"
                value={nuevoMensaje}
                onChangeText={setNuevoMensaje}
                multiline
              />
              <TouchableOpacity style={styles.sendBtn} onPress={enviarMensaje} disabled={enviando}>
                {enviando ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={16} color="#FFF" />}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#071026' },
  loaderText: { color: '#CBD5E1', marginTop: 10, fontSize: 13, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { backgroundColor: '#0D1E42', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#13161F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  ordenIdText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  fechaText: { color: '#64748B', fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  chatOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1E42',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    gap: 8,
  },
  chatOpenBtnText: { color: '#38BDF8', fontSize: 12, fontWeight: '700', flex: 1 },
  sectionBox: { backgroundColor: '#0D1E42', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.15)' },
  deviceTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  serviceName: { color: '#38BDF8', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  diagnostico: { color: '#CBD5E1', fontSize: 12, marginBottom: 4 },
  serialText: { color: '#64748B', fontSize: 11 },
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  infoBox: { flex: 1, backgroundColor: '#0D1E42', padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.15)' },
  infoLabel: { color: '#64748B', fontSize: 9, fontWeight: '700', marginBottom: 2 },
  codeValue: { color: '#F59E0B', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  priceValue: { color: '#10B981', fontSize: 14, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  emptySub: { color: '#64748B', fontSize: 12, marginTop: 4, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.9)', justifyContent: 'flex-end' },
  modalContent: { height: '80%', backgroundColor: '#13161F', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  modalSub: { color: '#38BDF8', fontSize: 11, marginTop: 2 },
  closeBtn: { backgroundColor: '#0D1E42', padding: 6, borderRadius: 8 },
  chatScroll: { flex: 1 },
  bubbleContainer: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 10 },
  bubbleCliente: { alignSelf: 'flex-end', backgroundColor: '#2563EB' },
  bubbleTecnico: { alignSelf: 'flex-start', backgroundColor: '#0D1E42', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  bubbleRemitente: { fontSize: 9, fontWeight: '800', color: '#94A3B8', marginBottom: 2 },
  bubbleText: { color: '#FFFFFF', fontSize: 13 },
  bubbleDate: { fontSize: 9, color: '#94A3B8', alignSelf: 'flex-end', marginTop: 4 },
  emptyChat: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyChatText: { color: '#64748B', fontSize: 12, marginTop: 8 },
  chatInputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: '#071026', alignItems: 'center', gap: 8 },
  chatInput: { flex: 1, backgroundColor: '#0D1E42', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, color: '#FFF', fontSize: 13, maxHeight: 90 },
  sendBtn: { backgroundColor: '#2563EB', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }
});