import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_ENTREGAS = `${process.env.EXPO_PUBLIC_API_URL}/recepcionista/entregas.php`;

export default function EntregasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const empleadoId = params.empleadoId ? Number(params.empleadoId) : 11;

  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [formasPagoDisponibles, setFormasPagoDisponibles] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [ordenExpandidaId, setOrdenExpandidaId] = useState<number | null>(null);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [pagosSeleccionados, setPagosSeleccionados] = useState<any[]>([]);
  const [procesandoEntrega, setProcesandoEntrega] = useState(false);
  const [urlQr, setUrlQr] = useState<string | null>(null);

  const cargarEntregas = async (query = '') => {
    try {
      if (!refreshing) setLoading(true);
      const res = await fetch(`${API_ENTREGAS}?busqueda=${encodeURIComponent(query)}`);
      const text = await res.text();
      
      let json;
      try {
        json = JSON.parse(text);
      } catch (err) {
        console.error("Respuesta no JSON:", text);
        return;
      }

      if (json.success) {
        setOrdenes(json.ordenes || []);
        setFormasPagoDisponibles(json.formas_pago || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarEntregas(busqueda);
  }, []);

  const toggleExpandir = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOrdenExpandidaId(ordenExpandidaId === id ? null : id);
  };

  const abrirModalEntrega = (orden: any) => {
    setOrdenSeleccionada(orden);
    setUrlQr(null);
    const saldo = Number(orden.saldo_pendiente) > 0 ? Number(orden.saldo_pendiente) : 0;
    const defaultPagoId = formasPagoDisponibles.length > 0 ? formasPagoDisponibles[0].formas_pago_id : 1;
    setPagosSeleccionados([{ forma_pago_id: defaultPagoId, monto: saldo.toString() }]);
  };

  const agregarMetodoPago = () => {
    const defaultPagoId = formasPagoDisponibles.length > 0 ? formasPagoDisponibles[0].formas_pago_id : 1;
    setPagosSeleccionados([...pagosSeleccionados, { forma_pago_id: defaultPagoId, monto: '0' }]);
  };

  const eliminarMetodoPago = (index: number) => {
    if (pagosSeleccionados.length === 1) return;
    setPagosSeleccionados(pagosSeleccionados.filter((_, i) => i !== index));
  };

  const actualizarPago = (index: number, campo: string, valor: any) => {
    const nuevosPagos = [...pagosSeleccionados];
    nuevosPagos[index][campo] = valor;
    setPagosSeleccionados(nuevosPagos);
  };

  const pagarConMercadoPagoAPI = async () => {
    if (!ordenSeleccionada) return;
    const saldo = Number(ordenSeleccionada.saldo_pendiente) > 0 ? Number(ordenSeleccionada.saldo_pendiente) : 0;

    try {
      setProcesandoEntrega(true);
      const res = await fetch(`${API_ENTREGAS}?accion=crear_preferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reparacion_orden_id: ordenSeleccionada.reparacion_orden_id,
          monto: saldo
        }),
      });

      const textResponse = await res.text();
      let json;
      try {
        json = JSON.parse(textResponse);
      } catch (e) {
        Alert.alert('Error', 'Respuesta no válida del servidor.');
        return;
      }

      if (json.success && json.init_point) {
        setUrlQr(json.init_point);
      } else {
        Alert.alert('Error', json.message || 'No se pudo generar la preferencia de pago.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Fallo al conectar con la API de Mercado Pago.');
    } finally {
      setProcesandoEntrega(false);
    }
  };

  const confirmarEntregaConPagos = async () => {
    if (!ordenSeleccionada) return;

    try {
      setProcesandoEntrega(true);
      const res = await fetch(API_ENTREGAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reparacion_orden_id: ordenSeleccionada.reparacion_orden_id,
          empleado_id: empleadoId,
          pagos: pagosSeleccionados.map(p => ({ forma_pago_id: Number(p.forma_pago_id), monto: Number(p.monto) }))
        }),
      });

      const textResponse = await res.text();
      let json;
      try {
        json = JSON.parse(textResponse);
      } catch (e) {
        Alert.alert('Error Backend', 'Hubo un error al confirmar la entrega.');
        return;
      }

      if (json.success) {
        Alert.alert('¡Éxito!', json.message);
        setOrdenSeleccionada(null);
        setUrlQr(null);
        cargarEntregas(busqueda);
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo completar la operación.');
    } finally {
      setProcesandoEntrega(false);
    }
  };

  const formatMoneda = (monto: number | string) => {
    return `$ ${Number(monto || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entrega de Equipos</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por DNI o Código..."
          placeholderTextColor="#94A3B8"
          value={busqueda}
          onChangeText={(texto) => { setBusqueda(texto); cargarEntregas(texto); }}
        />
      </View>

      <FlatList
        data={ordenes}
        keyExtractor={(item) => item.reparacion_orden_id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargarEntregas(busqueda)} tintColor="#2563EB" />}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron entregas pendientes.</Text>}
        renderItem={({ item }) => {
          const estaExpandido = ordenExpandidaId === item.reparacion_orden_id;

          return (
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={styles.card} 
              onPress={() => toggleExpandir(item.reparacion_orden_id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.ordenId}>Orden #{item.reparacion_orden_id}</Text>
                <Ionicons name={estaExpandido ? "chevron-up" : "chevron-down"} size={20} color="#2563EB" />
              </View>
              
              <Text style={styles.clienteNombre}>{item.cliente_nombre} {item.cliente_apellido}</Text>
              <Text style={styles.detailText}>Equipo: {item.marca_nombre} {item.modelo_nombre}</Text>

              {estaExpandido && (
                <View style={styles.detailsContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.infoTitle}>Información del Cliente y Equipo:</Text>
                  <Text style={styles.infoText}>• DNI / CUIT: <Text style={styles.infoValue}>{item.cliente_dni || 'No registrado'}</Text></Text>
                  <Text style={styles.infoText}>• N° de Serie: <Text style={styles.infoValue}>{item.numero_serie || 'N/A'}</Text></Text>
                  <Text style={styles.infoText}>• IMEI: <Text style={styles.infoValue}>{item.imei || 'N/A'}</Text></Text>
                  <Text style={styles.infoText}>• Diagnóstico: <Text style={styles.infoValue}>{item.diagnostico_cliente}</Text></Text>

                  <View style={styles.codigoBox}>
                    <Ionicons name="shield-checkmark" size={18} color="#F59E0B" style={{ marginRight: 6 }} />
                    <Text style={styles.codigoLabel}>Código de Seguridad:</Text>
                    <Text style={styles.codigoValue}>{item.codigo_seguridad || '----'}</Text>
                  </View>

                  <View style={styles.saldoBox}>
                    <Text style={styles.saldoLabel}>Saldo Pendiente:</Text>
                    <Text style={styles.precioSaldo}>{formatMoneda(item.saldo_pendiente)}</Text>
                  </View>

                  <TouchableOpacity style={styles.btnEntregar} onPress={() => abrirModalEntrega(item)}>
                    <Ionicons name="cash-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.btnEntregarText}>Procesar Cobro y Entrega</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* MODAL DE PAGOS */}
      <Modal visible={!!ordenSeleccionada} transparent animationType="fade" onRequestClose={() => { setOrdenSeleccionada(null); setUrlQr(null); }}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Métodos de Pago y Cierre</Text>
            
            {urlQr ? (
              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ color: '#2563EB', fontWeight: 'bold', marginBottom: 12, textAlign: 'center', fontSize: 14 }}>
                  Escaneá el código QR con Mercado Pago:
                </Text>
                <Image 
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(urlQr)}` }} 
                  style={{ width: 210, height: 210, backgroundColor: '#FFF', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' }} 
                />
                <TouchableOpacity 
                  style={[styles.btnModalCancel, { marginTop: 15, width: '100%' }]} 
                  onPress={() => setUrlQr(null)}
                >
                  <Text style={styles.btnModalCancelText}>← Generar otro / Métodos Locales</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.btnMercadoPago} onPress={pagarConMercadoPagoAPI}>
                  <Ionicons name="qr-code-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.btnMpText}>Generar QR de Mercado Pago</Text>
                </TouchableOpacity>

                <View style={{ marginVertical: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: 'bold' }}>Métodos Locales:</Text>
                    <TouchableOpacity onPress={agregarMetodoPago}>
                      <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: 'bold' }}>+ Agregar Método</Text>
                    </TouchableOpacity>
                  </View>

                  {pagosSeleccionados.map((pago, index) => (
                    <View key={index} style={styles.pagoRow}>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={String(pago.forma_pago_id)}
                          onValueChange={(val) => actualizarPago(index, 'forma_pago_id', val)}
                          style={{ color: '#0F172A', height: 44 }}
                        >
                          {formasPagoDisponibles.map((fp) => (
                            <Picker.Item key={fp.formas_pago_id} label={fp.forma} value={String(fp.formas_pago_id)} />
                          ))}
                        </Picker>
                      </View>
                      <TextInput
                        style={styles.inputMonto}
                        placeholder="Monto"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={String(pago.monto)}
                        onChangeText={(val) => actualizarPago(index, 'monto', val)}
                      />
                      {pagosSeleccionados.length > 1 && (
                        <TouchableOpacity onPress={() => eliminarMetodoPago(index)} style={{ justifyContent: 'center', paddingLeft: 8 }}>
                          <Ionicons name="trash" size={20} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>

                {procesandoEntrega ? (
                  <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 20 }} />
                ) : (
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.btnModalCancel} onPress={() => { setOrdenSeleccionada(null); setUrlQr(null); }}>
                      <Text style={styles.btnModalCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnModalConfirm} onPress={confirmarEntregaConPagos}>
                      <Text style={styles.btnModalConfirmText}>Registrar Entrega</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', margin: 16, borderRadius: 10, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#CBD5E1' },
  searchInput: { flex: 1, color: '#0F172A', fontSize: 14 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ordenId: { color: '#2563EB', fontSize: 14, fontWeight: 'bold' },
  clienteNombre: { color: '#0F172A', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  detailText: { color: '#64748B', fontSize: 13 },
  detailsContainer: { marginTop: 12 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  infoTitle: { color: '#334155', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  infoText: { color: '#64748B', fontSize: 12, marginBottom: 4 },
  infoValue: { color: '#0F172A', fontWeight: '500' },
  codigoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginVertical: 12, borderWidth: 1, borderColor: '#FDE68A' },
  codigoLabel: { color: '#B45309', fontSize: 13, flex: 1, fontWeight: '600' },
  codigoValue: { color: '#B45309', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  saldoBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  saldoLabel: { color: '#334155', fontSize: 14, fontWeight: '600' },
  precioSaldo: { color: '#DC2626', fontSize: 18, fontWeight: 'bold' },
  btnEntregar: { backgroundColor: '#10B981', padding: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  btnEntregarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  emptyText: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  modalBg: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 24, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  modalTitle: { color: '#0F172A', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  btnMercadoPago: { backgroundColor: '#009EE3', flexDirection: 'row', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  btnMpText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  pagoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  pickerContainer: { flex: 2, backgroundColor: '#F8FAFC', borderRadius: 8, marginRight: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#CBD5E1', height: 44, justifyContent: 'center' },
  inputMonto: { flex: 1, backgroundColor: '#F8FAFC', color: '#0F172A', paddingHorizontal: 12, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btnModalCancel: { flex: 1, backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
  btnModalCancelText: { color: '#334155', fontWeight: 'bold', fontSize: 14 },
  btnModalConfirm: { flex: 1.5, backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnModalConfirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});