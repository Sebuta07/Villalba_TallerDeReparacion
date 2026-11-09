import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';
const API_EVALUAR = `${API_BASE}/tecnico/evaluar_orden.php`;
const UPLOAD_URL = API_BASE.replace('/tecnico', '').replace('/api_app', '/api_app/uploads/orden/');

export default function EvaluarOrdenScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const tecnicoId = params.usuarioId ? Number(params.usuarioId) : 9;

  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  
  const [diagnostico, setDiagnostico] = useState('');
  const [total, setTotal] = useState('');
  const [montoSeña, setMontoSeña] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [modalSelectorVisible, setModalSelectorVisible] = useState(false);
  const [itemExpandido, setItemExpandido] = useState<any>(null);

  useEffect(() => {
    cargarOrdenesPendientes();
  }, [tecnicoId]);

  const cargarOrdenesPendientes = async () => {
    try {
      setFetching(true);
      const res = await fetch(`${API_EVALUAR}?tecnico_id=${tecnicoId}`);
      const json = await res.json();
      if (json.success && json.ordenes) {
        setOrdenes(json.ordenes);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudieron conectar las órdenes de taller');
    } finally {
      setFetching(false);
    }
  };

  const enviarEvaluacion = async () => {
    if (!ordenSeleccionada) {
      Alert.alert('Atención', 'Debes seleccionar un equipo a evaluar.');
      return;
    }
    if (!diagnostico.trim()) {
      Alert.alert('Atención', 'Ingresa el informe técnico de diagnóstico.');
      return;
    }
    if (!total.trim() || isNaN(Number(total))) {
      Alert.alert('Atención', 'Ingresa un presupuesto total válido.');
      return;
    }
    if (!montoSeña.trim() || isNaN(Number(montoSeña))) {
      Alert.alert('Atención', 'Ingresa el monto de la seña requerida.');
      return;
    }

    if (Number(montoSeña) > Number(total)) {
      Alert.alert('Atención', 'La seña no puede superar el presupuesto total.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_EVALUAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reparacion_orden_id: ordenSeleccionada.reparacion_orden_id,
          diagnostico,
          total: parseFloat(total),
          monto_seña: parseFloat(montoSeña)
        }),
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('¡Éxito!', 'Diagnóstico y presupuesto guardados correctamente.');
        router.back();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Falla de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#2563EB" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Evaluación de Taller</Text>
          <Text style={styles.headerSubtitle}>Diagnóstico, Presupuesto y Seña</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SELECTOR DE ORDEN */}
        <Text style={styles.label}>ORDEN DE TRABAJO PENDIENTE</Text>
        <TouchableOpacity
          style={styles.selectorCard}
          onPress={() => setModalSelectorVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.selectorIconBox}>
            <Ionicons name="hardware-chip-outline" size={22} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectorMainText}>
              {ordenSeleccionada
                ? `${ordenSeleccionada.cliente_nombre} ${ordenSeleccionada.cliente_apellido}`
                : 'Toca para seleccionar equipo'}
            </Text>
            <Text style={styles.selectorSubText} numberOfLines={1}>
              {ordenSeleccionada
                ? `🔧 ${ordenSeleccionada.marca_nombre || ''} ${ordenSeleccionada.modelo_nombre || 'Dispositivo'} — ${ordenSeleccionada.servicio_nombre || 'Servicio'}`
                : `${ordenes.length} equipos pendientes en cola`}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </TouchableOpacity>

        {/* DETALLE DEL PROBLEMA REPORTADO */}
        {ordenSeleccionada && (
          <View style={styles.issueCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="alert-circle-outline" size={16} color="#D97706" />
              <Text style={styles.issueTitle}> Falla reportada por el cliente</Text>
            </View>
            <Text style={styles.issueText}>
              {ordenSeleccionada.diagnostico_cliente || 'Sin descripción preliminar'}
            </Text>
          </View>
        )}

        {/* CAMPO DE DIAGNÓSTICO TÉCNICO */}
        <Text style={styles.label}>INFORME TÉCNICO DE DIAGNÓSTICO</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describa el análisis técnico, componentes dañados y solución..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={5}
          value={diagnostico}
          onChangeText={setDiagnostico}
        />

        {/* FILA DE MONTOS */}
        <View style={styles.rowInputs}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>TOTAL ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="50000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={total}
              onChangeText={setTotal}
            />
          </View>
          <View style={{ width: 14 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>SEÑA INICIAL ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="15000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={montoSeña}
              onChangeText={setMontoSeña}
            />
          </View>
        </View>

        {/* BOTÓN DE ACCIÓN */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={enviarEvaluacion}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFF" />
              <Text style={styles.submitBtnText}>GUARDAR DIAGNÓSTICO Y PRESUPUESTO</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL 1: LISTADO DESLIZABLE DE DISPOSITIVOS PENDIENTES */}
      <Modal visible={modalSelectorVisible} animationType="slide" transparent={true} onRequestClose={() => setModalSelectorVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Equipos Pendientes</Text>
            <Text style={styles.sheetSub}>Selecciona un equipo para ver detalles o agregarlo</Text>

            {fetching ? (
              <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 30 }} />
            ) : ordenes.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Ionicons name="folder-open-outline" size={48} color="#64748B" />
                <Text style={{ color: '#64748B', marginTop: 10, fontSize: 13 }}>No hay órdenes pendientes</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {ordenes.map((item) => (
                  <TouchableOpacity
                    key={item.reparacion_orden_id}
                    style={styles.modalItemCard}
                    onPress={() => setItemExpandido(item)}
                  >
                    {item.imagen ? (
                      <Image source={{ uri: `${UPLOAD_URL}${item.imagen}` }} style={styles.modalThumb} />
                    ) : (
                      <View style={[styles.modalThumb, styles.noThumb]}>
                        <Ionicons name="phone-portrait-outline" size={18} color="#94A3B8" />
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.modalClientName}>{item.cliente_nombre} {item.cliente_apellido}</Text>
                      <Text style={styles.modalDeviceText}>🔧 {item.marca_nombre || ''} {item.modelo_nombre || 'Dispositivo'}</Text>
                      <Text style={styles.modalServiceText}>📦 {item.servicio_nombre || 'Servicio General'}</Text>
                    </View>
                    <Ionicons name="expand-outline" size={16} color="#2563EB" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalSelectorVisible(false)}>
              <Text style={styles.closeModalText}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: VENTANITA DESLIZABLE AMPLIADA */}
      <Modal visible={itemExpandido !== null} animationType="fade" transparent={true} onRequestClose={() => setItemExpandido(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.expandedCard}>
            <View style={styles.sheetHandle} />
            <Text style={styles.expandedTitle}>Detalle del Dispositivo</Text>
            
            {itemExpandido && (
              <View style={styles.expandedContentBox}>
                {itemExpandido.imagen ? (
                  <Image source={{ uri: `${UPLOAD_URL}${itemExpandido.imagen}` }} style={styles.expandedImage} resizeMode="cover" />
                ) : null}
                <Text style={styles.expandedLabel}>Orden Nº: <Text style={styles.expandedValue}>#{itemExpandido.reparacion_orden_id}</Text></Text>
                <Text style={styles.expandedLabel}>Cliente: <Text style={styles.expandedValue}>{itemExpandido.cliente_nombre} {itemExpandido.cliente_apellido}</Text></Text>
                <Text style={styles.expandedLabel}>Dispositivo: <Text style={styles.expandedValue}>{itemExpandido.marca_nombre} {itemExpandido.modelo_nombre}</Text></Text>
                <Text style={styles.expandedLabel}>Servicio: <Text style={styles.expandedValue}>{itemExpandido.servicio_nombre}</Text></Text>
                <Text style={styles.expandedLabel}>Problema Reportado:</Text>
                <Text style={styles.expandedProblem}>{itemExpandido.diagnostico_cliente || 'Sin observaciones'}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.agregarFormBtn}
              onPress={() => {
                setOrdenSeleccionada(itemExpandido);
                setDiagnostico(itemExpandido.diagnostico_cliente || '');
                setItemExpandido(null);
                setModalSelectorVisible(false);
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFF" />
              <Text style={styles.agregarFormText}>SELECCIONAR Y AGREGAR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setItemExpandido(null)}>
              <Text style={styles.closeModalText}>VOLVER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  backBtn: { backgroundColor: '#EFF6FF', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#BFDBFE' },
  headerTitle: { color: '#0F172A', fontSize: 17, fontWeight: '800' },
  headerSubtitle: { color: '#64748B', fontSize: 11, marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  label: { color: '#475569', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6, marginTop: 14 },
  selectorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#CBD5E1', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  selectorIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  selectorMainText: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  selectorSubText: { color: '#64748B', fontSize: 12, marginTop: 2 },
  issueCard: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#FDE68A' },
  issueTitle: { color: '#B45309', fontSize: 12, fontWeight: '700' },
  issueText: { color: '#78350F', fontSize: 12, marginTop: 4, lineHeight: 17 },
  textArea: { backgroundColor: '#FFFFFF', color: '#0F172A', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#CBD5E1', textAlignVertical: 'top', height: 120, fontSize: 13 },
  rowInputs: { flexDirection: 'row' },
  input: { backgroundColor: '#FFFFFF', color: '#0F172A', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#CBD5E1', fontSize: 15, fontWeight: '700' },
  submitBtn: { backgroundColor: '#2563EB', flexDirection: 'row', gap: 8, paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 24, shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%', borderWidth: 1, borderColor: '#E2E8F0' },
  expandedCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  sheetSub: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 2, marginBottom: 16 },
  expandedTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  expandedContentBox: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  expandedImage: { width: '100%', height: 150, borderRadius: 8, marginBottom: 10, backgroundColor: '#E2E8F0' },
  expandedLabel: { color: '#64748B', fontSize: 12, marginBottom: 4, fontWeight: '600' },
  expandedValue: { color: '#0F172A', fontWeight: '700' },
  expandedProblem: { color: '#334155', fontSize: 13, marginTop: 2, fontStyle: 'italic' },
  modalItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  modalThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#E2E8F0' },
  noThumb: { justifyContent: 'center', alignItems: 'center' },
  modalClientName: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
  modalDeviceText: { color: '#475569', fontSize: 11, marginTop: 1 },
  modalServiceText: { color: '#2563EB', fontSize: 11, marginTop: 1, fontWeight: '600' },
  agregarFormBtn: { backgroundColor: '#10B981', flexDirection: 'row', gap: 6, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  agregarFormText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  closeModalBtn: { backgroundColor: '#F1F5F9', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  closeModalText: { color: '#475569', fontSize: 12, fontWeight: '700' }
});