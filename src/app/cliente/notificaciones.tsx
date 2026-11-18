import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

interface NotificacionItem {
  id: string;
  notificacion_id: number | null;
  reparacion_orden_id: number | null;
  categoria: 'mensaje' | 'estado' | 'tecnico' | 'presupuesto' | 'sena' | 'logistica';
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
}

type FiltroNotif = 'todas' | 'mensaje' | 'estado' | 'pagos';

const NOTIFICACIONES_SIMULADAS: NotificacionItem[] = [
  {
    id: 'sim-1',
    notificacion_id: null,
    reparacion_orden_id: 35,
    categoria: 'mensaje',
    titulo: 'Nuevo mensaje de Ing. Marcos Villalba',
    descripcion: 'Ya terminamos el test en bancada y el módulo OLED quedó calibrado al 100%.',
    fecha: 'Hoy · 20:42',
    leida: false,
  },
  {
    id: 'sim-2',
    notificacion_id: null,
    reparacion_orden_id: 35,
    categoria: 'tecnico',
    titulo: 'Orden #35 tomada por el laboratorio',
    descripcion: 'El técnico Ing. Marcos Villalba inició la microsoldadura y revisión térmica.',
    fecha: 'Hoy · 18:15',
    leida: false,
  },
  {
    id: 'sim-3',
    notificacion_id: null,
    reparacion_orden_id: 30,
    categoria: 'sena',
    titulo: 'Pago verificado · Orden #30',
    descripcion: 'Se registró el pago de $50.000,00 vía Débito. Comprobante validado en caja.',
    fecha: 'Ayer · 16:30',
    leida: false,
  },
  {
    id: 'sim-4',
    notificacion_id: null,
    reparacion_orden_id: 29,
    categoria: 'presupuesto',
    titulo: 'Presupuesto oficial aprobado · Orden #29',
    descripcion: 'Presupuesto total de $50.000,00 con 120 días de garantía escrita del taller.',
    fecha: '13 Nov · 11:20',
    leida: true,
  },
  {
    id: 'sim-5',
    notificacion_id: null,
    reparacion_orden_id: 29,
    categoria: 'logistica',
    titulo: 'En preparación para despacho · Orden #29',
    descripcion: 'Tu equipo fue embalado con protección antiestática para retiro/envío.',
    fecha: '13 Nov · 09:05',
    leida: true,
  },
];

export default function NotificacionesClienteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : 16;

  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [usandoSimulacion, setUsandoSimulacion] = useState(false);
  const [leidasLocales, setLeidasLocales] = useState<Record<string, boolean>>({});
  const [filtro, setFiltro] = useState<FiltroNotif>('todas');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarNotificaciones = useCallback(async () => {
    try {
      const urlFinal = `${API_BASE}/cliente/notificaciones.php?usuario_id=${usuarioId}`;
      const res = await fetch(urlFinal);
      const json = await res.json();

      if (json.success && Array.isArray(json.notificaciones) && json.notificaciones.length > 0) {
        setNotificaciones(json.notificaciones);
        setUsandoSimulacion(false);
      } else {
        setNotificaciones(NOTIFICACIONES_SIMULADAS);
        setUsandoSimulacion(true);
      }
    } catch {
      setNotificaciones(NOTIFICACIONES_SIMULADAS);
      setUsandoSimulacion(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarNotificaciones();
  };

const marcarComoLeida = async (item: NotificacionItem) => {
    setLeidasLocales((prev) => ({ ...prev, [item.id]: true }));
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, leida: true } : n))
    );

    try {
      await fetch(`${API_BASE}/cliente/notificaciones.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'marcar_leida',
          usuario_id: usuarioId,
          notificacion_id: item.notificacion_id,
          notif_id: item.id,
        }),
      });
    } catch {
      // Silencioso
    }
  };

  const marcarTodasLeidas = async () => {
    const mapa: Record<string, boolean> = {};
    notificaciones.forEach((n) => {
      mapa[n.id] = true;
    });
    setLeidasLocales(mapa);
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));

    try {
      await fetch(`${API_BASE}/cliente/notificaciones.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'marcar_todas_leidas',
          usuario_id: usuarioId,
        }),
      });
    } catch {
      // Silencioso
    }
  };

  const getVisualConfig = (categoria: NotificacionItem['categoria']) => {
    switch (categoria) {
      case 'mensaje':
        return {
          icon: 'chatbubble-ellipses' as const,
          color: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.15)',
          tag: 'MENSAJE',
        };
      case 'tecnico':
        return {
          icon: 'construct' as const,
          color: '#A855F7',
          bg: 'rgba(168, 85, 247, 0.15)',
          tag: 'TÉCNICO',
        };
      case 'presupuesto':
        return {
          icon: 'calculator' as const,
          color: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.15)',
          tag: 'PRESUPUESTO',
        };
      case 'sena':
        return {
          icon: 'cash' as const,
          color: '#10B981',
          bg: 'rgba(16, 185, 129, 0.15)',
          tag: 'SEÑA / PAGO',
        };
      case 'logistica':
        return {
          icon: 'bicycle' as const,
          color: '#06B6D4',
          bg: 'rgba(6, 182, 212, 0.15)',
          tag: 'PAQUETERÍA',
        };
      case 'estado':
      default:
        return {
          icon: 'sync-circle' as const,
          color: '#3B82F6',
          bg: 'rgba(59, 130, 246, 0.15)',
          tag: 'ESTADO',
        };
    }
  };

  const notificacionesFiltradas = notificaciones.filter((item) => {
    if (filtro === 'todas') return true;
    if (filtro === 'mensaje') return item.categoria === 'mensaje';
    if (filtro === 'estado') {
      return item.categoria === 'estado' || item.categoria === 'tecnico' || item.categoria === 'logistica';
    }
    if (filtro === 'pagos') return item.categoria === 'presupuesto' || item.categoria === 'sena';
    return true;
  });

  const sinLeerCount = notificaciones.filter((n) => !n.leida && !leidasLocales[n.id]).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color="#38BDF8" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Notificaciones</Text>
            {sinLeerCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{sinLeerCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            {sinLeerCount > 0 ? `${sinLeerCount} novedades sin leer` : 'Estás al día'}
          </Text>
        </View>

        <TouchableOpacity onPress={marcarTodasLeidas} style={styles.iconBtn}>
          <Ionicons name="checkmark-done" size={19} color="#10B981" />
        </TouchableOpacity>
      </View>

      {usandoSimulacion && (
        <View style={styles.simBanner}>
          <Ionicons name="sparkles" size={14} color="#38BDF8" />
          <Text style={styles.simBannerText}>
            Vista previa activa con alertas simuladas de taller
          </Text>
        </View>
      )}

      {/* FILTROS POR CATEGORÍA */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {[
            { key: 'todas', label: 'Todas' },
            { key: 'mensaje', label: 'Mensajes' },
            { key: 'estado', label: 'Estados y Técnico' },
            { key: 'pagos', label: 'Presupuesto y Seña' },
          ].map((tab) => {
            const active = filtro === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setFiltro(tab.key as FiltroNotif)}
              >
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={{ color: '#94A3B8', marginTop: 10 }}>Buscando avisos del taller...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
        >
          {notificacionesFiltradas.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="notifications-off-outline" size={44} color="#475569" />
              <Text style={styles.emptyTitle}>Sin notificaciones en esta sección</Text>
              <Text style={styles.emptySub}>
                Aquí recibirás avisos cuando un técnico tome tu orden, actualice el presupuesto, registre una seña o te envíe un mensaje.
              </Text>
            </View>
          ) : (
            notificacionesFiltradas.map((item, index) => {
              const cfg = getVisualConfig(item.categoria);
              const yaLeida = item.leida || Boolean(leidasLocales[item.id]);

              return (
                <TouchableOpacity
                  key={`${item.id}-${index}`}
                  style={[
                    styles.card,
                    !yaLeida && styles.cardUnread,
                    !yaLeida && { borderLeftColor: cfg.color, borderLeftWidth: 3 },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => marcarComoLeida(item)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <View style={[styles.tagBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.tagText, { color: cfg.color }]}>{cfg.tag}</Text>
                      </View>
                      <Text style={styles.dateText}>{item.fecha}</Text>
                    </View>

                    <Text style={styles.cardTitle}>{item.titulo}</Text>
                    <Text style={styles.cardDesc}>{item.descripcion}</Text>

                    {item.reparacion_orden_id ? (
                      <View style={styles.ordenRefRow}>
                        <Ionicons name="hardware-chip-outline" size={12} color="#38BDF8" />
                        <Text style={styles.ordenRefText}>{`Orden #${item.reparacion_orden_id}`}</Text>
                        {!yaLeida ? (
                          <View style={styles.unreadPill}>
                            <View style={styles.unreadDot} />
                            <Text style={styles.unreadLabel}>NUEVO</Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  headerBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  iconBtn: {
    backgroundColor: '#0D1E42',
    padding: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  subtitle: { color: '#38BDF8', fontSize: 11, fontWeight: '600' },

  simBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  simBannerText: { color: '#BAE6FD', fontSize: 11, fontWeight: '600' },

  filterScrollWrapper: { marginBottom: 10 },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  filterPill: {
    backgroundColor: '#0D1E42',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  filterPillActive: { backgroundColor: '#2563EB', borderColor: '#38BDF8' },
  filterPillText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  filterPillTextActive: { color: '#FFFFFF' },

  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 28 },

  emptyBox: {
    backgroundColor: '#13161F',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginTop: 10 },
  emptySub: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 18 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#13161F',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    gap: 12,
  },
  cardUnread: {
    borderColor: 'rgba(56, 189, 248, 0.45)',
    backgroundColor: '#111B33',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardBody: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  tagBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  dateText: { color: '#64748B', fontSize: 10 },
  cardTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  cardDesc: { color: '#CBD5E1', fontSize: 12, lineHeight: 17 },
  ordenRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  ordenRefText: { color: '#38BDF8', fontSize: 11, fontWeight: '700', flex: 1 },
  unreadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  unreadLabel: { color: '#38BDF8', fontSize: 9, fontWeight: '800' },
});