import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BANDEJA = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/bandeja.php`;
const API_GENERAR = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/generar_codigo.php`;
const API_ENTREGAR = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/entregar_orden.php`;

export default function EnviosScreen() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [codigoInput, setCodigoInput] = useState('');

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
        cargarOrdenes();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch {
      Alert.alert('Error', 'Falla de conexión con el servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control de Envío y Entrega</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={ordenes}
          keyExtractor={(item) => item.reparacion_orden_id.toString()}
          renderItem={({ item }) => {
            const tieneCodigo = item.codigo_seguridad && item.codigo_seguridad.trim() !== '';
            return (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Orden #{item.reparacion_orden_id}</Text>
                  <Text style={styles.text}>Cliente: <Text style={styles.highlight}>{item.cliente_nombre} {item.cliente_apellido}</Text></Text>
                  <Text style={styles.text}>Equipo: <Text style={styles.highlight}>{item.marca} {item.modelo}</Text></Text>
                </View>

                <View style={styles.actionCol}>
                  {!tieneCodigo ? (
                    <TouchableOpacity style={styles.btnGenerar} onPress={() => generarCodigo(item)}>
                      <Text style={styles.btnTextGen}>Generar Código</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.badgeGenerado}>
                      <Text style={styles.badgeText}>Generado</Text>
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
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay envíos pendientes.</Text>}
        />
      )}

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Entrega</Text>
            <Text style={styles.modalSub}>Orden #{ordenSeleccionada?.reparacion_orden_id}</Text>

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
  modalContainer: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.15, shadowRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  modalSub: { color: '#2563EB', fontSize: 13, marginBottom: 15, fontWeight: 'bold' },
  inputCodigo: { backgroundColor: '#F8FAFC', color: '#0F172A', fontSize: 22, textAlign: 'center', letterSpacing: 6, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, marginBottom: 20 },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#E2E8F0' },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  saveBtn: { backgroundColor: '#166534', shadowColor: '#166534', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold' }
});