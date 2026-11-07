import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_PRESUPUESTO = `${process.env.EXPO_PUBLIC_API_URL}/comercio/presupuesto.php`;

export default function PresupuestoScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const ordenId = params.ordenId ? params.ordenId.toString() : '';
  const clienteNombre = params.clienteNombre ? params.clienteNombre.toString() : 'Cliente';
  const equipoInfo = params.equipoInfo ? params.equipoInfo.toString() : 'Equipo';
  const [total, setTotal] = useState(params.montoActual ? params.montoActual.toString() : '');

  const guardar = async () => {
    if (!ordenId || !total) { Alert.alert('Atención', 'Ingresá un monto válido'); return; }
    try {
      const res = await fetch(API_PRESUPUESTO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reparacion_orden_id: parseInt(ordenId), total: parseFloat(total) })
      });
      const json = await res.json();
      if (json.success) { 
        Alert.alert('Éxito', 'Presupuesto actualizado correctamente'); 
        router.back();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch { 
      Alert.alert('Error', 'Falla de conexión con el servidor'); 
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gestionar Presupuesto</Text>
      
      <View style={styles.cardInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Orden de Trabajo</Text>
          <Text style={styles.infoValue}>#{ordenId}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente</Text>
          <Text style={styles.infoValue}>{clienteNombre}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Equipo</Text>
          <Text style={styles.infoValue}>{equipoInfo}</Text>
        </View>
      </View>

      <Text style={styles.label}>Nuevo Monto Presupuestado ($)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ej: 45000" 
        placeholderTextColor="#64748B" 
        keyboardType="numeric"
        value={total} 
        onChangeText={setTotal} 
      />

      <TouchableOpacity style={styles.btn} onPress={guardar}>
        <Text style={styles.btnText}>Guardar Presupuesto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 20 },
  cardInfo: { 
    backgroundColor: '#FFFFFF', 
    padding: 18, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  infoValue: { color: '#0F172A', fontSize: 13, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  label: { color: '#64748B', marginBottom: 6, fontWeight: '600', fontSize: 13 },
  input: { backgroundColor: '#FFFFFF', color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 15 },
  btn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10, alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }
});