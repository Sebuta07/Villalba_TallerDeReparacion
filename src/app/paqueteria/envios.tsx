import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BANDEJA = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/bandeja.php`;
const API_GENERAR = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/generar_codigo.php`;
const API_ENTREGAR = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/entregar_orden.php`;

const obtenerCoordenadaDeItem = (item: any): string | null => {
  if (!item) return null;
  if (item.coordenadas_detectadas && String(item.coordenadas_detectadas).trim() !== '') {
    return String(item.coordenadas_detectadas).trim();
  }
  const fuente = `${item.observaciones_envio || ''} ${item.referencia_direccion || ''}`;
  const match = fuente.match(/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
  return match ? `${match[1]}, ${match[2]}` : null;
};

export default function EnviosScreen() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [codigoInput, setCodigoInput] = useState('');

  // Modal para ver detalles y dirección de envío
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);

  useEffect(() => { cargarOrdenes(); }, []);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BANDEJA);
      const data = await res.json();
      if (data.success) setOrdenes(data.ordenes);
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const generarCodigo = async (item: any) => {
    try {
      const res = await fetch(API_GENERAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reparacion_orden_id: item.reparacion_orden_id })
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('Código Generado', `Se generó el código para la orden #${item.reparacion_orden_id}`);
        cargarOrdenes();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch {
      Alert.alert('Error', 'Falla de conexión.');
    }
  };

  const abrirModalEntrega = (item: any) => {
    setOrdenSeleccionada(item);
    setCodigoInput('');
    setModalVisible(true);
  };

  const abrirGoogleMaps = (item: any) => {
    const coord = obtenerCoordenadaDeItem(item);
    if (coord) {
      const urlCoord = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coord.replace(/\s+/g, ''))}`;
      Linking.openURL(urlCoord).catch(() => {
        Alert.alert('Error', 'No se pudo abrir Google Maps.');
      });
      return;
    }

    if (item.google_maps_url) {
      Linking.openURL(item.google_maps_url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir Google Maps.');
      });
      return;
    }

    const partes = [
      item.calle ? `Calle ${item.calle}` : '',
      item.manzana ? `Mz ${item.manzana}` : '',
      item.casa ? `Casa ${item.casa}` : '',
      item.barrio ? `Barrio ${item.barrio}` : '',
      'Formosa, Argentina'
    ].filter(Boolean);

    if (partes.length <= 1) {
      Alert.alert('Aviso', 'Esta orden no tiene una dirección postal detallada.');
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partes.join(', '))}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir Google Maps.');
    });
  };

  const confirmarEntregaConCodigo = async () => {
    if (!codigoInput || codigoInput.length !== 6) {
      Alert.alert('Atención', 'Ingrese el código de seguridad de 6 dígitos.');
      return;
    }

    try {
      const res = await fetch(API_ENTREGAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reparacion_orden_id: ordenSeleccionada.reparacion_orden_id,
          codigo_ingresado: codigoInput
        })
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('Éxito', json.message);
        setModalVisible(false);
        setModalDetalleVisible(false);
        cargarOrdenes();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch {
      Alert.alert('Error', 'Falla de conexión con el servidor.');
    }
  };

  const coordSeleccionada = obtenerCoordenadaDeItem(ordenSeleccionada);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control de Envío y Paquetería</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={ordenes}
          keyExtractor={(item) => item.reparacion_orden_id.toString()}
          renderItem={({ item }) => {
            const tieneCodigo = item.codigo_seguridad && item.codigo_seguridad.trim() !== '';
            const coordItem = obtenerCoordenadaDeItem(item);
            const resumenDir = [
              item.calle ? `Calle ${item.calle}` : '',
              item.manzana ? `Mz. ${item.manzana}` : '',
              item.casa ? `Casa ${item.casa}` : '',
              item.barrio ? `B° ${item.barrio}` : ''
            ].filter(Boolean).join(' · ');

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => {
                  setOrdenSeleccionada(item);
                  setModalDetalleVisible(true);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Orden #{item.reparacion_orden_id}</Text>
                  <Text style={styles.text}>Cliente: <Text style={styles.highlight}>{item.cliente_nombre} {item.cliente_apellido}</Text></Text>
                  <Text style={styles.text}>Equipo: <Text style={styles.highlight}>{item.marca} {item.modelo}</Text></Text>
                  <Text style={styles.ubicacionPreview} numberOfLines={2}>
                    📍 {resumenDir || item.direccion_entrega || 'Ver dirección de envío'}
                  </Text>
                  {coordItem ? (
                    <Text style={styles.coordPreview}>🌐 {coordItem}</Text>
                  ) : null}
                </View>

                <View style={styles.actionCol} onStartShouldSetResponder={() => true}>
                  {!tieneCodigo ? (
                    <TouchableOpacity style={styles.btnGenerar} onPress={() => generarCodigo(item)}>
                      <Text style={styles.btnTextGen}>Generar</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.badgeGenerado}>
                      <Text style={styles.badgeText}>Código OK</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.btnEntregar, !tieneCodigo && { opacity: 0.4 }]}
                    disabled={!tieneCodigo}
                    onPress={() => abrirModalEntrega(item)}
                  >
                    <Text style={styles.btnTextEntregar}>Entregar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay envíos pendientes.</Text>}
        />
      )}

      {/* MODAL 1: DETALLE Y DIRECCIÓN DE ENVÍO */}
      <Modal visible={modalDetalleVisible} transparent={true} animationType="slide" onRequestClose={() => setModalDetalleVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Detalle de Envío</Text>
              <TouchableOpacity onPress={() => setModalDetalleVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {ordenSeleccionada && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSub}>Orden #{ordenSeleccionada.reparacion_orden_id}</Text>

                <View style={styles.seccionInfo}>
                  <Text style={styles.labelInfo}>CLIENTE</Text>
                  <Text style={styles.valueInfo}>{ordenSeleccionada.cliente_nombre} {ordenSeleccionada.cliente_apellido} (DNI: {ordenSeleccionada.dni_cuit || 'S/D'})</Text>

                  <Text style={styles.labelInfo}>DISPOSITIVO</Text>
                  <Text style={styles.valueInfo}>{ordenSeleccionada.marca} {ordenSeleccionada.modelo} - Nro Serie: {ordenSeleccionada.numero_serie || 'N/A'}</Text>
                </View>

                <View style={styles.direccionCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="location" size={18} color="#2563EB" />
                    <Text style={styles.dirCardTitle}> Dirección de Destino</Text>
                  </View>
                  <Text style={styles.textDir}>Calle: <Text style={styles.highlight}>{ordenSeleccionada.calle || 'S/D'}</Text></Text>
                  <Text style={styles.textDir}>Manzana: <Text style={styles.highlight}>{ordenSeleccionada.manzana || '-'}</Text></Text>
                  <Text style={styles.textDir}>Casa: <Text style={styles.highlight}>{ordenSeleccionada.casa || '-'}</Text></Text>
                  <Text style={styles.textDir}>Barrio: <Text style={styles.highlight}>{ordenSeleccionada.barrio || 'S/D'}</Text></Text>
                  <Text style={styles.textDir}>Coordenadas: <Text style={styles.highlight}>{coordSeleccionada || 'No registradas'}</Text></Text>
                  {ordenSeleccionada.observaciones_envio ? (
                    <Text style={styles.textDir}>Observaciones: <Text style={styles.highlight}>{ordenSeleccionada.observaciones_envio}</Text></Text>
                  ) : null}

                  {/* BOTÓN ABRIR EN GOOGLE MAPS */}
                  <TouchableOpacity style={styles.btnGoogleMaps} onPress={() => abrirGoogleMaps(ordenSeleccionada)}>
                    <Ionicons name="map" size={16} color="#FFFFFF" />
                    <Text style={styles.btnGoogleMapsText}>Abrir en Google Maps</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.cerrarDetalleBtn} onPress={() => setModalDetalleVisible(false)}>
              <Text style={styles.cerrarDetalleText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CONFIRMAR ENTREGA CON CÓDIGO */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Entrega</Text>
            <Text style={styles.modalSub}>Orden #{ordenSeleccionada?.reparacion_orden_id}</Text>
            <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12, textAlign: 'center' }}>Ingrese el código de seguridad provisto al cliente.</Text>

            <TextInput
              style={styles.inputCodigo}
              placeholder="000000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={6}
              value={codigoInput}
              onChangeText={setCodigoInput}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={confirmarEntregaConCodigo}>
                <Text style={styles.saveBtnText}>Validar y Entregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F4F6FA' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 14, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  text: { color: '#475569', fontSize: 12, marginBottom: 2 },
  ubicacionPreview: { color: '#2563EB', fontSize: 11, marginTop: 4, fontWeight: '600' },
  coordPreview: { color: '#059669', fontSize: 11, marginTop: 2, fontWeight: '700' },
  highlight: { color: '#0F172A', fontWeight: '500' },
  actionCol: { gap: 6, alignItems: 'flex-end' },
  btnGenerar: { backgroundColor: '#FEF3C7', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#FDE68A' },
  btnTextGen: { color: '#D97706', fontWeight: 'bold', fontSize: 11 },
  badgeGenerado: { backgroundColor: '#F0FDF4', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#BBF7D0' },
  badgeText: { color: '#166534', fontWeight: 'bold', fontSize: 11 },
  btnEntregar: { backgroundColor: '#166534', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, shadowColor: '#166534', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  btnTextEntregar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 30, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.15, shadowRadius: 16, elevation: 5, maxHeight: '85%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  modalSub: { color: '#2563EB', fontSize: 13, marginBottom: 12, fontWeight: 'bold' },

  seccionInfo: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  labelInfo: { fontSize: 10, fontWeight: 'bold', color: '#64748B', letterSpacing: 0.5 },
  valueInfo: { fontSize: 12, color: '#0F172A', fontWeight: '600', marginBottom: 6 },

  direccionCard: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  dirCardTitle: { fontSize: 13, fontWeight: 'bold', color: '#1E40AF' },
  textDir: { color: '#334155', fontSize: 12, marginBottom: 3 },
  btnGoogleMaps: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, marginTop: 10 },
  btnGoogleMapsText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  inputCodigo: { backgroundColor: '#F8FAFC', color: '#0F172A', fontSize: 22, textAlign: 'center', letterSpacing: 6, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, marginBottom: 20 },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#E2E8F0' },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  saveBtn: { backgroundColor: '#166534', shadowColor: '#166534', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  cerrarDetalleBtn: { backgroundColor: '#E2E8F0', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  cerrarDetalleText: { color: '#475569', fontWeight: 'bold', fontSize: 12 }
});