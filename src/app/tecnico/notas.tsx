import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_NOTAS = `${process.env.EXPO_PUBLIC_API_URL}/tecnico/notas.php`;

export default function NotasScreen() {
  const params = useGlobalSearchParams();
  // Capturamos el ID del técnico logueado (por defecto 9 si no viene en la ruta)
  const tecnicoId = params.usuarioId ? Number(params.usuarioId) : 9;

  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [notas, setNotas] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarOrdenesTecnico();
  }, [tecnicoId]);

  useEffect(() => {
    if (ordenSeleccionada) {
      obtenerNotas();
      const interval = setInterval(obtenerNotas, 4000);
      return () => clearInterval(interval);
    }
  }, [ordenSeleccionada]);

  const cargarOrdenesTecnico = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_NOTAS}?accion=ordenes&tecnico_id=${tecnicoId}`);
      const json = await res.json();
      if (json.success && json.ordenes) {
        setOrdenes(json.ordenes);
      }
    } catch (e) {
      console.log('Error al cargar órdenes del técnico', e);
    } finally {
      setLoading(false);
    }
  };

  const obtenerNotas = async () => {
    if (!ordenSeleccionada) return;
    try {
      const res = await fetch(`${API_NOTAS}?reparacion_orden_id=${ordenSeleccionada.reparacion_orden_id}`);
      const json = await res.json();
      if (json.success) setNotas(json.notas);
    } catch (e) {
      console.log('Error al refrescar chat');
    }
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim() || !ordenSeleccionada) return;

    try {
      const res = await fetch(API_NOTAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reparacion_orden_id: ordenSeleccionada.reparacion_orden_id,
          remitente: 'tecnico',
          mensaje
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMensaje('');
        obtenerNotas();
      }
    } catch (e) {
      console.log('Error al enviar nota');
    }
  };

  // VISTA 1: BANDEJA DE CHATS ESTILO WHATSAPP
  if (!ordenSeleccionada) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBandeja}>
          <Text style={styles.tituloBandeja}>Chats de Reparación</Text>
          <Text style={styles.subtituloBandeja}>Tus equipos activos en taller</Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00A884" />
            <Text style={styles.loaderText}>Cargando tus reparaciones...</Text>
          </View>
        ) : (
          <FlatList
            data={ordenes}
            keyExtractor={(item) => item.reparacion_orden_id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color="#94A3B8" />
                <Text style={styles.emptyText}>No tienes reparaciones activas asignadas.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chatCard}
                onPress={() => setOrdenSeleccionada(item)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  <Ionicons name="phone-portrait-outline" size={24} color="#FFF" />
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeaderRow}>
                    <Text style={styles.chatNombre} numberOfLines={1}>
                      {item.cliente_nombre} {item.cliente_apellido}
                    </Text>
                    <Text style={styles.chatOrdenBadge}>Orden #{item.reparacion_orden_id}</Text>
                  </View>
                  <Text style={styles.chatDispositivo} numberOfLines={1}>
                     {item.marca_nombre || ''} {item.modelo_nombre || 'Dispositivo'}
                  </Text>
                  <Text style={styles.chatHint}>Toca para abrir el chat</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.containerChat} edges={['top', 'left', 'right']}>
      <View style={styles.waHeader}>
        <TouchableOpacity onPress={() => setOrdenSeleccionada(null)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.waHeaderInfo}>
          <Text style={styles.waHeaderTitle} numberOfLines={1}>
            {ordenSeleccionada.cliente_nombre} {ordenSeleccionada.cliente_apellido}
          </Text>
          <Text style={styles.waHeaderSub} numberOfLines={1}>
            Orden #{ordenSeleccionada.reparacion_orden_id} • {ordenSeleccionada.marca_nombre} {ordenSeleccionada.modelo_nombre}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={notas}
          keyExtractor={(item, index) => (item.nota_id ? item.nota_id.toString() : index.toString())}
          contentContainerStyle={styles.chatMessageList}
          renderItem={({ item }) => {
            const esTecnico = item.remitente === 'tecnico';
            return (
              <View style={[styles.waBubble, esTecnico ? styles.waBubbleOut : styles.waBubbleIn]}>
                <Text style={[styles.waRemitente, { color: esTecnico ? '#93C5FD' : '#64748B' }]}>
                  {esTecnico ? 'Técnico (Tú)' : 'Cliente'}
                </Text>
                <Text style={[styles.waMessageText, { color: esTecnico ? '#FFF' : '#0F172A' }]}>
                  {item.mensaje}
                </Text>
                <Text style={[styles.waTimestamp, { color: esTecnico ? 'rgba(255,255,255,0.7)' : '#94A3B8' }]}>
                  {item.fecha}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.waInputBar}>
          <TextInput
            style={styles.waTextInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#8696A0"
            value={mensaje}
            onChangeText={setMensaje}
            multiline
          />
          <TouchableOpacity style={styles.waSendButton} onPress={enviarMensaje}>
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B141A' },
  headerBandeja: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#1F2C34' },
  tituloBandeja: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  subtituloBandeja: { fontSize: 13, color: '#8696A0', marginTop: 2 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#8696A0', marginTop: 10, fontSize: 13 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 30 },
  emptyText: { color: '#8696A0', textAlign: 'center', marginTop: 12, fontSize: 14 },
  
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#111B21',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222D34'
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatInfo: { flex: 1 },
  chatHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  chatNombre: { color: '#E9EDEF', fontSize: 15, fontWeight: 'bold', flex: 1, marginRight: 8 },
  chatOrdenBadge: { color: '#00A884', fontSize: 12, fontWeight: 'bold', backgroundColor: '#0B332E', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  chatDispositivo: { color: '#8696A0', fontSize: 13, marginBottom: 4 },
  chatHint: { color: '#536471', fontSize: 11, fontStyle: 'italic' },

  containerChat: { flex: 1, backgroundColor: '#0B141A' },
  waHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202C33',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#222D34'
  },
  backBtn: { marginRight: 10, padding: 4 },
  waHeaderInfo: { flex: 1 },
  waHeaderTitle: { color: '#E9EDEF', fontSize: 16, fontWeight: 'bold' },
  waHeaderSub: { color: '#8696A0', fontSize: 11, marginTop: 1 },
  chatMessageList: { paddingHorizontal: 12, paddingVertical: 16 },
  
  waBubble: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  waBubbleOut: { backgroundColor: '#005C4B', alignSelf: 'flex-end', borderTopRightRadius: 0 },
  waBubbleIn: { backgroundColor: '#202C33', alignSelf: 'flex-start', borderTopLeftRadius: 0 },
  waRemitente: { fontSize: 10, fontWeight: 'bold', marginBottom: 2, textTransform: 'uppercase' },
  waMessageText: { fontSize: 14, lineHeight: 19 },
  waTimestamp: { fontSize: 9, alignSelf: 'flex-end', marginTop: 4 },

  waInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202C33',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  waTextInput: {
    flex: 1,
    backgroundColor: '#2A3942',
    color: '#E9EDEF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  waSendButton: {
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 8,
  }
});