import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface UsuarioSimple {
  id: number;
  nombre_completo: string;
}

interface CodigoPais {
  codigo_pais_id: number;
  codigo: string;
}

interface CodigoArea {
  codigo_area_id: number;
  codigo: string;
}

interface Telefono {
  telefono_id: number;
  usuario_id: number;
  usuario_nombre?: string;
  codigo_pais_id?: number | null;
  codigo_pais_num?: string | null;
  codigo_area_id?: number | null;
  codigo_area_num?: string | null;
  numero: string;
  tipo: 'Fijo' | 'Móvil';
  estado_general_id: number;
}

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/admin/telefonos.php`;

export default function TelefonosScreen() {
  const [telefonos, setTelefonos] = useState<Telefono[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioSimple[]>([]);
  const [codigosPais, setCodigosPais] = useState<CodigoPais[]>([]);
  const [codigosArea, setCodigosArea] = useState<CodigoArea[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [codigoPaisId, setCodigoPaisId] = useState<number | null>(null);
  const [codigoAreaId, setCodigoAreaId] = useState<number | null>(null);
  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState<'Fijo' | 'Móvil'>('Móvil');

  useEffect(() => {
    obtenerTelefonos();
  }, [filtroEstado]);

  const obtenerTelefonos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?estado=${filtroEstado}`);
      const json = await response.json();
      if (json.success) {
        setTelefonos(json.data);
        if (json.usuarios) setUsuarios(json.usuarios);
        if (json.codigos_pais) setCodigosPais(json.codigos_pais);
        if (json.codigos_area) setCodigosArea(json.codigos_area);
      } else {
        Alert.alert('Error', json.message || 'No se pudieron cargar los teléfonos.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const guardarTelefono = async () => {
    if (!usuarioId) {
      Alert.alert('Atención', 'Debe seleccionar un usuario.');
      return;
    }
    if (!numero.trim()) {
      Alert.alert('Atención', 'El número de teléfono es obligatorio.');
      return;
    }

    try {
      const method = editandoId ? 'PUT' : 'POST';
      const bodyData = {
        telefono_id: editandoId,
        usuario_id: usuarioId,
        codigo_pais_id: codigoPaisId,
        codigo_area_id: codigoAreaId,
        numero: String(numero).trim(),
        tipo: tipo,
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
        obtenerTelefonos();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al guardar el teléfono.');
    }
  };

  const confirmarEliminar = (id: number, telTexto: string) => {
    Alert.alert(
      'Inhabilitar Teléfono',
      `¿Estás seguro de inhabilitar el teléfono "${telTexto}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inhabilitar',
          style: 'destructive',
          onPress: () => cambiarEstadoTelefono(id, 'DELETE'),
        },
      ]
    );
  };

  const cambiarEstadoTelefono = async (id: number, method: 'DELETE' | 'PATCH') => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, { method });
      const json = await response.json();

      if (json.success) {
        Alert.alert('Operación exitosa', json.message);
        obtenerTelefonos();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo procesar la solicitud.');
    }
  };

  const armarNumeroCompleto = (t: Telefono) => {
    const pais = t.codigo_pais_num ? `+${t.codigo_pais_num} ` : '';
    const area = t.codigo_area_num ? `(${t.codigo_area_num}) ` : '';
    return `${pais}${area}${t.numero}`.trim();
  };

  const generarPDF = async () => {
    const tituloFiltro =
      filtroEstado === 'todos'
        ? 'Todos los Teléfonos'
        : filtroEstado === 'activos'
        ? 'Teléfonos Activos'
        : 'Teléfonos Inactivos';

    const filasHtml = telefonosFiltrados
      .map(
        (t, index) => `
        <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${t.telefono_id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${t.usuario_nombre ?? 'Desconocido'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;"><b>${armarNumeroCompleto(t)}</b></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${t.tipo ?? 'Móvil'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: ${
            t.estado_general_id === 1 ? '#166534' : '#DC2626'
          }; font-weight: bold;">
            ${t.estado_general_id === 1 ? 'Activo' : 'Inactivo'}
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
          <p class="subtitle">Reporte de Teléfonos - ${tituloFiltro}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Número</th>
                <th>Tipo</th>
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
    setUsuarioId(usuarios.length > 0 ? usuarios[0].id : null);
    setCodigoPaisId(codigosPais.length > 0 ? codigosPais[0].codigo_pais_id : null);
    setCodigoAreaId(codigosArea.length > 0 ? codigosArea[0].codigo_area_id : null);
    setNumero('');
    setTipo('Móvil');
    setModalVisible(true);
  };

  const abrirModalEditar = (t: Telefono) => {
    setEditandoId(t.telefono_id);
    setUsuarioId(t.usuario_id);
    setCodigoPaisId(t.codigo_pais_id ? Number(t.codigo_pais_id) : null);
    setCodigoAreaId(t.codigo_area_id ? Number(t.codigo_area_id) : null);
    setNumero(t.numero ?? '');
    setTipo(t.tipo === 'Fijo' ? 'Fijo' : 'Móvil');
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoId(null);
  };

  const telefonosFiltrados = telefonos
    .filter((t) => {
      const query = busqueda.toLowerCase();
      const numCompleto = armarNumeroCompleto(t).toLowerCase();
      const user = (t.usuario_nombre ?? '').toLowerCase();
      const tipoTel = (t.tipo ?? '').toLowerCase();

      return numCompleto.includes(query) || user.includes(query) || tipoTel.includes(query);
    })
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
          placeholder="Buscar por usuario, número o tipo..."
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
          data={telefonosFiltrados}
          keyExtractor={(item) => item.telefono_id.toString()}
          renderItem={({ item }) => {
            const esActivo = item.estado_general_id === 1;
            const telFormateado = armarNumeroCompleto(item);

            return (
              <View style={[styles.card, !esActivo && styles.cardDisabled]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, !esActivo && styles.cardTitleDisabled]}>
                    📞 {telFormateado} {!esActivo && '(Inactivo)'}
                  </Text>
                  <Text style={styles.cardDesc}>
                    👤 {item.usuario_nombre ?? 'Usuario no asignado'}
                  </Text>
                  <Text style={styles.cardCategory}>
                    Tipo: {item.tipo ?? 'Móvil'}
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
                        onPress={() => confirmarEliminar(item.telefono_id, telFormateado)}
                      >
                        <Text style={styles.deleteBtnText}>Inhabilitar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.activateBtn}
                      onPress={() => cambiarEstadoTelefono(item.telefono_id, 'PATCH')}
                    >
                      <Text style={styles.activateBtnText}>Activar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron teléfonos registrados.</Text>
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
          <View style={[styles.modalContainer, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>
              {editandoId ? 'Editar Teléfono' : 'Nuevo Teléfono'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.labelPicker}>Usuario Asociado</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={usuarioId}
                  onValueChange={(val) => setUsuarioId(val ? Number(val) : null)}
                  style={{ color: '#0F172A', height: 50, width: '100%' }}
                  dropdownIconColor="#64748B"
                >
                  <Picker.Item label="-- Seleccionar Usuario --" value={null} color="#64748B" />
                  {usuarios.map((u) => (
                    <Picker.Item key={u.id} label={u.nombre_completo} value={u.id} color="#0F172A" />
                  ))}
                </Picker>
              </View>

              <Text style={styles.labelPicker}>
                Código de País <Text style={{ color: '#64748B', fontWeight: 'normal' }}>(Opcional)</Text>
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={codigoPaisId}
                  onValueChange={(val) => setCodigoPaisId(val ? Number(val) : null)}
                  style={{ color: '#0F172A', height: 50, width: '100%' }}
                  dropdownIconColor="#64748B"
                >
                  <Picker.Item label="-- Sin Código de País --" value={null} color="#64748B" />
                  {codigosPais.map((p) => (
                    <Picker.Item
                      key={p.codigo_pais_id}
                      label={`+${p.codigo}`}
                      value={p.codigo_pais_id}
                      color="#0F172A"
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.labelPicker}>
                Código de Área <Text style={{ color: '#64748B', fontWeight: 'normal' }}>(Opcional)</Text>
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={codigoAreaId}
                  onValueChange={(val) => setCodigoAreaId(val ? Number(val) : null)}
                  style={{ color: '#0F172A', height: 50, width: '100%' }}
                  dropdownIconColor="#64748B"
                >
                  <Picker.Item label="-- Sin Código de Área --" value={null} color="#64748B" />
                  {codigosArea.map((c) => (
                    <Picker.Item
                      key={c.codigo_area_id}
                      label={`${c.codigo}`}
                      value={c.codigo_area_id}
                      color="#0F172A"
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.labelPicker}>Número de Teléfono</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: 154123456"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={numero}
                onChangeText={setNumero}
              />

              <Text style={styles.labelPicker}>Tipo de Teléfono</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={tipo}
                  onValueChange={(val) => setTipo(val as 'Fijo' | 'Móvil')}
                  style={{ color: '#0F172A', height: 50, width: '100%' }}
                  dropdownIconColor="#64748B"
                >
                  <Picker.Item label="Móvil" value="Móvil" color="#0F172A" />
                  <Picker.Item label="Fijo" value="Fijo" color="#0F172A" />
                </Picker>
              </View>
            </ScrollView>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={cerrarModal}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={guardarTelefono}>
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
  cardCategory: { fontSize: 12, color: '#2563EB', marginTop: 2 },
  cardDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
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
  labelPicker: { fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: '600' },
  pickerWrapper: {
    backgroundColor: '#F1F4F9',
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 8,
    marginBottom: 14,
    justifyContent: 'center',
    overflow: 'hidden',
  },
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