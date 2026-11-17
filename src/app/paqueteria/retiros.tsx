import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BANDEJA_RETIROS = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/bandeja_retiros.php`;
const API_GENERAR = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/generar_codigo.php`;
const API_CONFIRMAR_RETIRO = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/confirmar_retiro.php`;

const obtenerCoordenadaDeItem = (item: any): string | null => {
  if (!item) return null;
  if (item.coordenadas_detectadas && String(item.coordenadas_detectadas).trim() !== '') {
    return String(item.coordenadas_detectadas).trim();
  }
  const fuente = `${item.coordenadas_gps || ''} ${item.observaciones_retiro || ''} ${item.referencia_direccion || ''}`;
  const match = fuente.match(/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
  return match ? `${match[1]}, ${match[2]}` : null;
};

export default function RetirosScreen() {
  const [retiros, setRetiros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [codigoInput, setCodigoInput] = useState('');

  // Modal para ver detalles y dirección de retiro
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);

  useEffect(() => {
    cargarRetiros();
  }, []);

  const cargarRetiros = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BANDEJA_RETIROS);
      const data = await res.json();
      if (data.success) {
        setRetiros(Array.isArray(data.retiros) ? data.retiros : []);
      }
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
        Alert.alert('Código Generado', `Se generó el código de retiro para la orden #${item.reparacion_orden_id}`);
        cargarRetiros();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch {
      Alert.alert('Error', 'Falla de conexión.');
    }
  };

  const abrirModalRetiro = (item: any) => {
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

  const confirmarRetiroConCodigo = async () => {
    if (!codigoInput || codigoInput.length !== 6) {
      Alert.alert('Atención', 'Ingrese el código de seguridad de 6 dígitos.');
      return;
    }

    try {
      const res = await fetch(API_CONFIRMAR_RETIRO, {
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
        cargarRetiros();
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
      <View style={styles.headerRow}>
        <Text style={styles.title}>Retiros a Domicilio</Text>
        <TouchableOpacity onPress={cargarRetiros} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={18} color="#D97706" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D97706" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={retiros}
          keyExtractor={(item, index) => `retiro-${item.reparacion_orden_id}-${index}`}
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
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{`Orden #${item.reparacion_orden_id}`}</Text>
                    <View style={styles.retiroTag}>
                      <Text style={styles.retiroTagText}>BUSCAR EQUIPO</Text>
                    </View>
                  </View>

                  <Text style={styles.text}>
                    Cliente: <Text style={styles.highlight}>{`${item.cliente_nombre} ${item.cliente_apellido}`}</Text>
                  </Text>
                  <Text style={styles.text}>
                    Equipo: <Text style={styles.highlight}>{`${item.marca} ${item.modelo}`}</Text>
                  </Text>
                  {item.diagnostico_cliente ? (
                    <Text style={styles.fallaPreview} numberOfLines={1}>
                      {`Falla: ${item.diagnostico_cliente}`}
                    </Text>
                  ) : null}
                  <Text style={styles.ubicacionPreview} numberOfLines={2}>
                    {`📍 ${resumenDir || item.direccion_retiro || 'Ver dirección de retiro'}`}
                  </Text>
                  {coordItem ? (
                    <Text style={styles.coordPreview}>{`🌐 ${coordItem}`}</Text>
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
                    style={[styles.btnRetirar, !tieneCodigo && { opacity: 0.4 }]}
                    disabled={!tieneCodigo}
                    onPress={() => abrirModalRetiro(item)}
                  >
                    <Text style={styles.btnTextRetirar}>Retirar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay retiros pendientes por realizar.</Text>}
        />
      )}

      {/* MODAL 1: DETALLE Y PUNTO DE RETIRO */}
      <Modal visible={modalDetalleVisible} transparent={true} animationType="slide" onRequestClose={() => setModalDetalleVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Detalle de Retiro</Text>
              <TouchableOpacity onPress={() => setModalDetalleVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {ordenSeleccionada && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSub}>{`Orden #${ordenSeleccionada.reparacion_orden_id}`}</Text>

                <View style={styles.seccionInfo}>
                  <Text style={styles.labelInfo}>CLIENTE</Text>
                  <Text style={styles.valueInfo}>
                    {`${ordenSeleccionada.cliente_nombre} ${ordenSeleccionada.cliente_apellido} (DNI: ${ordenSeleccionada.dni_cuit || 'S/D'})`}
                  </Text>
                  {ordenSeleccionada.cliente_telefono ? (
                    <Text style={styles.valueInfo}>{`Teléfono: ${ordenSeleccionada.cliente_telefono}`}</Text>
                  ) : null}

                  <Text style={styles.labelInfo}>DISPOSITIVO A RETIRAR</Text>
                  <Text style={styles.valueInfo}>
                    {`${ordenSeleccionada.marca} ${ordenSeleccionada.modelo} - Nro Serie: ${ordenSeleccionada.numero_serie || 'N/A'}`}
                  </Text>

                  {ordenSeleccionada.diagnostico_cliente ? (
                    <>
                      <Text style={styles.labelInfo}>FALLA REPORTADA</Text>
                      <Text style={styles.valueInfo}>{ordenSeleccionada.diagnostico_cliente}</Text>
                    </>
                  ) : null}
                </View>

                <View style={styles.direccionCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="location" size={18} color="#D97706" />
                    <Text style={styles.dirCardTitle}> Punto de Retiro (Domicilio)</Text>
                  </View>
                  <Text style={styles.textDir}>Calle: <Text style={styles.highlight}>{ordenSeleccionada.calle || 'S/D'}</Text></Text>
                  <Text style={styles.textDir}>Manzana: <Text style={styles.highlight}>{ordenSeleccionada.manzana || '-'}</Text></Text>
                  <Text style={styles.textDir}>Casa: <Text style={styles.highlight}>{ordenSeleccionada.casa || '-'}</Text></Text>
                  <Text style={styles.textDir}>Barrio: <Text style={styles.highlight}>{ordenSeleccionada.barrio || 'S/D'}</Text></Text>
                  <Text style={styles.textDir}>Coordenadas: <Text style={styles.highlight}>{coordSeleccionada || 'No registradas'}</Text></Text>
                  {ordenSeleccionada.observaciones_retiro ? (
                    <Text style={styles.textDir}>Observaciones: <Text style={styles.highlight}>{ordenSeleccionada.observaciones_retiro}</Text></Text>
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

      {/* MODAL 2: CONFIRMAR RETIRO CON CÓDIGO DE SEGURIDAD */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Retiro de Equipo</Text>
            <Text style={styles.modalSub}>{`Orden #${ordenSeleccionada?.reparacion_orden_id}`}</Text>
            <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12, textAlign: 'center' }}>
              Solicite al cliente el código de seguridad de 6 dígitos para retirar el dispositivo.
            </Text>

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
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={confirmarRetiroConCodigo}>
                <Text style={styles.saveBtnText}>Validar y Retirar</Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  refreshBtn: { backgroundColor: '#FEF3C7', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' },

  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4, borderLeftColor: '#D97706', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  retiroTag: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  retiroTagText: { color: '#B45309', fontSize: 9, fontWeight: '800' },

  text: { color: '#475569', fontSize: 12, marginBottom: 2 },
  fallaPreview: { color: '#B45309', fontSize: 11, fontWeight: '600', marginTop: 2 },
  ubicacionPreview: { color: '#2563EB', fontSize: 11, marginTop: 4, fontWeight: '600' },
  coordPreview: { color: '#059669', fontSize: 11, marginTop: 2, fontWeight: '700' },
  highlight: { color: '#0F172A', fontWeight: '500' },
  actionCol: { gap: 6, alignItems: 'flex-end' },
  btnGenerar: { backgroundColor: '#FEF3C7', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#FDE68A' },
  btnTextGen: { color: '#D97706', fontWeight: 'bold', fontSize: 11 },
  badgeGenerado: { backgroundColor: '#F0FDF4', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#BBF7D0' },
  badgeText: { color: '#166534', fontWeight: 'bold', fontSize: 11 },
  btnRetirar: { backgroundColor: '#D97706', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, shadowColor: '#D97706', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  btnTextRetirar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 30, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.15, shadowRadius: 16, elevation: 5, maxHeight: '85%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  modalSub: { color: '#D97706', fontSize: 13, marginBottom: 12, fontWeight: 'bold' },

  seccionInfo: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  labelInfo: { fontSize: 10, fontWeight: 'bold', color: '#64748B', letterSpacing: 0.5 },
  valueInfo: { fontSize: 12, color: '#0F172A', fontWeight: '600', marginBottom: 6 },

  direccionCard: { backgroundColor: '#FFFBEB', padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
  dirCardTitle: { fontSize: 13, fontWeight: 'bold', color: '#B45309' },
  textDir: { color: '#334155', fontSize: 12, marginBottom: 3 },
  btnGoogleMaps: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, marginTop: 10 },
  btnGoogleMapsText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  inputCodigo: { backgroundColor: '#F8FAFC', color: '#0F172A', fontSize: 22, textAlign: 'center', letterSpacing: 6, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, marginBottom: 20 },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#E2E8F0' },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  saveBtn: { backgroundColor: '#D97706', shadowColor: '#D97706', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  cerrarDetalleBtn: { backgroundColor: '#E2E8F0', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  cerrarDetalleText: { color: '#475569', fontWeight: 'bold', fontSize: 12 }
});