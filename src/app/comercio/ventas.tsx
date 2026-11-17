import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Importación segura para evitar errores si expo-print no está instalado
let Print: any = null;
try {
  Print = require('expo-print');
} catch (e) {
  // Entorno sin expo-print
}

interface VentaItem {
  venta_id: number;
  fecha_solo: string;
  fecha_formateada: string;
  total: string | number;
  cliente_id: number | null;
  cliente_nombre: string;
  cliente_dni: string;
  items_detalle: string;
  forma_pago: string | null;
  tecnico_id: number | null;
  tecnico_nombre: string | null;
}

interface TecnicoItem {
  usuario_id: number;
  nombre_completo: string;
}

// Apunta correctamente a comercio/ventas.php
const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/comercio/ventas.php`;

export default function VentasComercioScreen() {
  const [ventas, setVentas] = useState<VentaItem[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [imprimiendo, setImprimiendo] = useState<boolean>(false);

  // Estados de filtros
  const [filtroDni, setFiltroDni] = useState<string>('');
  const [filtroTecnicoId, setFiltroTecnicoId] = useState<string>('todos');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState<boolean>(false);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.success) {
        setVentas(data.ventas || []);
        setTecnicos(data.tecnicos || []);
      } else {
        Alert.alert('Error', data.message || 'No se pudieron cargar las ventas.');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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

  const onChangeCalendario = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setMostrarCalendario(false);
    }
    if (selectedDate) {
      setFechaSeleccionada(selectedDate);
    }
  };

  const limpiarFiltros = () => {
    setFiltroDni('');
    setFiltroTecnicoId('todos');
    setFechaSeleccionada(null);
  };

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((item) => {
      if (fechaSeleccionada) {
        const fechaFiltroStr = formatearFechaISO(fechaSeleccionada);
        if (item.fecha_solo !== fechaFiltroStr) return false;
      }
      if (filtroDni.trim() !== '') {
        const dniItem = String(item.cliente_dni || '').toLowerCase();
        if (!dniItem.includes(filtroDni.trim().toLowerCase())) return false;
      }
      if (filtroTecnicoId !== 'todos') {
        if (String(item.tecnico_id) !== filtroTecnicoId) return false;
      }
      return true;
    });
  }, [ventas, fechaSeleccionada, filtroDni, filtroTecnicoId]);

  const totalGeneral = useMemo(() => {
    return ventasFiltradas.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  }, [ventasFiltradas]);

  const imprimirReporteHTML = async () => {
    if (ventasFiltradas.length === 0) {
      Alert.alert('Sin datos', 'No hay ventas en pantalla para imprimir.');
      return;
    }

    try {
      setImprimiendo(true);
      const tecnicoNombreFiltro =
        filtroTecnicoId === 'todos'
          ? 'Todos'
          : tecnicos.find((t) => String(t.usuario_id) === filtroTecnicoId)?.nombre_completo || 'Seleccionado';

      const filasHtml = ventasFiltradas
        .map(
          (v) => `
          <tr>
            <td>#${v.venta_id}</td>
            <td>${v.fecha_formateada}</td>
            <td><strong>${v.cliente_nombre}</strong><br/><span class="sub">DNI: ${v.cliente_dni}</span></td>
            <td>${v.items_detalle || 'Venta General'}</td>
            <td>${v.tecnico_nombre ? v.tecnico_nombre : '<span class="sub">Mostrador / Tienda</span>'}</td>
            <td>${v.forma_pago || 'N/E'}</td>
            <td class="monto">$${Number(v.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
          </tr>
        `
        )
        .join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Helvetica, Arial, sans-serif; color: #0F172A; padding: 24px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563EB; padding-bottom: 12px; margin-bottom: 18px; }
            .header h1 { margin: 0; font-size: 22px; color: #1E3A8A; }
            .header p { margin: 2px 0 0; font-size: 12px; color: #64748B; }
            .filtros-box { background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; }
            .filtros-box span { margin-right: 18px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background-color: #1E3A8A; color: #FFFFFF; text-align: left; padding: 8px; font-weight: bold; }
            td { border-bottom: 1px solid #E2E8F0; padding: 8px; vertical-align: top; }
            tr:nth-child(even) { background-color: #F8FAFC; }
            .sub { color: #64748B; font-size: 10px; }
            .monto { text-align: right; font-weight: bold; white-space: nowrap; }
            .total-container { margin-top: 20px; display: flex; justify-content: flex-end; }
            .total-box { background: #EFF6FF; border: 2px solid #2563EB; border-radius: 8px; padding: 12px 20px; text-align: right; }
            .total-label { font-size: 12px; color: #475569; text-transform: uppercase; font-weight: bold; }
            .total-valor { font-size: 20px; color: #166534; font-weight: bold; margin-top: 4px; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94A3B8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>FÉNIX LAB — Reporte de Ventas</h1>
              <p>Comprobante interno de operaciones y facturación</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Emisión:</strong> ${new Date().toLocaleString('es-AR')}</p>
              <p><strong>Registros:</strong> ${ventasFiltradas.length}</p>
            </div>
          </div>

          <div class="filtros-box">
            <span><strong>Fecha:</strong> ${fechaSeleccionada ? formatearFechaVisual(fechaSeleccionada) : 'Todas'}</span>
            <span><strong>DNI:</strong> ${filtroDni.trim() || 'Todos'}</span>
            <span><strong>Técnico:</strong> ${tecnicoNombreFiltro}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha y Hora</th>
                <th>Cliente / DNI</th>
                <th>Detalle Venta</th>
                <th>Técnico</th>
                <th>Pago</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${filasHtml}</tbody>
          </table>

          <div class="total-container">
            <div class="total-box">
              <div class="total-label">Total Recaudado (${ventasFiltradas.length} operaciones)</div>
              <div class="total-valor">$${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div class="footer">Documento generado desde Panel de Ventas — Fénix Lab</div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(htmlContent);
          win.document.close();
          win.focus();
          setTimeout(() => win.print(), 500);
        }
      } else if (Print) {
        await Print.printAsync({ html: htmlContent });
      } else {
        Alert.alert('Aviso', 'Instala expo-print para imprimir en dispositivos móviles.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el reporte de impresión.');
    } finally {
      setImprimiendo(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Panel de Ventas</Text>
          <Text style={styles.subtitle}>{ventasFiltradas.length} operaciones</Text>
        </View>
        <TouchableOpacity style={styles.btnImprimir} onPress={imprimirReporteHTML} disabled={imprimiendo}>
          <Ionicons name="print-outline" size={18} color="#FFFFFF" />
          <Text style={styles.btnImprimirText}>{imprimiendo ? 'Generando...' : 'Imprimir'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtrosCard}>
        <View style={styles.filtrosHeader}>
          <Text style={styles.filtrosTitle}>Filtros</Text>
          {(fechaSeleccionada || filtroDni !== '' || filtroTecnicoId !== 'todos') && (
            <TouchableOpacity onPress={limpiarFiltros}>
              <Text style={styles.limpiarText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtrosRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Fecha:</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={fechaSeleccionada ? formatearFechaISO(fechaSeleccionada) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    setFechaSeleccionada(new Date(y, m - 1, d));
                  } else {
                    setFechaSeleccionada(null);
                  }
                }}
                style={{ height: 40, borderRadius: 8, border: '1px solid #CBD5E1', padding: '0 10px', backgroundColor: '#F8FAFC', width: '100%' }}
              />
            ) : (
              <TouchableOpacity style={styles.dateBtn} onPress={() => setMostrarCalendario(true)}>
                <Ionicons name="calendar-outline" size={16} color="#2563EB" />
                <Text style={styles.dateBtnText}>{fechaSeleccionada ? formatearFechaVisual(fechaSeleccionada) : 'Todas'}</Text>
              </TouchableOpacity>
            )}
          </View>

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

        {mostrarCalendario && Platform.OS !== 'web' && (
          <DateTimePicker value={fechaSeleccionada || new Date()} mode="date" display="default" onChange={onChangeCalendario} />
        )}

        <Text style={styles.label}>Técnico:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={filtroTecnicoId} onValueChange={(val) => setFiltroTecnicoId(val)} style={styles.picker}>
            <Picker.Item label="Todos (Productos y Reparaciones)" value="todos" color="#0F172A" />
            {tecnicos.map((tec) => (
              <Picker.Item key={tec.usuario_id} label={tec.nombre_completo} value={String(tec.usuario_id)} color="#0F172A" />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={ventasFiltradas}
          keyExtractor={(item) => item.venta_id.toString()}
          contentContainerStyle={{ paddingBottom: 95 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargarVentas(); }} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>No se encontraron ventas con esos filtros.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.ventaCard}>
              <View style={styles.ventaHeader}>
                <Text style={styles.ventaId}>Venta #{item.venta_id}</Text>
                <Text style={styles.ventaFecha}>{item.fecha_formateada}</Text>
              </View>
              <Text style={styles.ventaDetalle}>{item.items_detalle || 'Venta registrada'}</Text>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={14} color="#475569" />
                <Text style={styles.infoText}>{item.cliente_nombre} <Text style={styles.dniTag}>(DNI: {item.cliente_dni})</Text></Text>
              </View>
              {item.tecnico_nombre && (
                <View style={styles.infoRow}>
                  <Ionicons name="construct-outline" size={14} color="#2563EB" />
                  <Text style={styles.tecnicoText}>Técnico: {item.tecnico_nombre}</Text>
                </View>
              )}
              <View style={styles.ventaFooter}>
                <View style={styles.pagoBadge}><Text style={styles.pagoBadgeText}>{item.forma_pago || 'Contado'}</Text></View>
                <Text style={styles.ventaTotal}>${Number(item.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.bottomTotalBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>TOTAL EN PANTALLA</Text>
          <Text style={styles.bottomTotalSub}>{ventasFiltradas.length} ventas</Text>
        </View>
        <Text style={styles.bottomTotalAmount}>${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 14 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B' },
  btnImprimir: { backgroundColor: '#1E3A8A', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, gap: 6 },
  btnImprimirText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
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
  picker: { height: 48, color: '#0F172A' },
  ventaCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  ventaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  ventaId: { fontSize: 13, fontWeight: 'bold', color: '#2563EB' },
  ventaFecha: { fontSize: 12, color: '#64748B' },
  ventaDetalle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  infoText: { fontSize: 12, color: '#334155' },
  dniTag: { fontWeight: '600', color: '#64748B' },
  tecnicoText: { fontSize: 12, color: '#1D4ED8', fontWeight: '600' },
  ventaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  pagoBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pagoBadgeText: { fontSize: 11, color: '#1E40AF', fontWeight: '600' },
  ventaTotal: { fontSize: 16, fontWeight: 'bold', color: '#166534' },
  emptyBox: { alignItems: 'center', marginTop: 40, gap: 8 },
  emptyText: { color: '#64748B', fontSize: 13 },
  bottomTotalBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0F172A', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#1E293B' },
  bottomTotalLabel: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },
  bottomTotalSub: { color: '#CBD5E1', fontSize: 11 },
  bottomTotalAmount: { color: '#4ADE80', fontSize: 20, fontWeight: 'bold' }
});