import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_ORDENES = `${process.env.EXPO_PUBLIC_API_URL}/tecnico/obtener_ordenes.php`;
const API_PRESUPUESTO = `${process.env.EXPO_PUBLIC_API_URL}/tecnico/presupuesto.php`;

export default function PresupuestoScreen() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    try {
      const res = await fetch(API_ORDENES);
      const json = await res.json();
      if (json.success) setOrdenes(json.ordenes);
    } catch (e) {
      Alert.alert('Error', 'No se cargaron las órdenes');
    }
  };

  const enviarPresupuesto = async () => {
    if (!ordenSeleccionada) {
      Alert.alert('Atención', 'Seleccioná la orden del cliente.');
      return;
    }
    if (!monto.trim()) {
      Alert.alert('Atención', 'Ingresá el valor del presupuesto.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_PRESUPUESTO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reparacion_orden_id: ordenSeleccionada.reparacion_orden_id,
          monto: parseFloat(monto)
        }),
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('¡Éxito!', 'Monto registrado correctamente en la orden.');
        router.back();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Error de red al conectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Carga de Presupuesto</Text>

      <Text style={styles.label}>Seleccionar Cliente y Equipo</Text>
      <TouchableOpacity style={styles.selectBtn} onPress={() => setSelectorVisible(!selectorVisible)}>
        <Text style={styles.selectBtnText}>
          {ordenSeleccionada
            ? `${ordenSeleccionada.cliente_nombre} ${ordenSeleccionada.cliente_apellido} — ${ordenSeleccionada.marca_nombre || ''} ${ordenSeleccionada.modelo_nombre || 'Equipo'}`
            : 'Seleccionar orden de trabajo'}
        </Text>
      </TouchableOpacity>

      {selectorVisible && (
        <View style={styles.modalList}>
          {ordenes.map((item) => (
            <TouchableOpacity
              key={item.reparacion_orden_id}
              style={styles.modalItem}
              onPress={() => {
                setOrdenSeleccionada(item);
                setMonto(item.presupuesto ? item.presupuesto.toString() : '');
                setSelectorVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>
                {item.cliente_nombre} {item.cliente_apellido} — {item.marca_nombre} {item.modelo_nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>Monto Presupuestado ($)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 45000"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={monto}
        onChangeText={setMonto}
      />

      <TouchableOpacity style={styles.btn} onPress={enviarPresupuesto} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Guardar Presupuesto</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F6FA' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 20 },
  label: { color: '#64748B', marginBottom: 6, fontWeight: '600', fontSize: 13 },
  selectBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 14, marginBottom: 15 },
  selectBtnText: { color: '#0F172A', fontSize: 14, fontWeight: '500' },
  modalList: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, marginBottom: 15, maxHeight: 200, elevation: 2 },
  modalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalItemText: { color: '#334155', fontSize: 13 },
  input: { backgroundColor: '#FFFFFF', color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 15 },
  btn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10, alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }
});