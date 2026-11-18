import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/fenix_lab/api_app';

export default function HistorialProductosAdmin() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);

  // Filtros
  const [filtroDni, setFiltroDni] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');
  
  // Fechas (Calendario nativo o input HTML en Web)
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [mostrarCalInicio, setMostrarCalInicio] = useState(false);
  const [mostrarCalFin, setMostrarCalFin] = useState(false);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/admin/historial_productos.php?`;
      if (filtroDni) url += `&dni=${filtroDni}`;
      if (filtroProducto) url += `&producto_id=${filtroProducto}`;
      if (fechaInicio) url += `&fecha_inicio=${formatearFechaISO(fechaInicio)}`;
      if (fechaFin) url += `&fecha_fin=${formatearFechaISO(fechaFin)}`;

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
        if (productos.length === 0) {
          setProductos(json.productos || []);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [fechaInicio, fechaFin, filtroProducto]);

  const formatearFechaISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatearFechaVisual = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const formatMoneda = (monto: number) => {
    return `$ ${Number(monto || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatearFechaAPI = (fechaStr: string) => {
    if (!fechaStr) return 'N/D';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-AR') + ' ' + fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const limpiarFiltros = () => {
    setFiltroDni('');
    setFiltroProducto('');
    setFechaInicio(null);
    setFechaFin(null);
    setTimeout(() => {
      cargarHistorial();
    }, 100);
  };

  const historialFiltrado = useMemo(() => {
    if (!filtroDni) return historial;
    return historial.filter(h => String(h.cliente_dni || '').toLowerCase().includes(filtroDni.toLowerCase()));
  }, [historial, filtroDni]);

  const totalGeneral = useMemo(() => {
    return historialFiltrado.reduce((acc, v) => acc + (Number(v.subtotal) || 0), 0);
  }, [historialFiltrado]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Productos</Text>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.title}>Auditoría de Ventas</Text>
            <Text style={styles.subtitle}>{historialFiltrado.length} productos vendidos</Text>
          </View>
        </View>

        <View style={styles.filtrosCard}>
          <View style={styles.filtrosHeader}>
            <Text style={styles.filtrosTitle}>Filtros Avanzados</Text>
            {(fechaInicio || fechaFin || filtroDni !== '' || filtroProducto !== '') && (
              <TouchableOpacity onPress={limpiarFiltros}>
                <Text style={styles.limpiarText}>Limpiar Todo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filtrosRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Desde:</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={fechaInicio ? formatearFechaISO(fechaInicio) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      setFechaInicio(new Date(y, m - 1, d));
                    } else {
                      setFechaInicio(null);
                    }
                  }}
                  style={{ height: 40, borderRadius: 8, border: '1px solid #CBD5E1', padding: '0 10px', backgroundColor: '#F8FAFC', width: '100%', outline: 'none' }}
                />
              ) : (
                <TouchableOpacity style={styles.dateBtn} onPress={() => setMostrarCalInicio(true)}>
                  <Ionicons name="calendar-outline" size={16} color="#2563EB" />
                  <Text style={styles.dateBtnText}>{fechaInicio ? formatearFechaVisual(fechaInicio) : 'Todas'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Hasta:</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={fechaFin ? formatearFechaISO(fechaFin) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      setFechaFin(new Date(y, m - 1, d));
                    } else {
                      setFechaFin(null);
                    }
                  }}
                  style={{ height: 40, borderRadius: 8, border: '1px solid #CBD5E1', padding: '0 10px', backgroundColor: '#F8FAFC', width: '100%', outline: 'none' }}
                />
              ) : (
                <TouchableOpacity style={styles.dateBtn} onPress={() => setMostrarCalFin(true)}>
                  <Ionicons name="calendar-outline" size={16} color="#2563EB" />
                  <Text style={styles.dateBtnText}>{fechaFin ? formatearFechaVisual(fechaFin) : 'Todas'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {mostrarCalInicio && Platform.OS !== 'web' && (
            <DateTimePicker 
              value={fechaInicio || new Date()} 
              mode="date" 
              display="default" 
              onChange={(e, date) => {
                if (Platform.OS === 'android') setMostrarCalInicio(false);
                if (date) setFechaInicio(date);
              }} 
            />
          )}

          {mostrarCalFin && Platform.OS !== 'web' && (
            <DateTimePicker 
              value={fechaFin || new Date()} 
              mode="date" 
              display="default" 
              onChange={(e, date) => {
                if (Platform.OS === 'android') setMostrarCalFin(false);
                if (date) setFechaFin(date);
              }} 
            />
          )}

          <View style={styles.filtrosRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>DNI del Cliente:</Text>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="card-outline" size={16} color="#64748B" />
                <TextInput
                  style={styles.inputDni}
                  placeholder="Ej: 48123456"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={filtroDni}
                  onChangeText={setFiltroDni}
                />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Producto Específico:</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={filtroProducto} onValueChange={(val) => setFiltroProducto(val)} style={styles.picker}>
              <Picker.Item label="Todos los productos..." value="" color="#0F172A" />
              {productos.map((p) => (
                <Picker.Item key={p.productos_id} label={p.nombre} value={String(p.productos_id)} color="#0F172A" />
              ))}
            </Picker>
          </View>
        </View>

        {loading && historial.length === 0 ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={historialFiltrado}
            keyExtractor={(item, index) => `${item.venta_id}-${index}`}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargarHistorial(); }} />}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="cart-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyText}>No se encontraron productos vendidos con esos filtros.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.ventaCard}>
                <View style={styles.ventaHeader}>
                  <Text style={styles.ventaId}>Venta #{item.venta_id}</Text>
                  <Text style={styles.ventaFecha}>{formatearFechaAPI(item.fecha_venta)}</Text>
                </View>
                
                <Text style={styles.ventaDetalle}>{item.producto_nombre}</Text>
                
                <View style={styles.detailsBox}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailDot}>•</Text>
                    <Text style={styles.detailText}>
                      <Text style={{fontWeight: 'bold'}}>Cantidad Vendida:</Text> {item.cantidad} unidades
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={14} color="#475569" />
                  <Text style={styles.infoText}>{item.cliente_nombre} {item.cliente_apellido || ''} <Text style={styles.dniTag}>(DNI: {item.cliente_dni || 'N/D'})</Text></Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="briefcase-outline" size={14} color="#475569" />
                  <Text style={styles.infoText}>Vendedor: {item.empleado_nombre ? `${item.empleado_nombre} ${item.empleado_apellido || ''}` : 'Tienda Web'}</Text>
                </View>
                
                <View style={styles.ventaFooter}>
                  <View style={styles.pagoBadge}><Text style={styles.pagoBadgeText}>{item.forma_pago || 'N/D'}</Text></View>
                  <View style={styles.moneyBox}>
                    <Text style={styles.moneyLabel}>Subtotal:</Text>
                    <Text style={styles.ventaTotal}>{formatMoneda(item.subtotal)}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.bottomTotalBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>TOTAL DE PRODUCTOS</Text>
          <Text style={styles.bottomTotalSub}>{historialFiltrado.length} items despachados</Text>
        </View>
        <Text style={styles.bottomTotalAmount}>{formatMoneda(totalGeneral)}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  
  contentWrapper: { flex: 1, padding: 14 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B' },
  
  filtrosCard: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  filtrosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  filtrosTitle: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  limpiarText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  filtrosRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  label: { fontSize: 11, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, height: 40, gap: 6 },
  dateBtnText: { fontSize: 12, color: '#0F172A', fontWeight: '500' },
  inputIconWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, height: 40, gap: 6 },
  inputDni: { flex: 1, fontSize: 13, color: '#0F172A' },
  pickerContainer: { backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', overflow: 'hidden' },
  picker: { height: 48, color: '#0F172A', outline: 'none' as any },
  
  ventaCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  ventaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  ventaId: { fontSize: 13, fontWeight: 'bold', color: '#2563EB' },
  ventaFecha: { fontSize: 12, color: '#64748B' },
  ventaDetalle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  
  detailsBox: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  detailDot: { fontSize: 12, color: '#94A3B8', marginRight: 6, marginTop: 1 },
  detailText: { fontSize: 11, color: '#475569', flex: 1, lineHeight: 16 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  infoText: { fontSize: 12, color: '#334155' },
  dniTag: { fontWeight: '600', color: '#64748B' },
  tecnicoText: { fontSize: 12, color: '#1D4ED8', fontWeight: '600' },
  
  ventaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  pagoBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' },
  pagoBadgeText: { fontSize: 11, color: '#1E40AF', fontWeight: 'bold' },
  moneyBox: { alignItems: 'flex-end' },
  moneyLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  ventaTotal: { fontSize: 16, fontWeight: 'bold', color: '#166534' },
  
  emptyBox: { alignItems: 'center', marginTop: 40, gap: 8 },
  emptyText: { color: '#64748B', fontSize: 13 },
  
  bottomTotalBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0F172A', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#1E293B' },
  bottomTotalLabel: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },
  bottomTotalSub: { color: '#CBD5E1', fontSize: 11 },
  bottomTotalAmount: { color: '#4ADE80', fontSize: 20, fontWeight: 'bold' }
});