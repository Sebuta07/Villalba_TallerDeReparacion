import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
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

interface Producto {
  productos_id: number;
  nombre: string;
  descripcion?: string;
  categoria_productos_id?: number | null;
  marca_id?: number | null;
  modelo_id?: number | null;
  codigo_producto_id?: number | null;
  categoria_nombre?: string;
  marca_nombre?: string;
  modelo_nombre?: string;
  codigo_nombre?: string;
  precio_venta: number | string;
  stock_disponible?: number | string;
  stock_minimo?: number | string;
  garantia?: number | string;
  observaciones?: string;
  imagen?: string | null;
  estado_general_id: number;
}

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/admin/productos.php`;

// URL base para obtener las imágenes desde la carpeta uploads del servidor
const BASE_UPLOADS_URL = `${process.env.EXPO_PUBLIC_API_URL?.replace('/comercio', '').replace('/admin', '')}/uploads/productos/`;

export default function AdminProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [codigos, setCodigos] = useState<any[]>([]);
  
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('5');
  const [garantia, setGarantia] = useState('0');
  const [observaciones, setObservaciones] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [marcaId, setMarcaId] = useState<number | null>(null);
  const [modeloId, setModeloId] = useState<number | null>(null);
  const [codigoId, setCodigoId] = useState<number | null>(null);
  const [imagenUri, setImagenUri] = useState<string | null>(null);

  useEffect(() => {
    obtenerProductos();
  }, [filtroEstado]);

  const obtenerProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?estado=${filtroEstado}`);
      const json = await response.json();
      if (json.success) {
        setProductos(json.data);
        if (json.listas) {
          if (json.listas.categorias) setCategorias(json.listas.categorias);
          if (json.listas.marcas) setMarcas(json.listas.marcas);
          if (json.listas.modelos) setModelos(json.listas.modelos);
          if (json.listas.codigos) setCodigos(json.listas.codigos);
        }
      } else {
        Alert.alert('Error', json.message || 'No se pudieron cargar los productos.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
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

  const subirProductoConReq = (formData: FormData): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', API_URL);
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

  const guardarProducto = async () => {
    if (!nombre.trim() || !precioVenta.trim()) {
      Alert.alert('Atención', 'El nombre y el precio de venta son obligatorios.');
      return;
    }

    try {
      const formData = new FormData();
      if (editandoId) {
        formData.append('id', editandoId.toString());
      }
      formData.append('nombre', nombre.trim());
      formData.append('descripcion', descripcion.trim());
      formData.append('precio_venta', precioVenta.trim());
      formData.append('stock_disponible', stock.trim() ? stock.trim() : '0');
      formData.append('stock_minimo', stockMinimo.trim() ? stockMinimo.trim() : '5');
      formData.append('garantia', garantia.trim() ? garantia.trim() : '0');
      formData.append('observaciones', observaciones.trim());

      if (categoriaId) formData.append('categoria_productos_id', categoriaId.toString());
      if (marcaId) formData.append('marca_id', marcaId.toString());
      if (modeloId) formData.append('modelo_id', modeloId.toString());
      if (codigoId) formData.append('codigo_producto_id', codigoId.toString());

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

      const json = await subirProductoConReq(formData);

      if (json.success) {
        Alert.alert('Éxito', json.message);
        cerrarModal();
        obtenerProductos();
      } else {
        Alert.alert('Error', json.message || 'No se pudo guardar el producto.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al guardar el producto.');
    }
  };

  const cambiarEstadoProducto = async (id: number, activar: boolean) => {
    try {
      const method = activar ? 'PATCH' : 'DELETE';
      const response = await fetch(`${API_URL}?id=${id}`, { method });
      const json = await response.json();

      if (json.success) {
        Alert.alert('Operación exitosa', json.message);
        obtenerProductos();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo procesar la solicitud.');
    }
  };

  const abrirModalCrear = () => {
    setEditandoId(null);
    setNombre('');
    setDescripcion('');
    setPrecioVenta('');
    setStock('');
    setStockMinimo('5');
    setGarantia('0');
    setObservaciones('');
    setCategoriaId(null);
    setMarcaId(null);
    setModeloId(null);
    setCodigoId(null);
    setImagenUri(null);
    setModalVisible(true);
  };

  const abrirModalEditar = (p: Producto) => {
    setEditandoId(p.productos_id);
    setNombre(p.nombre ?? '');
    setDescripcion(p.descripcion ?? '');
    setPrecioVenta(p.precio_venta ? String(p.precio_venta) : '');
    setStock(p.stock_disponible !== undefined && p.stock_disponible !== null ? String(p.stock_disponible) : '');
    setStockMinimo(p.stock_minimo !== undefined && p.stock_minimo !== null ? String(p.stock_minimo) : '5');
    setGarantia(p.garantia !== undefined && p.garantia !== null ? String(p.garantia) : '0');
    setObservaciones(p.observaciones ?? '');
    setCategoriaId(p.categoria_productos_id ? Number(p.categoria_productos_id) : null);
    setMarcaId(p.marca_id ? Number(p.marca_id) : null);
    setModeloId(p.modelo_id ? Number(p.modelo_id) : null);
    setCodigoId(p.codigo_producto_id ? Number(p.codigo_producto_id) : null);
    
    setImagenUri(p.imagen ? `${BASE_UPLOADS_URL}${p.imagen}` : null);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoId(null);
  };

  const productosFiltrados = productos.filter((p) => {
    const query = busqueda ? busqueda.toLowerCase() : '';
    const nombreMatch = p.nombre ? p.nombre.toLowerCase().includes(query) : false;
    const catMatch = p.categoria_nombre ? p.categoria_nombre.toLowerCase().includes(query) : false;
    const marcaMatch = p.marca_nombre ? p.marca_nombre.toLowerCase().includes(query) : false;
    return nombreMatch || catMatch || marcaMatch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'todos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('todos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'todos' && styles.filterBtnTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'activos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('activos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'activos' && styles.filterBtnTextActive]}>Activos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'inactivos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('inactivos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'inactivos' && styles.filterBtnTextActive]}>Inactivos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topActionRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, categoría o marca..."
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
          data={productosFiltrados}
          keyExtractor={(item) => item.productos_id.toString()}
          renderItem={({ item }) => {
            const esActivo = item.estado_general_id === 1;
            const bajoStock = Number(item.stock_disponible ?? 0) <= Number(item.stock_minimo ?? 5);

            return (
              <View style={[styles.card, !esActivo && styles.cardDisabled]}>
                {/* Imagen del producto en la tarjeta */}
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
                  <Text style={styles.cardSub}>Categoría: {item.categoria_nombre || 'General'}</Text>
                  <Text style={styles.cardPrice}>Precio: ${item.precio_venta}</Text>
                  <Text style={[styles.stockText, bajoStock && styles.stockAlerta]}>
                    Stock: {item.stock_disponible ?? 0} un. {bajoStock ? '(Stock Bajo)' : ''}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  {esActivo ? (
                    <>
                      <TouchableOpacity style={styles.editBtn} onPress={() => abrirModalEditar(item)}>
                        <Text style={styles.editBtnText}>Modificar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => cambiarEstadoProducto(item.productos_id, false)}>
                        <Text style={styles.deleteBtnText}>Inhabilitar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.activateBtn} onPress={() => cambiarEstadoProducto(item.productos_id, true)}>
                      <Text style={styles.activateBtnText}>Activar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron productos registrados.</Text>}
        />
      )}

      {/* Modal Crear / Editar */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={cerrarModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>{editandoId ? 'Editar Producto' : 'Nuevo Producto'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nombre del Producto</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre"
                placeholderTextColor="#64748B"
                value={nombre}
                onChangeText={setNombre}
              />

              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Descripción del producto"
                placeholderTextColor="#64748B"
                value={descripcion}
                onChangeText={setDescripcion}
              />

              <Text style={styles.inputLabel}>Precio de Venta ($)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0.00"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={precioVenta}
                onChangeText={setPrecioVenta}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Stock Disponible</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={stock}
                    onChangeText={setStock}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Stock Mínimo</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="5"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={stockMinimo}
                    onChangeText={setStockMinimo}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Garantía (Meses)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={garantia}
                onChangeText={setGarantia}
              />

              <Text style={styles.inputLabel}>Categoría</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={categoriaId}
                  onValueChange={(val) => setCategoriaId(val ? Number(val) : null)}
                  style={styles.pickerStyle}
                  dropdownIconColor="#64748B"
                >
                  <Picker.Item label="-- Seleccione categoría --" value={null} color="#64748B" />
                  {categorias.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} color="#0F172A" />
                  ))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>Marca</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={marcaId}
                  onValueChange={(val) => setMarcaId(val ? Number(val) : null)}
                  style={styles.pickerStyle}
                  dropdownIconColor="#64748B"
                >
                  <Picker.Item label="-- Seleccione marca --" value={null} color="#64748B" />
                  {marcas.map((m) => (
                    <Picker.Item key={m.id} label={m.nombre} value={m.id} color="#0F172A" />
                  ))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>Modelo</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={modeloId}
                  onValueChange={(val) => setModeloId(val ? Number(val) : null)}
                  style={styles.pickerStyle}
                  dropdownIconColor="#64748B"
                >
                  <Picker.Item label="-- Seleccione modelo --" value={null} color="#64748B" />
                  {modelos.map((md) => (
                    <Picker.Item key={md.id} label={md.nombre} value={md.id} color="#0F172A" />
                  ))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>Código de Producto</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={codigoId}
                  onValueChange={(val) => setCodigoId(val ? Number(val) : null)}
                  style={styles.pickerStyle}
                  dropdownIconColor="#64748B"
                >
                  <Picker.Item label="-- Seleccione código --" value={null} color="#64748B" />
                  {codigos.map((cp) => (
                    <Picker.Item key={cp.id} label={cp.codigo} value={cp.id} color="#0F172A" />
                  ))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>Observaciones</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Observaciones adicionales..."
                placeholderTextColor="#64748B"
                value={observaciones}
                onChangeText={setObservaciones}
              />

              <Text style={styles.inputLabel}>Imagen del Producto</Text>
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
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={cerrarModal}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={guardarProducto}>
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
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  filterBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  filterBtnText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  filterBtnTextActive: { color: '#FFFFFF' },
  topActionRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 14, color: '#0F172A' },
  addButton: { backgroundColor: '#2563EB', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8 },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  card: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardDisabled: { backgroundColor: '#F1F4F9', opacity: 0.7 },
  cardImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#E2E8F0' },
  cardImagePlaceholder: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#F1F4F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  cardTitleDisabled: { color: '#64748B', fontStyle: 'italic' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardPrice: { fontSize: 12, color: '#166534', fontWeight: 'bold', marginTop: 2 },
  stockText: { fontSize: 11, color: '#475569', marginTop: 1 },
  stockAlerta: { color: '#D97706', fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: '#E8F0FE', padding: 8, borderRadius: 6 },
  editBtnText: { fontSize: 11, color: '#2563EB', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 6 },
  deleteBtnText: { fontSize: 11, color: '#DC2626', fontWeight: '600' },
  activateBtn: { backgroundColor: '#DCFCE7', padding: 8, borderRadius: 6 },
  activateBtnText: { color: '#166534', fontWeight: 'bold', fontSize: 11 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 30, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  inputLabel: { fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: '600', marginTop: 8 },
  modalInput: { backgroundColor: '#F1F4F9', borderWidth: 1, borderColor: '#E5E9F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  pickerContainer: { backgroundColor: '#F1F4F9', borderWidth: 1, borderColor: '#E5E9F0', borderRadius: 8, overflow: 'hidden', marginTop: 2 },
  pickerStyle: { height: 50, width: '100%', color: '#0F172A' },
  imageButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  imagePickerBtn: { flex: 1, backgroundColor: '#E8F0FE', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  imagePickerBtnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 13 },
  previewContainer: { alignItems: 'center', marginTop: 10 },
  previewImage: { width: 100, height: 100, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#E2E8F0' },
  cancelBtnText: { color: '#64748B', fontWeight: '600' },
  saveBtn: { backgroundColor: '#2563EB' },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold' }
});