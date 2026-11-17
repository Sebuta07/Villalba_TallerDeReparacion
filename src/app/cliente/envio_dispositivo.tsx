import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

interface OrdenLogistica {
  reparacion_orden_id: number;
  codigo_seguridad: string | null;
  diagnostico_cliente: string;
  estados_or_id: number;
  estado_taller: string;
  tipo_entrega: 'sucursal' | 'envio';
  fecha_registro: string;
  marca: string;
  modelo: string;
  codigo_seguimiento: string | null;
  estado_envio: string | null;
  coordenadas_gps: string | null;
  direccion_logistica: string | null;
  distancia_km: string | null;
  codigo_envio_logistica: string | null;
  detalle_envios_sucursal_id: number | null;
  calle: string | null;
  barrio: string | null;
  manzana: string | null;
  casa: string | null;
  obs_envio: string | null;
}

const FRANJAS = [
  'Lo antes posible (Hoy)',
  'Mañana (09:00 a 13:00 hs)',
  'Tarde (16:00 a 20:30 hs)',
];

export default function EnvioDispositivoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : 2;

  const [ordenes, setOrdenes] = useState<OrdenLogistica[]>([]);
  const [direccionRespaldo, setDireccionRespaldo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filtro, setFiltro] = useState<'activos' | 'todos'>('activos');

  const [modalVisible, setModalVisible] = useState(false);
  const [ordenParaRetiro, setOrdenParaRetiro] = useState<OrdenLogistica | null>(null);
  const [franjaSeleccionada, setFranjaSeleccionada] = useState(FRANJAS[0]);
  const [enviandoRetiro, setEnviandoRetiro] = useState(false);

  const cargarSeguimiento = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/cliente/logistica_dispositivos.php?usuario_id=${usuarioId}`);
      const json = await res.json();
      if (json.success) {
        setOrdenes(Array.isArray(json.ordenes) ? json.ordenes : []);
        setDireccionRespaldo(json.direccion_respaldo || null);
      }
    } catch (error) {
      console.error('Error cargando seguimiento logístico:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    cargarSeguimiento();
  }, [cargarSeguimiento]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarSeguimiento();
  };

  const abrirGoogleMaps = (gps: string | null, direccionTexto: string) => {
    const query =
      gps && gps.includes(',')
        ? gps.replace(/\s+/g, '')
        : encodeURIComponent(`${direccionTexto}, Formosa, Argentina`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'No se pudo abrir Google Maps.'));
  };

  const abrirModalRetiro = (orden: OrdenLogistica) => {
    setOrdenParaRetiro(orden);
    setFranjaSeleccionada(FRANJAS[0]);
    setModalVisible(true);
  };

  const confirmarSolicitudRetiro = async () => {
    if (!ordenParaRetiro) return;
    setEnviandoRetiro(true);
    try {
      const formData = new FormData();
      formData.append('usuario_id', String(usuarioId));
      formData.append('reparacion_orden_id', String(ordenParaRetiro.reparacion_orden_id));
      formData.append('franja_horaria', franjaSeleccionada);

      const response = await fetch(`${API_BASE}/cliente/logistica_dispositivos.php`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      if (json.success) {
        setModalVisible(false);
        Alert.alert('¡Cadete Solicitado!', json.mensaje);
        cargarSeguimiento();
      } else {
        Alert.alert('Error', json.error || 'No se pudo solicitar el retiro.');
      }
    } catch (e) {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setEnviandoRetiro(false);
    }
  };

  const getPasoLogistico = (item: OrdenLogistica) => {
    const estadoId = Number(item.estados_or_id);
    const estEnvio = (item.estado_envio || '').toLowerCase();

    if (estadoId === 5 || estadoId === 6 || estEnvio.includes('entregado')) return 3;
    if (estadoId === 3 || estEnvio.includes('camino') || estEnvio.includes('entrega')) return 3;
    if (estadoId === 2) return 2;
    return 1;
  };

  const getBadgeEstado = (item: OrdenLogistica) => {
    const estadoId = Number(item.estados_or_id);
    const estEnvio = item.estado_envio || '';

    if (estadoId === 5 || estadoId === 6 || estEnvio.toLowerCase().includes('entregado')) {
      return { label: 'Entregado al Cliente', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
    }
    if (estadoId === 3) {
      return {
        label: item.tipo_entrega === 'envio' ? 'Listo · En Camino a Domicilio' : 'Listo en Sucursal',
        color: '#38BDF8',
        bg: 'rgba(56, 189, 248, 0.15)',
      };
    }
    if (estEnvio.toLowerCase().includes('retiro solicitado')) {
      return { label: 'Cadete en Camino a Retirar', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
    }
    if (estadoId === 2) {
      return { label: 'En Reparación en Taller', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
    }
    return {
      label: item.tipo_entrega === 'envio' ? 'Logística de Retiro Activa' : 'Pendiente de Ingreso',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.15)',
    };
  };

  const ordenesFiltradas = ordenes.filter((o) => {
    if (filtro === 'todos') return true;
    return Number(o.estados_or_id) !== 5 && Number(o.estados_or_id) !== 6;
  });

  const obtenerDireccionVisible = (item: OrdenLogistica) => {
    if (item.calle) {
      const barrioStr = item.barrio ? ` — B° ${item.barrio}` : '';
      const mzStr = item.manzana ? ` (Mz. ${item.manzana} Cs. ${item.casa || ''})` : '';
      return `${item.calle}${barrioStr}${mzStr}`;
    }
    if (item.direccion_logistica) return item.direccion_logistica;
    if (direccionRespaldo?.direccion_calle) {
      return `${direccionRespaldo.direccion_calle} (${direccionRespaldo.localidad || 'Formosa'})`;
    }
    return 'Dirección vinculada a tu orden';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color="#38BDF8" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Logística y Seguimiento</Text>
          <Text style={styles.subtitle}>Retiro y Entrega de Dispositivos</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.iconBtn}>
          <Ionicons name="refresh" size={18} color="#38BDF8" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterBtn, filtro === 'activos' && styles.filterBtnActive]}
          onPress={() => setFiltro('activos')}
        >
          <Text style={[styles.filterText, filtro === 'activos' && styles.filterTextActive]}>
            {`En Curso (${ordenes.filter((o) => Number(o.estados_or_id) < 5).length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filtro === 'todos' && styles.filterBtnActive]}
          onPress={() => setFiltro('todos')}
        >
          <Text style={[styles.filterText, filtro === 'todos' && styles.filterTextActive]}>
            {`Historial Completo (${ordenes.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={{ color: '#94A3B8', marginTop: 10 }}>Cargando seguimiento de equipos...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
        >
          {ordenesFiltradas.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="cube-outline" size={44} color="#475569" />
              <Text style={styles.emptyTitle}>No hay envíos o retiros en esta vista</Text>
              <Text style={styles.emptySub}>
                Cuando generes una orden de reparación, podrás pedir aquí que paquetería pase a buscar tu equipo o seguir su entrega.
              </Text>
            </View>
          ) : (
            ordenesFiltradas.map((item, index) => {
              const badge = getBadgeEstado(item);
              const paso = getPasoLogistico(item);
              const direccionTexto = obtenerDireccionVisible(item);
              const gpsCoords = item.coordenadas_gps || direccionRespaldo?.coordenadas_gps || null;

              const yaTieneRetiro =
                item.tipo_entrega === 'envio' ||
                (item.estado_envio || '').toLowerCase().includes('retiro') ||
                item.detalle_envios_sucursal_id !== null;
              const puedePedirRetiro = Number(item.estados_or_id) === 1 && !yaTieneRetiro;

              return (
                <View key={`orden-${item.reparacion_orden_id}-${index}`} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.orderTag}>
                      <Ionicons name="hardware-chip-outline" size={14} color="#38BDF8" />
                      <Text style={styles.orderTagText}>
                        {item.codigo_seguimiento || `Orden #${item.reparacion_orden_id}`}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.deviceName}>
                    {`${item.marca || 'Equipo'} ${item.modelo || ''}`.trim()}
                  </Text>
                  <Text style={styles.diagText} numberOfLines={2}>
                    {item.diagnostico_cliente || 'Revisión técnica en laboratorio'}
                  </Text>

                  <View style={styles.stepperContainer}>
                    <View style={styles.stepItem}>
                      <View style={[styles.stepDot, paso >= 1 && styles.stepDotActive]}>
                        <Ionicons name="bicycle" size={12} color="#FFF" />
                      </View>
                      <Text style={[styles.stepLabel, paso >= 1 && styles.stepLabelActive]}>
                        {item.tipo_entrega === 'envio' ? 'Retiro / Recepción' : 'En Sucursal'}
                      </Text>
                    </View>

                    <View style={[styles.stepLine, paso >= 2 && styles.stepLineActive]} />

                    <View style={styles.stepItem}>
                      <View style={[styles.stepDot, paso >= 2 && styles.stepDotActive]}>
                        <Ionicons name="construct" size={12} color="#FFF" />
                      </View>
                      <Text style={[styles.stepLabel, paso >= 2 && styles.stepLabelActive]}>En Taller</Text>
                    </View>

                    <View style={[styles.stepLine, paso >= 3 && styles.stepLineActive]} />

                    <View style={styles.stepItem}>
                      <View style={[styles.stepDot, paso >= 3 && styles.stepDotDone]}>
                        <Ionicons name="checkmark" size={13} color="#FFF" />
                      </View>
                      <Text style={[styles.stepLabel, paso >= 3 && styles.stepLabelActive]}>
                        {item.tipo_entrega === 'envio' ? 'Entrega Domicilio' : 'Listo Retiro'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locationBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationTitle}>
                        {item.tipo_entrega === 'envio'
                          ? 'Punto de Retiro / Entrega Registrado:'
                          : 'Dirección del Cliente:'}
                      </Text>
                      <Text style={styles.locationText}>{direccionTexto}</Text>
                      {gpsCoords ? (
                        <Text style={styles.gpsCoordsText}>{`GPS Google: ${gpsCoords}`}</Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={styles.mapBtn}
                      onPress={() => abrirGoogleMaps(gpsCoords, direccionTexto)}
                    >
                      <Ionicons name="location" size={16} color="#FFF" />
                      <Text style={styles.mapBtnText}>Maps</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pinRow}>
                    <View>
                      <Text style={styles.pinCaption}>CÓDIGO SEGURIDAD CADETE / RETIRO</Text>
                      <Text style={styles.pinCode}>{item.codigo_seguridad || 'PIN-8492'}</Text>
                    </View>
                    {item.codigo_envio_logistica ? (
                      <View style={styles.trackingPill}>
                        <Text style={styles.trackingPillText}>{item.codigo_envio_logistica}</Text>
                      </View>
                    ) : null}
                  </View>

                  {puedePedirRetiro && (
                    <TouchableOpacity
                      style={styles.pickupBtn}
                      onPress={() => abrirModalRetiro(item)}
                    >
                      <Ionicons name="bicycle" size={18} color="#FFF" />
                      <Text style={styles.pickupBtnText}>
                        PEDIR RETIRO POR PAQUETERÍA A DOMICILIO
                      </Text>
                    </TouchableOpacity>
                  )}

                  {yaTieneRetiro && Number(item.estados_or_id) === 1 && (
                    <View style={styles.activeLogisticsBanner}>
                      <Ionicons name="time-outline" size={15} color="#38BDF8" />
                      <Text style={styles.activeLogisticsText}>
                        Solicitud asignada a paquetería. Ten listo tu dispositivo y el PIN.
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Solicitar Retiro por Paquetería</Text>
            <Text style={styles.modalSub}>
              {`Un cadete de Fénix Lab pasará a buscar tu ${ordenParaRetiro?.marca || 'equipo'} ${
                ordenParaRetiro?.modelo || ''
              } por la dirección registrada en tu orden.`}
            </Text>

            <Text style={styles.modalLabel}>¿En qué horario puede pasar el cadete?</Text>
            {FRANJAS.map((f) => {
              const active = franjaSeleccionada === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.franjaOption, active && styles.franjaOptionActive]}
                  onPress={() => setFranjaSeleccionada(f)}
                >
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={active ? '#38BDF8' : '#64748B'}
                  />
                  <Text style={[styles.franjaOptionText, active && { color: '#FFF', fontWeight: '700' }]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={enviandoRetiro}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmarSolicitudRetiro}
                disabled={enviandoRetiro}
              >
                {enviandoRetiro ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmar Retiro</Text>
                )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    backgroundColor: '#0D1E42',
    padding: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  subtitle: { color: '#38BDF8', fontSize: 11, fontWeight: '600' },
  filterBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#0D1E42',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  filterBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#2563EB' },
  filterText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  emptyBox: {
    backgroundColor: '#13161F',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginTop: 10 },
  emptySub: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  card: {
    backgroundColor: '#13161F',
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.22)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  orderTagText: { color: '#38BDF8', fontSize: 12, fontWeight: '800' },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  deviceName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  diagText: { color: '#94A3B8', fontSize: 12, marginTop: 2, marginBottom: 12 },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A1329',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  stepItem: { alignItems: 'center', width: 78 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotActive: { backgroundColor: '#2563EB' },
  stepDotDone: { backgroundColor: '#10B981' },
  stepLabel: { color: '#64748B', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  stepLabelActive: { color: '#E2E8F0' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#1E293B', marginBottom: 14 },
  stepLineActive: { backgroundColor: '#2563EB' },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1E42',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    marginBottom: 10,
  },
  locationTitle: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
  locationText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginTop: 2 },
  gpsCoordsText: { color: '#38BDF8', fontSize: 10, marginTop: 2 },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  pinCaption: { color: '#94A3B8', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  pinCode: { color: '#38BDF8', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  trackingPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  trackingPillText: { color: '#10B981', fontSize: 10, fontWeight: '800' },
  pickupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  pickupBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  activeLogisticsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: 9,
    borderRadius: 8,
    marginTop: 10,
  },
  activeLogisticsText: { color: '#CBD5E1', fontSize: 11, flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#13161F',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  modalSub: { color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: 14 },
  modalLabel: { color: '#CBD5E1', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  franjaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0D1E42',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  franjaOptionActive: { borderColor: '#38BDF8', backgroundColor: '#1E3A8A' },
  franjaOptionText: { color: '#94A3B8', fontSize: 12 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#1E293B',
  },
  modalCancelText: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  modalConfirmBtn: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#10B981',
  },
  modalConfirmText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});