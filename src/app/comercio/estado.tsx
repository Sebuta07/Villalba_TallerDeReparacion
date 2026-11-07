import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

const API_ORDENES = `${process.env.EXPO_PUBLIC_API_URL}/comercio/ordenes.php`;
const API_ESTADO = `${process.env.EXPO_PUBLIC_API_URL}/comercio/estado.php`;

export default function EstadoScreen() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [ordenId, setOrdenId] = useState<any>(null);
  const estados = [
    { id: 1, label: 'Pendiente' },
    { id: 2, label: 'En Diagnóstico / Proceso' },
    { id: 3, label: 'Reparado' },
    { id: 4, label: 'Entregado' }
  ];

  useEffect(() => {
    fetch(API_ORDENES).then(res => res.json()).then(data => { if (data.success) setOrdenes(data.ordenes); });
  }, []);

  const cambiarEstado = async (estadoId: number) => {
    if (!ordenId) { Alert.alert('Atención', 'Seleccioná una orden primero'); return; }
    try {
      const res = await fetch(API_ESTADO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reparacion_orden_id: ordenId, estados_or_id: estadoId })
      });
      const json = await res.json();
      if (json.success) { Alert.alert('Éxito', 'Estado modificado correctamente'); }
      else Alert.alert('Error', json.message);
    } catch { Alert.alert('Error', 'Falla de red'); }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Control de Estado de Equipos</Text>
      
      <Text style={styles.label}>1. Seleccionar Orden</Text>
      <ScrollView horizontal style={{ marginBottom: 20 }} showsHorizontalScrollIndicator={false}>
        {ordenes.map(item => (
          <TouchableOpacity key={item.reparacion_orden_id} style={[styles.chip, ordenId === item.reparacion_orden_id && styles.chipActive]} onPress={() => setOrdenId(item.reparacion_orden_id)}>
            <Text style={[styles.chipText, ordenId === item.reparacion_orden_id && styles.chipTextActive]}>Orden #{item.reparacion_orden_id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>2. Seleccionar Nuevo Estado</Text>
      {estados.map(st => (
        <TouchableOpacity key={st.id} style={styles.stateBtn} onPress={() => cambiarEstado(st.id)}>
          <Text style={styles.stateText}>{st.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 20 },
  label: { color: '#64748B', marginBottom: 8, fontWeight: '600', fontSize: 13 },
  chip: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { color: '#334155', fontWeight: 'bold', fontSize: 13 },
  chipTextActive: { color: '#FFFFFF' },
  stateBtn: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  stateText: { color: '#0F172A', fontWeight: 'bold', fontSize: 14 }
});