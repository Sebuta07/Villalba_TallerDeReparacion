import * as Print from 'expo-print';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BANDEJA = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/bandeja.php`;

export default function BandejaScreen() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [filtradas, setFiltradas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BANDEJA);
      const data = await res.json();
      if (data.success) {
        setOrdenes(data.ordenes);
        setFiltradas(data.ordenes);
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (texto: string) => {
    setBusqueda(texto);
    if (!texto.trim()) {
      setFiltradas(ordenes);
      return;
    }
    const query = texto.toLowerCase();
    const res = ordenes.filter(item => {
      const cliente = `${item.cliente_nombre} ${item.cliente_apellido}`.toLowerCase();
      const dni = item.dni_cuit ? item.dni_cuit.toString() : '';
      const id = item.reparacion_orden_id ? item.reparacion_orden_id.toString() : '';
      return cliente.includes(query) || dni.includes(query) || id.includes(query);
    });
    setFiltradas(res);
  };

  const abrirCalidad = (item: any) => {
    setOrdenSeleccionada(item);
    setModalVisible(true);
  };

  const generarEImprimirEtiqueta = async () => {
    if (!ordenSeleccionada) return;

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; background-color: #ffffff; color: #333; }
            .box { border: 3px solid #2563EB; padding: 20px; border-radius: 10px; width: 400px; margin: auto; }
            h1 { text-align: center; color: #2563EB; font-size: 20px; margin-bottom: 10px; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
            .row { font-size: 14px; margin-bottom: 8px; }
            .bold { font-weight: bold; }
            .total { font-size: 16px; color: #166534; font-weight: bold; text-align: right; margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 8px; }
            .footer { text-align: center; font-size: 11px; margin-top: 15px; color: #666; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>ETIQUETA DE EMPAQUETADO</h1>
            <div class="row"><span class="bold">ORDEN:</span> #${ordenSeleccionada.reparacion_orden_id}</div>
            <div class="row"><span class="bold">CLIENTE:</span> ${ordenSeleccionada.cliente_nombre} ${ordenSeleccionada.cliente_apellido}</div>
            <div class="row"><span class="bold">DNI/CUIT:</span> ${ordenSeleccionada.dni_cuit || 'N/A'}</div>
            <div class="row"><span class="bold">EQUIPO:</span> ${ordenSeleccionada.marca} ${ordenSeleccionada.modelo}</div>
            <div class="row"><span class="bold">N° SERIE:</span> ${ordenSeleccionada.numero_serie || 'N/A'}</div>
            <div class="row"><span class="bold">DIAGNÓSTICO:</span> ${ordenSeleccionada.diagnostico_cliente || 'Reparado'}</div>
            <div class="total">TOTAL A COBRAR: $${ordenSeleccionada.presupuesto || '0.00'}</div>
            <div class="footer">Taller de Electrónica - Control de Calidad Aprobado</div>
          </div>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({ html: htmlContent });
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo generar o imprimir la etiqueta PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bandeja de Entrada - Empaquetado</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por Nombre, DNI o N° Orden..."
        placeholderTextColor="#64748B"
        value={busqueda}
        onChangeText={handleBuscar}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.reparacion_orden_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>Orden #{item.reparacion_orden_id}</Text>
                  <View style={styles.badgeState}>
                    <Text style={styles.badgeStateText}>{item.estado_or}</Text>
                  </View>
                </View>
                <Text style={styles.text}>Cliente: <Text style={styles.highlight}>{item.cliente_nombre} {item.cliente_apellido}</Text></Text>
                <Text style={styles.text}>Dispositivo: <Text style={styles.highlight}>{item.marca} {item.modelo}</Text></Text>
                <Text style={styles.text}>Total: <Text style={styles.green}>${item.presupuesto}</Text></Text>
              </View>

              <TouchableOpacity style={styles.btnCalidad} onPress={() => abrirCalidad(item)}>
                <Text style={styles.btnText}>Calidad</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron órdenes finalizadas.</Text>}
        />
      )}

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Control de Calidad Aprobado</Text>
            <Text style={styles.modalSub}>Orden #{ordenSeleccionada?.reparacion_orden_id}</Text>
            <Text style={styles.modalDesc}>El dispositivo pasó las pruebas. ¿Desea generar e imprimir la etiqueta física para la caja?</Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={generarEImprimirEtiqueta}>
                <Text style={styles.saveBtnText}>Imprimir Etiqueta</Text>
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, textAlign: 'center' },
  searchInput: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#CBD5E1', fontSize: 14, color: '#0F172A', marginBottom: 14, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  badgeState: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FDE68A' },
  badgeStateText: { color: '#D97706', fontSize: 10, fontWeight: 'bold' },
  text: { color: '#475569', fontSize: 12, marginBottom: 2 },
  highlight: { color: '#0F172A', fontWeight: '500' },
  green: { color: '#166534', fontWeight: 'bold' },
  btnCalidad: { backgroundColor: '#EFF6FF', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  btnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 30, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.15, shadowRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  modalSub: { color: '#2563EB', fontSize: 13, marginBottom: 12, fontWeight: 'bold' },
  modalDesc: { color: '#475569', fontSize: 13, marginBottom: 20, lineHeight: 18 },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#E2E8F0' },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  saveBtn: { backgroundColor: '#2563EB', shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold' }
});