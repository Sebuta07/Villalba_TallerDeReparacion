import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CategoriaServicio {
  id: number;
  nombre: string;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  categorias_servicios_id: number;
  categoria_nombre?: string;
  costo: number;
  imagen?: string | null;
  fecha_registro?: string;
  estado_general_id?: number;
}

const API_SERVICIOS_URL = `${process.env.EXPO_PUBLIC_API_URL}/admin/servicios.php`;
const API_CATEGORIAS_URL = `${process.env.EXPO_PUBLIC_API_URL}/admin/categoria_servicios.php`;
const BASE_UPLOADS_URL = `${process.env.EXPO_PUBLIC_API_URL?.replace('/comercio', '').replace('/admin', '')}/uploads/servicios/`;

export default function ServicioScreen() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categorias, setCategorias] = useState<CategoriaServicio[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [nombreInput, setNombreInput] = useState('');
  const [descripcionInput, setDescripcionInput] = useState('');
  const [costoInput, setCostoInput] = useState('');
  const [categoriaIdInput, setCategoriaIdInput] = useState<number | null>(null);
  const [imagenUri, setImagenUri] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado]);

  const cargarDatos = async () => {
    setLoading(true);
    await Promise.all([obtenerServicios(), obtenerCategorias()]);
    setLoading(false);
  };

  const obtenerServicios = async () => {
    try {
      const response = await fetch(`${API_SERVICIOS_URL}?estado=${filtroEstado}`);
      const json = await response.json();
      if (json.success) {
        setServicios(json.data);
      } else {
        Alert.alert('Error', json.message || 'No se pudieron cargar los servicios.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
    }
  };

  const obtenerCategorias = async () => {
    try {
      const response = await fetch(`${API_CATEGORIAS_URL}?estado=activos`);
      const json = await response.json();
      if (json.success) {
        setCategorias(json.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const seleccionarImagenGaleria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Se necesitan permisos para acceder a la galería.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
      setImagenUri(resultado.assets[0].uri);
    }
  };

  const tomarFotoCamara = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Se necesitan permisos para usar la cámara.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
      setImagenUri(resultado.assets[0].uri);
    }
  };

  const enviarConXHR = (formData: FormData): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', API_SERVICIOS_URL);
      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res);
        } catch (e) {
          reject(new Error('Respuesta del servidor no válida'));
        }
      };
      xhr.onerror = () => reject(new Error('Error de conexión'));
      xhr.send(formData);
    });
  };

  const guardarServicio = async () => {
    if (!nombreInput.trim() || !costoInput.trim() || !categoriaIdInput) {
      Alert.alert('Atención', 'El nombre, la categoría y el costo son obligatorios.');
      return;
    }

    try {
      const formData = new FormData();
      if (editandoId) {
        formData.append('id', editandoId.toString());
      }
      formData.append('nombre', nombreInput.trim());
      formData.append('descripcion', descripcionInput.trim());
      formData.append('costo', costoInput.trim());
      formData.append('categorias_servicios_id', categoriaIdInput.toString());
      formData.append('estado_general_id', '1');

      if (imagenUri && !imagenUri.startsWith('http')) {
        const filename = imagenUri.split('/').pop() || 'foto.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('imagen', {
          uri: imagenUri,
          name: filename,
          type,
        } as any);
      }

      const json = await enviarConXHR(formData);

      if (json.success) {
        Alert.alert('Éxito', json.message);
        cerrarModal();
        obtenerServicios();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al guardar el servicio.');
    }
  };

  const confirmarEliminar = (id: number, nombre: string) => {
    Alert.alert(
      'Inhabilitar Servicio',
      `¿Estás seguro de inhabilitar el servicio "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inhabilitar',
          style: 'destructive',
          onPress: () => cambiarEstadoServicio(id, 'DELETE'),
        },
      ]
    );
  };

  const cambiarEstadoServicio = async (id: number, me: 'DELETE' | 'PATCH') => {
    try {
      const response = await fetch(`${API_SERVICIOS_URL}?id=${id}`, {
        method: me,
      });
      const json = await response.json();

      if (json.success) {
        Alert.alert('Operación exitosa', json.message);
        obtenerServicios();
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
        ? 'Todos los Servicios'
        : filtroEstado === 'activos'
        ? 'Servicios Activos'
        : 'Servicios Inhabilitados';

    const filasHtml = serviciosFiltrados
      .map(
        (s, index) => `
        <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${s.id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;"><b>${s.nombre}</b></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${s.categoria_nombre || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">$${Number(s.costo).toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: ${
            s.estado_general_id === 1 ? '#166534' : '#DC2626'
          }; font-weight: bold;">
            ${s.estado_general_id === 1 ? 'Activo' : 'Inhabilitado'}
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
          <p class="subtitle">${tituloFiltro}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Costo</th>
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
    setNombreInput('');
    setDescripcionInput('');
    setCostoInput('');
    setCategoriaIdInput(categorias.length > 0 ? categorias[0].id : null);
    setImagenUri(null);
    setModalVisible(true);
  };

  const abrirModalEditar = (servicio: Servicio) => {
    setEditandoId(servicio.id);
    setNombreInput(servicio.nombre);
    setDescripcionInput(servicio.descripcion || '');
    setCostoInput(String(servicio.costo));
    setCategoriaIdInput(servicio.categorias_servicios_id);
    setImagenUri(servicio.imagen ? `${BASE_UPLOADS_URL}${servicio.imagen}` : null);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoId(null);
    setNombreInput('');
    setDescripcionInput('');
    setCostoInput('');
    setCategoriaIdInput(null);
    setImagenUri(null);
  };

  const serviciosFiltrados = servicios
    .filter((s) => s.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => (a.estado_general_id ?? 1) - (b.estado_general_id ?? 1));

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
          placeholder="Buscar servicio..."
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
          data={serviciosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const esActivo = item.estado_general_id === 1;
            return (
              <View style={[styles.card, !esActivo && styles.cardDisabled]}>
                {item.imagen ? (
                  <Image source={{ uri: `${BASE_UPLOADS_URL}${item.imagen}` }} style={styles.cardImage} />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <Ionicons name="image-outline" size={24} color="#94A3B8" />
                  </View>
                )}

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.cardTitle, !esActivo && styles.cardTitleDisabled]}>
                    {item.nombre} {!esActivo && '(Inactivo)'}
                  </Text>
                  <Text style={styles.cardCategory}>
                    Categoría: {item.categoria_nombre || 'Sin categoría'}
                  </Text>
                  {item.descripcion ? (
                    <Text style={styles.cardDesc}>{item.descripcion}</Text>
                  ) : null}
                  <Text style={styles.cardCost}>Costo: ${Number(item.costo).toFixed(2)}</Text>
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
                        onPress={() => confirmarEliminar(item.id, item.nombre)}
                      >
                        <Text style={styles.deleteBtnText}>Inhabilitar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.activateBtn}
                      onPress={() => cambiarEstadoServicio(item.id, 'PATCH')}
                    >
                      <Text style={styles.activateBtnText}>Activar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron servicios registrados.</Text>
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
          <View style={[styles.modalContainer, { maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editandoId ? 'Editar Servicio' : 'Nuevo Servicio'}
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Nombre del servicio"
                placeholderTextColor="#64748B"
                value={nombreInput}
                onChangeText={setNombreInput}
              />

              <Text style={styles.labelPicker}>Categoría de Servicio:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={categoriaIdInput}
                  onValueChange={(itemValue) => setCategoriaIdInput(itemValue)}
                  dropdownIconColor="#64748B"
                  style={{ color: '#0F172A' }}
                >
                  <Picker.Item label="Seleccione categoría..." value={null} color="#0F172A" />
                  {categorias.map((c) => (
                    <Picker.Item key={c.id} label={c.nombre} value={c.id} color="#0F172A" />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Costo ($)"
                placeholderTextColor="#64748B"
                value={costoInput}
                onChangeText={setCostoInput}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Descripción (opcional)"
                placeholderTextColor="#64748B"
                value={descripcionInput}
                onChangeText={setDescripcionInput}
                multiline={true}
              />

              <Text style={styles.labelPicker}>Imagen del Servicio:</Text>
              <View style={styles.imageButtonsRow}>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={seleccionarImagenGaleria}>
                  <Text style={styles.imagePickerBtnText}>Galería</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={tomarFotoCamara}>
                  <Text style={styles.imagePickerBtnText}>Cámara</Text>
                </TouchableOpacity>
              </View>

              {imagenUri && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imagenUri }} style={styles.previewImage} />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={cerrarModal}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={guardarServicio}
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
    padding: 12,
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
  cardImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#E2E8F0' },
  cardImagePlaceholder: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#F1F4F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  cardTitleDisabled: { color: '#64748B', fontStyle: 'italic' },
  cardCategory: { fontSize: 12, color: '#2563EB', marginTop: 2 },
  cardDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardCost: { fontSize: 13, fontWeight: 'bold', color: '#166534', marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: '#E8F0FE', padding: 8, borderRadius: 6 },
  editBtnText: { fontSize: 11, color: '#2563EB', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 6 },
  deleteBtnText: { fontSize: 11, color: '#DC2626', fontWeight: '600' },
  activateBtn: { backgroundColor: '#DCFCE7', padding: 8, borderRadius: 6 },
  activateBtnText: { color: '#166534', fontWeight: 'bold', fontSize: 11 },
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
  imageButtonsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  imagePickerBtn: { flex: 1, backgroundColor: '#E8F0FE', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  imagePickerBtnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 13 },
  previewContainer: { alignItems: 'center', marginBottom: 14 },
  previewImage: { width: 100, height: 100, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
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