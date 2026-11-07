import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
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

interface Pais {
  pais_id: number;
  nombre: string;
}

interface CodigoPais {
  codigo_pais_id: number;
  codigo: number;
  estado_general_id?: number;
  pais_id?: number | null;
  pais_nombre?: string | null;
}

const API_URL =`${process.env.EXPO_PUBLIC_API_URL}/admin/codigo_pais.php`;
const API_PAISES_URL =`${process.env.EXPO_PUBLIC_API_URL}/admin/paises.php`;

export default function CodigoPaisScreen() {
  const [codigosPais, setCodigosPais] = useState<CodigoPais[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [codigoInput, setCodigoInput] = useState('');
  const [paisSeleccionado, setPaisSeleccionado] = useState<number | ''>('');

  useEffect(() => {
    obtenerDatos();
  }, [filtroEstado]);

  const obtenerDatos = async () => {
    try {
      setLoading(true);
      const [resCodigos, resPaises] = await Promise.all([
        fetch(`${API_URL}?estado=${filtroEstado}`),
        fetch(`${API_PAISES_URL}?estado=activos`)
      ]);

      const jsonCodigos = await resCodigos.json();
      const jsonPaises = await resPaises.json();

      if (jsonCodigos.success) {
        setCodigosPais(jsonCodigos.data);
      } else {
        Alert.alert('Error', jsonCodigos.message || 'No se pudieron cargar los códigos de país.');
      }

      if (jsonPaises.success) {
        setPaises(jsonPaises.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const guardarCodigoPais = async () => {
    if (!codigoInput.trim()) {
      Alert.alert('Atención', 'El código de país es obligatorio.');
      return;
    }

    if (!paisSeleccionado) {
      Alert.alert('Atención', 'Debes asociar el código a un país.');
      return;
    }

    try {
      const method = editandoId ? 'PUT' : 'POST';
      const bodyData = editandoId
        ? { codigo_pais_id: editandoId, codigo: codigoInput, pais_id: paisSeleccionado }
        : { codigo: codigoInput, pais_id: paisSeleccionado, estado_general_id: 1 };

      const response = await fetch(API_URL, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const json = await response.json();

      if (json.success) {
        Alert.alert('Éxito', json.message);
        cerrarModal();
        obtenerDatos();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al guardar el registro.');
    }
  };

  const confirmarEliminar = (id: number, codigo: number) => {
    Alert.alert(
      'Inhabilitar Código de País',
      `¿Estás seguro de inhabilitar el código "+${codigo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inhabilitar',
          style: 'destructive',
          onPress: () => cambiarEstadoCodigo(id, 'DELETE'),
        },
      ]
    );
  };

  const cambiarEstadoCodigo = async (id: number, method: 'DELETE' | 'PATCH') => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: method,
      });
      const json = await response.json();

      if (json.success) {
        Alert.alert('Operación exitosa', json.message);
        obtenerDatos();
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
        ? 'Todos los Códigos de País'
        : filtroEstado === 'activos'
        ? 'Códigos de País Activos'
        : 'Códigos de País Inhabilitados';

    const filasHtml = codigosFiltrados
      .map(
        (cp, index) => `
        <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${cp.codigo_pais_id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">+${cp.codigo}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${cp.pais_nombre || 'Sin asignar'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: ${
            cp.estado_general_id === 1 ? '#2e7d32' : '#c62828'
          };">
            ${cp.estado_general_id === 1 ? 'Activo' : 'Inhabilitado'}
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
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #2563EB; color: white; padding: 12px; text-align: left; font-size: 14px; }
            td { font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Taller</h1>
          <p class="subtitle">${tituloFiltro}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>País</th>
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
    setCodigoInput('');
    setPaisSeleccionado('');
    setModalVisible(true);
  };

  const abrirModalEditar = (item: CodigoPais) => {
    setEditandoId(item.codigo_pais_id);
    setCodigoInput(item.codigo.toString());
    setPaisSeleccionado(item.pais_id || '');
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoId(null);
    setCodigoInput('');
    setPaisSeleccionado('');
  };

  const codigosFiltrados = codigosPais
    .filter((cp) => cp.codigo.toString().includes(busqueda) || (cp.pais_nombre && cp.pais_nombre.toLowerCase().includes(busqueda.toLowerCase())))
    .sort((a, b) => (a.estado_general_id ?? 1) - (b.estado_general_id ?? 1));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Códigos de País (Telefónicos)</Text>

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
          placeholder="Buscar por código o país..."
          placeholderTextColor="#64748B"
          keyboardType="numeric"
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
          data={codigosFiltrados}
          keyExtractor={(item) => item.codigo_pais_id.toString()}
          renderItem={({ item }) => {
            const esActivo = item.estado_general_id === 1;
            return (
              <View style={[styles.card, !esActivo && styles.cardDisabled]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, !esActivo && styles.cardTitleDisabled]}>
                    +{item.codigo} {!esActivo && '(Inactivo)'}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    País: {item.pais_nombre || 'No asignado'}
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
                        onPress={() => confirmarEliminar(item.codigo_pais_id, item.codigo)}
                      >
                        <Text style={styles.deleteBtnText}>Eliminar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.activateBtn}
                      onPress={() => cambiarEstadoCodigo(item.codigo_pais_id, 'PATCH')}
                    >
                      <Text style={styles.activateBtnText}>Activar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron códigos de país registrados.</Text>
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
              {editandoId ? 'Editar Código de País' : 'Nuevo Código de País'}
            </Text>

            <Text style={styles.inputLabel}>Código Telefónico (Ej: 54, 1, 34)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej. 54"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={codigoInput}
              onChangeText={setCodigoInput}
            />

            <Text style={styles.inputLabel}>Seleccionar País</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={paisSeleccionado}
                onValueChange={(itemValue) => setPaisSeleccionado(itemValue)}
                style={{ color: '#0F172A' }}
                dropdownIconColor="#2563EB"
              >
                <Picker.Item label="Seleccione un país..." value="" color="#64748B" />
                {paises.map((pais) => (
                  <Picker.Item key={pais.pais_id} label={pais.nombre} value={pais.pais_id} color="#0F172A" />
                ))}
              </Picker>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={cerrarModal}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={guardarCodigoPais}
              >
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
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
  cardSubtitle: { fontSize: 13, color: '#64748B', marginTop: 3 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#E8F0FE', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6 },
  editBtnText: { color: '#2563EB', fontSize: 13, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FEE2E2', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6 },
  deleteBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  activateBtn: { backgroundColor: '#DCFCE7', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6 },
  activateBtnText: { color: '#166534', fontWeight: 'bold', fontSize: 13 },
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
    color: '#0F172A',
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: '#F1F4F9',
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
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