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
        Alert.alert('Error', 'Respuesta no válida del servidor: ' + textResponse);
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
        Alert.alert('Error Backend', textResponse);
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entrega de Equipos</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8696A0" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por DNI o Código..."
          placeholderTextColor="#8696A0"
          value={busqueda}
          onChangeText={(texto) => { setBusqueda(texto); cargarEntregas(texto); }}
        />
      </View>

      <FlatList
        data={ordenes}
        keyExtractor={(item) => item.reparacion_orden_id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargarEntregas(busqueda)} tintColor="#00A884" />}
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
                <Ionicons name={estaExpandido ? "chevron-up" : "chevron-down"} size={20} color="#00A884" />
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

                  <Text style={styles.precioSaldo}>Saldo Pendiente: ${item.saldo_pendiente}</Text>

                  <TouchableOpacity style={styles.btnEntregar} onPress={() => abrirModalEntrega(item)}>
                    <Text style={styles.btnEntregarText}>Procesar Cobro y Entrega</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={!!ordenSeleccionada} transparent animationType="fade" onRequestClose={() => { setOrdenSeleccionada(null); setUrlQr(null); }}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Métodos de Pago y Cierre</Text>
            
            {urlQr ? (
              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ color: '#00A884', fontWeight: 'bold', marginBottom: 12, textAlign: 'center', fontSize: 14 }}>
                  Escaneá el código QR con Mercado Pago:
                </Text>
                <Image 
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(urlQr)}` }} 
                  style={{ width: 210, height: 210, backgroundColor: '#FFF', borderRadius: 8, padding: 10 }} 
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#E9EDEF', fontSize: 13, fontWeight: 'bold' }}>Métodos Locales:</Text>
                    <TouchableOpacity onPress={agregarMetodoPago}>
                      <Text style={{ color: '#00A884', fontSize: 12, fontWeight: 'bold' }}>+ Agregar Método</Text>
                    </TouchableOpacity>
                  </View>

                  {pagosSeleccionados.map((pago, index) => (
                    <View key={index} style={styles.pagoRow}>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={String(pago.forma_pago_id)}
                          onValueChange={(val) => actualizarPago(index, 'forma_pago_id', val)}
                          style={{ color: '#FFF', height: 40 }}
                        >
                          {formasPagoDisponibles.map((fp) => (
                            <Picker.Item key={fp.formas_pago_id} label={fp.forma} value={String(fp.formas_pago_id)} color="#000" />
                          ))}
                        </Picker>
                      </View>
                      <TextInput
                        style={styles.inputMonto}
                        placeholder="Monto"
                        placeholderTextColor="#8696A0"
                        keyboardType="numeric"
                        value={String(pago.monto)}
                        onChangeText={(val) => actualizarPago(index, 'monto', val)}
                      />
                      {pagosSeleccionados.length > 1 && (
                        <TouchableOpacity onPress={() => eliminarMetodoPago(index)} style={{ justifyContent: 'center', paddingLeft: 6 }}>
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>

                {procesandoEntrega ? (
                  <ActivityIndicator size="large" color="#00A884" style={{ marginVertical: 20 }} />
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
  container: { flex: 1, backgroundColor: '#0B141A' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2C34', padding: 16 },
  backBtn: { marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#202C33', margin: 16, borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, color: '#E9EDEF', fontSize: 14 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: '#111B21', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#222D34' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  ordenId: { color: '#00A884', fontSize: 13, fontWeight: 'bold' },
  clienteNombre: { color: '#E9EDEF', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  detailText: { color: '#94A3B8', fontSize: 13 },
  detailsContainer: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#222D34', marginVertical: 8 },
  infoTitle: { color: '#00A884', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  infoText: { color: '#8696A0', fontSize: 12, marginBottom: 2 },
  infoValue: { color: '#FFF', fontWeight: '500' },
  codigoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2C34', padding: 10, borderRadius: 8, marginVertical: 10, borderWidth: 1, borderColor: '#334155' },
  codigoLabel: { color: '#E9EDEF', fontSize: 13, flex: 1 },
  codigoValue: { color: '#F59E0B', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  precioSaldo: { color: '#EF4444', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  btnEntregar: { backgroundColor: '#00A884', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnEntregarText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#111B21', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#222D34' },
  modalTitle: { color: '#E9EDEF', fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  btnMercadoPago: { backgroundColor: '#009EE3', flexDirection: 'row', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  btnMpText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  pagoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  pickerContainer: { flex: 2, backgroundColor: '#1F2C34', borderRadius: 8, marginRight: 8, overflow: 'hidden' },
  inputMonto: { flex: 1, backgroundColor: '#1F2C34', color: '#FFF', paddingHorizontal: 10, height: 40, borderRadius: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnModalCancel: { flex: 1, backgroundColor: '#334155', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnModalCancelText: { color: '#FFF', fontWeight: 'bold' },
  btnModalConfirm: { flex: 1.5, backgroundColor: '#00A884', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnModalConfirmText: { color: '#FFF', fontWeight: 'bold' },
});