import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/fenix_lab/api_app';

export default function HistorialReparacionesAdmin() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [totalGanado, setTotalGanado] = useState(0);

  // Filtros
  const [filtroDni, setFiltroDni] = useState('');
  const [filtroServicio, setFiltroServicio] = useState('');
  
  // Rango de Fechas (Formato AAAA-MM-DD)
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/admin/historial_reparaciones.php?`;
      if (filtroDni) url += `&dni=${filtroDni}`;
      if (filtroServicio) url += `&servicio_id=${filtroServicio}`;
      if (fechaInicio && fechaFin) {
        url += `&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      }

      const res = await fetch(url);
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error("Respuesta no válida del servidor");
        return;
      }

      if (json.success) {
        setHistorial(json.historial || []);
        setTotalGanado(json.total_ganado || 0);
        if (servicios.length === 0) {
          setServicios(json.servicios || []);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const formatMoneda = (monto: number) => {
    return `$ ${Number(monto || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return 'N/D';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-AR') + ' ' + fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Reparaciones</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* PANEL DE FILTROS */}
        <View style={styles.filtersCard}>
          <Text style={styles.filterTitle}>Filtros de Búsqueda</Text>
          
          <Text style={styles.inputLabel}>Por Cliente (DNI / CUIT)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={16} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: 40123456"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={filtroDni}
              onChangeText={setFiltroDni}
            />
          </View>

          <Text style={styles.inputLabel}>Por Servicio Solicitado</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filtroServicio}
              onValueChange={setFiltroServicio}
              style={styles.picker}
            >
              <Picker.Item label="Todos los servicios..." value="" color="#64748B" />
              {servicios.map(s => (
                <Picker.Item key={s.servicios_id} label={s.nombre} value={String(s.servicios_id)} />
              ))}
            </Picker>
          </View>

          <Text style={styles.inputLabel}>Por Rango de Fechas (AAAA-MM-DD)</Text>
          <View style={styles.rowInputs}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Desde: 2026-11-01"
              placeholderTextColor="#94A3B8"
              value={fechaInicio}
              onChangeText={setFechaInicio}
            />
            <Text style={{ marginHorizontal: 8, color: '#64748B' }}>-</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Hasta: 2026-11-30"
              placeholderTextColor="#94A3B8"
              value={fechaFin}
              onChangeText={setFechaFin}
            />
          </View>

          <TouchableOpacity style={styles.btnFilter} onPress={cargarHistorial}>
            <Ionicons name="filter-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.btnFilterText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* RESUMEN DE GANANCIAS */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Ganado (Solo ingresos cobrados)</Text>
          <Text style={styles.summaryValue}>{formatMoneda(totalGanado)}</Text>
          <Text style={styles.summarySubtext}>Basado en los filtros aplicados ({historial.length} órdenes)</Text>
        </View>

        {/* LISTADO DE RESULTADOS */}
        <Text style={styles.listTitle}>Resultados de la Búsqueda</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
        ) : (
          historial.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No se encontraron reparaciones cobradas con estos filtros.</Text>
            </View>
          ) : (
            historial.map((orden, index) => (
              <View key={index} style={styles.historialCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.ordenId}>Orden #{orden.reparacion_orden_id}</Text>
                  <Text style={styles.fecha}>{formatearFecha(orden.fecha_registro)}</Text>
                </View>
                
                <Text style={styles.servicioNombre}>{orden.servicio_nombre || 'Servicio General'}</Text>
                
                <View style={styles.divider} />
                
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={14} color="#64748B" />
                  <Text style={styles.infoText}>Cliente: {orden.cliente_nombre} {orden.cliente_apellido} (DNI: {orden.cliente_dni})</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="headset" size={14} color="#64748B" />
                  <Text style={styles.infoText}>Recepción: {orden.recepcionista_nombre ? `${orden.recepcionista_nombre} ${orden.recepcionista_apellido || ''}` : 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="build" size={14} color="#64748B" />
                  <Text style={styles.infoText}>Técnico: {orden.tecnico_nombre ? `${orden.tecnico_nombre} ${orden.tecnico_apellido || ''}` : 'N/A'}</Text>
                </View>

                <View style={styles.badgeRow}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{orden.estado_orden}</Text>
                  </View>
                  <View style={styles.moneyBox}>
                    <Text style={styles.moneyLabel}>Ganancia:</Text>
                    <Text style={styles.moneyValue}>{formatMoneda(orden.pagado)}</Text>
                  </View>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  
  content: { padding: 16, paddingBottom: 40 },
  
  filtersCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  filterTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  inputLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 4, marginTop: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 44 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: '#0F172A', fontSize: 13, height: '100%' },
  pickerWrapper: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, height: 44, justifyContent: 'center' },
  picker: { color: '#0F172A', height: 44 },
  rowInputs: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btnFilter: { backgroundColor: '#2563EB', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 8, marginTop: 16 },
  btnFilterText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },

  summaryCard: { backgroundColor: '#10B981', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20, shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  summaryLabel: { color: '#D1FAE5', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  summaryValue: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', letterSpacing: 0.5 },
  summarySubtext: { color: '#A7F3D0', fontSize: 11, marginTop: 4 },

  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  
  historialCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  ordenId: { fontSize: 14, fontWeight: 'bold', color: '#2563EB' },
  fecha: { fontSize: 11, color: '#94A3B8' },
  servicioNombre: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { fontSize: 12, color: '#475569', marginLeft: 6 },
  
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
  statusBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  statusText: { fontSize: 11, color: '#334155', fontWeight: 'bold' },
  moneyBox: { alignItems: 'flex-end' },
  moneyLabel: { fontSize: 10, color: '#64748B', marginBottom: 2 },
  moneyValue: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },

  emptyBox: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { color: '#64748B', fontSize: 13, fontStyle: 'italic', textAlign: 'center' }
});