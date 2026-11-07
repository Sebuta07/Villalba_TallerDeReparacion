import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

export default function NotificacionesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : 3;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const res = await fetch(`${API_BASE}/cliente/notificaciones.php?usuario_id=${usuarioId}`);
      const json = await res.json();
      if (json.estado === 'success') {
        setNotificaciones(json.notificaciones || []);
      }
    } catch (e) {
      console.error('Error al cargar notificaciones:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotificaciones();
  };

  const obtenerIcono = (tipo: string) => {
    switch (tipo) {
      case 'compra':
        return <Ionicons name="cart" size={20} color="#10B981" />;
      case 'reparacion':
        return <Ionicons name="construct" size={20} color="#38BDF8" />;
      default:
        return <Ionicons name="notifications" size={20} color="#F59E0B" />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loaderText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#38BDF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones y Alertas</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={notificaciones}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={54} color="#64748B" />
            <Text style={styles.emptyTitle}>No tienes notificaciones recientes</Text>
            <Text style={styles.emptySub}>Aquí aparecerán los avisos de tus compras y reparaciones</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              {obtenerIcono(item.tipo)}
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardDate}>{item.fecha}</Text>
              </View>
              <Text style={styles.cardMessage}>{item.mensaje}</Text>
            </View>
          </View>
        )}
      />
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
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#13161F',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0D1E42',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  cardBody: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  cardDate: { color: '#64748B', fontSize: 10 },
  cardMessage: { color: '#94A3B8', fontSize: 12, lineHeight: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptySub: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }
});