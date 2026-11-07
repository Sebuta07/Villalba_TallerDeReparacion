import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface TipoComprobante {
  tipo_comprobante_id: number;
  tipo_comprobante: string;
  estado_general_id: number;
}

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/admin/tipo_comprobante.php`;

export default function TipoComprobanteScreen() {
  const [tipos, setTipos] = useState<TipoComprobante[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [nombreTipo, setNombreTipo] = useState('');

  useEffect(() => {
    obtenerTipos();
  }, [filtroEstado]);

  const obtenerTipos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?estado=${filtroEstado}`);
      const json = await response.json();
      if (json.success) {
        setTipos(json.data);
      } else {
        Alert.alert('Error', json.message || 'No se pudieron cargar los tipos de comprobante.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const guardarTipo = async () => {
    if (!nombreTipo.trim()) {
      Alert.alert('Atención', 'El nombre del tipo de comprobante es obligatorio.');
      return;
    }

    try {
      const method = editandoId ? 'PUT' : 'POST';
      const bodyData = {
        tipo_comprobante_id: editandoId,
        tipo_comprobante: nombreTipo.trim(),
      };

      const response = await fetch(API_URL, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const json = await response.json();

      if (json.success) {
        Alert.alert('Éxito', json.message);
        cerrarModal();
        obtenerTipos();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al guardar el registro.');
    }
  };

  const confirmarEliminar = (id: number, nombre: string) => {
    Alert.alert(
      'Inhabilitar Tipo de Comprobante',
      `¿Estás seguro de inhabilitar "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inhabilitar',
          style: 'destructive',
          onPress: () => cambiarEstado(id, 'DELETE'),
        },
      ]
    );
  };

  const cambiarEstado = async (id: number, method: 'DELETE' | 'PATCH') => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, { method });
      const json = await response.json();

      if (json.success) {
        Alert.alert('Operación exitosa', json.message);
        obtenerTipos();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo procesar la solicitud.');
    }
  };

  const generarPDF = async () => {
    const tituloFiltro =
      filtroEstado === 'todos'
        ? 'Todos los Tipos de Comprobante'
        : filtroEstado === 'activos'
        ? 'Tipos de Comprobante Activos'
        : 'Tipos de Comprobante Inactivos';

    const filasHtml = tiposFiltrados
      .map(
        (item, index) => `
        <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${item.tipo_comprobante_id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;"><b>${item.tipo_comprobante}</b></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: ${
            item.estado_general_id === 1 ? '#166534' : '#DC2626'
          }; font-weight: bold;">
            ${item.estado_general_id === 1 ? 'Activo' : 'Inactivo'}
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; background-color: #ffffff; color: #333; }
            h1 { text-align: center; color: #2563EB; font-size: 22px; margin-bottom: 5px; }
            p.subtitle { text-align: center; color: #64748B; font-size: 14px; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th { background-color: #2563EB; color: white; padding: 12px; text-align: left; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Taller</h1>
          <p class="subtitle">Reporte - ${tituloFiltro}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo de Comprobante</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filasHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo generar el archivo PDF.');
    }
  };

  const abrirModalCrear = () => {
    setEditandoId(null);
    setNombreTipo('');
    setModalVisible(true);
  };

  const abrirModalEditar = (item: TipoComprobante) => {
    setEditandoId(item.tipo_comprobante_id);
    setNombreTipo(item.tipo_comprobante);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoId(null);
  };

  const tiposFiltrados = tipos
    .filter((item) =>
      item.tipo_comprobante.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => a.estado_general_id - b.estado_general_id);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'todos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('todos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'todos' && styles.filterBtnTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'activos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('activos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'activos' && styles.filterBtnTextActive]}>
            Activos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'inactivos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('inactivos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'inactivos' && styles.filterBtnTextActive]}>
            Inactivos
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topActionRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tipo de comprobante..."
          placeholderTextColor="#64748B"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <TouchableOpacity style={styles.addButton} onPress={abrirModalCrear}>
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tiposFiltrados}
          keyExtractor={(item) => item.tipo_comprobante_id.toString()}
          renderItem={({ item }) => {
            const esActivo = item.estado_general_id === 1;

            return (
              <View style={[styles.card, !esActivo && styles.cardDisabled]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, !esActivo && styles.cardTitleDisabled]}>
                    📄 {item.tipo_comprobante} {!esActivo && '(Inactivo)'}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  {esActivo ? (
                    <>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => abrirModalEditar(item)}
                      >
                        <Text style={styles.editBtnText}>Modificar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => confirmarEliminar(item.tipo_comprobante_id, item.tipo_comprobante)}
                      >
                        <Text style={styles.deleteBtnText}>Inhabilitar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.activateBtn}
                      onPress={() => cambiarEstado(item.tipo_comprobante_id, 'PATCH')}
                    >
                      <Text style={styles.activateBtnText}>Activar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron registros.</Text>
          }
        />
      )}

      <TouchableOpacity style={styles.fabPrintButton} onPress={generarPDF}>
        <Ionicons name="print-outline" size={26} color="#2563EB" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editandoId ? 'Editar Tipo de Comprobante' : 'Nuevo Tipo de Comprobante'}
            </Text>

            <Text style={styles.inputLabel}>Nombre del Comprobante</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Factura A, Remito, Recibo"
              placeholderTextColor="#64748B"
              value={nombreTipo}
              onChangeText={setNombreTipo}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={cerrarModal}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={guardarTipo}>
                <Text style={styles.saveBtnText}>Guardar</Text>
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
  filterContainer: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  filterBtnText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  filterBtnTextActive: { color: '#FFFFFF' },
  topActionRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: '#0F172A',
  },
  addButton: {
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardDisabled: { backgroundColor: '#F1F4F9', opacity: 0.7, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  cardTitleDisabled: { color: '#64748B', fontStyle: 'italic' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#E8F0FE', padding: 8, borderRadius: 6 },
  editBtnText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 6 },
  deleteBtnText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  activateBtn: { backgroundColor: '#DCFCE7', padding: 8, borderRadius: 6 },
  activateBtnText: { color: '#166534', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 30, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 16, 38, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  inputLabel: { fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: '600' },
  modalInput: {
    backgroundColor: '#F1F4F9',
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
    color: '#0F172A',
  },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#E2E8F0' },
  cancelBtnText: { color: '#64748B', fontWeight: '600' },
  saveBtn: { backgroundColor: '#2563EB' },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  fabPrintButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});