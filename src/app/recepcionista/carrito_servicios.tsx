import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  View
} from 'react-native';

interface ItemServicio {
  servicios_id: number;
  nombre: string;
  descripcion: string;
  costo: string | number;
  precio_venta: string | number;
  cantidad: number;
}

interface CatalogoItem {
  id: number;
  nombre: string;
}

interface UsuarioItem {
  usuario_id: number;
  nombre: string;
  apellido?: string;
  dni_cuit: string | number;
  email?: string;
}

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/recepcionista/registrar_orden_reparacion.php`;

export default function CarritoServiciosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const empleadoId = params.empleadoId ? Number(params.empleadoId) : 1;
  const carritoInicial: ItemServicio[] = params.carritoInicial 
    ? JSON.parse(params.carritoInicial as string) 
    : [];

  const [serviciosCarrito, setServiciosCarrito] = useState<ItemServicio[]>(carritoInicial);
  
  const [categorias, setCategorias] = useState<CatalogoItem[]>([]);
  const [marcas, setMarcas] = useState<CatalogoItem[]>([]);
  const [modelos, setModelos] = useState<CatalogoItem[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [busquedaUsuario, setBusquedaUsuario] = useState<string>('');

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);
  const [categoriaEquipoId, setCategoriaEquipoId] = useState<string>('');
  const [marcaEquipoId, setMarcaEquipoId] = useState<string>('');
  const [modeloEquipoId, setModeloEquipoId] = useState<string>('');
  const [numeroSerie, setNumeroSerie] = useState<string>('');
  const [imei, setImei] = useState<string>('');
  const [diagnosticoCliente, setDiagnosticoCliente] = useState<string>('');
  
  const [fotoDispositivo, setFotoDispositivo] = useState<string | null>(null);
  const [tipoEntrega, setTipoEntrega] = useState<'sucursal' | 'envio'>('sucursal');

  const [loadingCatalogos, setLoadingCatalogos] = useState<boolean>(true);
  const [loadingEnvio, setLoadingEnvio] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [nuevoApellido, setNuevoApellido] = useState<string>('');
  const [nuevoDni, setNuevoDni] = useState<string>('');
  const [nuevoEmail, setNuevoEmail] = useState<string>('');
  const [nuevoTelefono, setNuevoTelefono] = useState<string>('');

  useEffect(() => {
    fetchCatalogos();
  }, []);

  const fetchCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.success) {
        setCategorias(data.categorias || []);
        setMarcas(data.marcas || []);
        setModelos(data.modelos || []);
        setUsuarios(data.usuarios || []);

        if (data.usuarios && data.usuarios.length > 0) {
          setUsuarioSeleccionado(Number(data.usuarios[0].usuario_id));
        }

        // Si no viene carrito inicial pero el GET trae un servicio por defecto, lo cargamos
        if (serviciosCarrito.length === 0 && data.servicio) {
          setServiciosCarrito([{
            servicios_id: data.servicio.id,
            nombre: data.servicio.nombre,
            descripcion: '',
            costo: data.servicio.costo,
            precio_venta: data.servicio.costo,
            cantidad: 1
          }]);
        }
      }
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
      Alert.alert('Aviso', 'No se pudieron cargar los catálogos.');
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const seleccionarFotoGaleria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Se necesitan permisos para acceder a la galería.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
      setFotoDispositivo(resultado.assets[0].uri);
    }
  };

  const tomarFotoCamara = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Se necesitan permisos para usar la cámara.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
      setFotoDispositivo(resultado.assets[0].uri);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = busquedaUsuario.toLowerCase();
    const nombreCompleto = `${u.nombre} ${u.apellido || ''}`.toLowerCase();
    const dniStr = String(u.dni_cuit || '').toLowerCase();
    return nombreCompleto.includes(texto) || dniStr.includes(texto);
  });

  const calcularTotal = () => {
    return serviciosCarrito.reduce((acc, item) => {
      const precio = Number(item.precio_venta) || Number(item.costo) || 0;
      return acc + (precio * (item.cantidad || 1));
    }, 0);
  };

  const enviarOrdenConXHR = (formData: FormData): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', API_URL);
      xhr.onload = () => {
        try { resolve(JSON.parse(xhr.responseText)); } 
        catch (e) { reject(new Error('Respuesta del servidor no válida')); }
      };
      xhr.onerror = () => reject(new Error('Error de conexión'));
      xhr.send(formData);
    });
  };

  const procesarOrdenReparacion = async () => {
    if (!usuarioSeleccionado) {
      Alert.alert('Faltan datos', 'Selecciona un cliente de la lista.');
      return;
    }
    if (!categoriaEquipoId || !marcaEquipoId || !modeloEquipoId) {
      Alert.alert('Faltan datos', 'Selecciona la categoría, marca y modelo del equipo.');
      return;
    }
    if (serviciosCarrito.length === 0) {
      Alert.alert('Carrito vacío', 'No hay servicios en el carrito.');
      return;
    }

    try {
      setLoadingEnvio(true);
      const formData = new FormData();
      formData.append('usuario_id', String(usuarioSeleccionado));
      formData.append('servicios_id', String(serviciosCarrito[0].servicios_id));
      formData.append('diagnostico_cliente', diagnosticoCliente.trim());
      formData.append('tipo_entrega', tipoEntrega);
      formData.append('categoria_equipo_id', categoriaEquipoId);
      formData.append('marca_equipo_id', marcaEquipoId);
      formData.append('modelo_equipo_id', modeloEquipoId);
      formData.append('numero_serie', numeroSerie.trim());
      formData.append('imei', imei.trim());

      if (fotoDispositivo) {
        const filename = fotoDispositivo.split('/').pop() || 'foto_equipo.jpg';
        formData.append('imagen', { uri: fotoDispositivo, name: filename, type: 'image/jpeg' } as any);
      }

      const data = await enviarOrdenConXHR(formData);
      if (data.success) {
        Alert.alert(
          '¡Orden Registrada!', 
          `Código de seguridad: ${data.codigo_seguridad}\n\nEl dispositivo quedó en taller a la espera del diagnóstico técnico.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', data.error || 'No se pudo registrar la orden.');
      }
    } catch (err) {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoadingEnvio(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Recepción de Taller</Text>

      {/* SECCIÓN CLIENTE */}
      <View style={styles.sectionCard}>
        <View style={styles.clienteHeaderRow}>
          <Text style={styles.labelCliente}>Cliente: {usuarioSeleccionado ? `[ID: ${usuarioSeleccionado}]` : 'Ninguno'}</Text>
          <TouchableOpacity style={styles.btnNuevoCliente} onPress={() => setModalVisible(true)}>
            <Ionicons name="person-add" size={14} color="#fff" />
            <Text style={styles.btnNuevoClienteText}> Nuevo</Text>
          </TouchableOpacity>
        </View>

        {loadingCatalogos ? (
          <ActivityIndicator color="#2563EB" style={{ marginVertical: 10 }} />
        ) : (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Buscar por nombre o DNI..."
              placeholderTextColor="#64748B"
              value={busquedaUsuario}
              onChangeText={setBusquedaUsuario}
            />
            <FlatList
              data={usuariosFiltrados}
              keyExtractor={(item) => item.usuario_id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = usuarioSeleccionado === item.usuario_id;
                return (
                  <TouchableOpacity
                    style={[styles.userChip, isSelected && styles.userChipSelected]}
                    onPress={() => setUsuarioSeleccionado(item.usuario_id)}
                  >
                    <Text style={[styles.userChipText, isSelected && styles.userChipTextSelected]} numberOfLines={1}>
                      {item.nombre} {item.apellido || ''}
                    </Text>
                    <Text style={[styles.userChipSubText, isSelected && { color: '#FFF' }]}>DNI: {item.dni_cuit}</Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ gap: 8, marginTop: 8 }}
              ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron clientes.</Text>}
            />
          </View>
        )}
      </View>

      {/* EQUIPO */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Especificaciones del Equipo</Text>

        <Text style={styles.inputLabel}>Categoría:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={categoriaEquipoId} onValueChange={setCategoriaEquipoId} style={styles.picker}>
            <Picker.Item label="Seleccione categoría..." value="" color="#64748B" />
            {categorias.map(cat => <Picker.Item key={cat.id} label={cat.nombre} value={String(cat.id)} color="#0F172A" />)}
          </Picker>
        </View>

        <Text style={styles.inputLabel}>Marca:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={marcaEquipoId} onValueChange={setMarcaEquipoId} style={styles.picker}>
            <Picker.Item label="Seleccione marca..." value="" color="#64748B" />
            {marcas.map(mar => <Picker.Item key={mar.id} label={mar.nombre} value={String(mar.id)} color="#0F172A" />)}
          </Picker>
        </View>

        <Text style={styles.inputLabel}>Modelo:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={modeloEquipoId} onValueChange={setModeloEquipoId} style={styles.picker}>
            <Picker.Item label="Seleccione modelo..." value="" color="#64748B" />
            {modelos.map(mod => <Picker.Item key={mod.id} label={mod.nombre} value={String(mod.id)} color="#0F172A" />)}
          </Picker>
        </View>

        <Text style={styles.inputLabel}>Nro. de Serie (Opcional):</Text>
        <TextInput style={styles.input} placeholder="Ej: SN123456..." placeholderTextColor="#64748B" value={numeroSerie} onChangeText={setNumeroSerie} />

        <Text style={styles.inputLabel}>IMEI (Opcional):</Text>
        <TextInput style={styles.input} placeholder="Ej: 354928..." placeholderTextColor="#64748B" value={imei} onChangeText={setImei} />

        <Text style={styles.inputLabel}>Diagnóstico / Falla reportada:</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Ej: No enciende, pantalla rota..." placeholderTextColor="#64748B" multiline value={diagnosticoCliente} onChangeText={setDiagnosticoCliente} />

        <Text style={styles.inputLabel}>Foto del Equipo:</Text>
        <View style={styles.imageButtonsRow}>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={seleccionarFotoGaleria}>
            <Ionicons name="images-outline" size={16} color="#2563EB" />
            <Text style={styles.imagePickerBtnText}> Galería</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={tomarFotoCamara}>
            <Ionicons name="camera-outline" size={16} color="#2563EB" />
            <Text style={styles.imagePickerBtnText}> Cámara</Text>
          </TouchableOpacity>
        </View>

        {fotoDispositivo && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: fotoDispositivo }} style={styles.previewImage} />
            <TouchableOpacity style={styles.deletePhotoBtn} onPress={() => setFotoDispositivo(null)}>
              <Ionicons name="close-circle" size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* TIPO DE ENTREGA */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Modalidad de Retorno</Text>
        <View style={styles.entregaRow}>
          <TouchableOpacity 
            style={[styles.entregaBtn, tipoEntrega === 'sucursal' && styles.entregaBtnSelected]} 
            onPress={() => setTipoEntrega('sucursal')}
          >
            <Ionicons name="storefront-outline" size={18} color={tipoEntrega === 'sucursal' ? '#fff' : '#2563EB'} />
            <Text style={[styles.entregaText, tipoEntrega === 'sucursal' && styles.entregaTextSelected]}>Retira en Sucursal</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.entregaBtn, tipoEntrega === 'envio' && styles.entregaBtnSelected]} 
            onPress={() => setTipoEntrega('envio')}
          >
            <Ionicons name="car-outline" size={18} color={tipoEntrega === 'envio' ? '#fff' : '#2563EB'} />
            <Text style={[styles.entregaText, tipoEntrega === 'envio' && styles.entregaTextSelected]}>Envío a Domicilio</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CARRITO / SERVICIO SELECCIONADO */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Servicios Solicitados</Text>
        {serviciosCarrito.map((item, index) => (
          <View key={index} style={styles.carritoCard}>
            <Text style={styles.itemNombre}>{item.nombre}</Text>
            <Text style={styles.itemPrecio}>Est. ${Number(item.precio_venta || item.costo).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Estimado:</Text>
          <Text style={styles.totalValue}>${calcularTotal().toFixed(2)}</Text>
        </View>
        <Text style={styles.avisoPago}>* El cliente no abona ahora. El técnico revisará el equipo y se comunicará con el diagnóstico, presupuesto final y seña requerida.</Text>
      </View>

      <TouchableOpacity style={styles.btnConfirmar} onPress={procesarOrdenReparacion} disabled={loadingEnvio}>
        {loadingEnvio ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnConfirmarText}>Registrar Ingreso a Taller</Text>}
      </TouchableOpacity>

      {/* MODAL NUEVO CLIENTE */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar Nuevo Cliente</Text>
            <TextInput style={styles.inputModal} placeholder="Nombre *" placeholderTextColor="#64748B" value={nuevoNombre} onChangeText={setNuevoNombre} />
            <TextInput style={styles.inputModal} placeholder="Apellido" placeholderTextColor="#64748B" value={nuevoApellido} onChangeText={setNuevoApellido} />
            <TextInput style={styles.inputModal} placeholder="DNI / CUIT *" placeholderTextColor="#64748B" keyboardType="numeric" value={nuevoDni} onChangeText={setNuevoDni} />
            <TextInput style={styles.inputModal} placeholder="Teléfono *" placeholderTextColor="#64748B" keyboardType="phone-pad" value={nuevoTelefono} onChangeText={setNuevoTelefono} />
            <TextInput style={styles.inputModal} placeholder="Correo *" placeholderTextColor="#64748B" keyboardType="email-address" autoCapitalize="none" value={nuevoEmail} onChangeText={setNuevoEmail} />
            
            <TouchableOpacity style={styles.btnGuardarCliente} onPress={() => {
              // Lógica auxiliar o integración para crear cliente rápido si lo deseas
              Alert.alert("Aviso", "Implementar alta rápida de usuario si es requerido.");
              setModalVisible(false);
            }}>
              <Text style={styles.btnGuardarClienteText}>Crear Cliente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#64748B' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 16 },
  sectionCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { color: '#0F172A', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  clienteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  labelCliente: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  btnNuevoCliente: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnNuevoClienteText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  userChip: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', minWidth: 120 },
  userChipSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  userChipText: { color: '#334155', fontSize: 13, fontWeight: 'bold' },
  userChipTextSelected: { color: '#fff' },
  userChipSubText: { color: '#64748B', fontSize: 11 },
  inputLabel: { color: '#64748B', fontSize: 12, marginBottom: 4, marginTop: 8, fontWeight: '600' },
  input: { backgroundColor: '#F8FAFC', color: '#0F172A', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, fontSize: 13, borderWidth: 1, borderColor: '#CBD5E1' },
  textArea: { height: 70, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', overflow: 'hidden', marginTop: 4 },
  picker: { color: '#0F172A', height: 50 },
  imageButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  imagePickerBtn: { flex: 1, backgroundColor: '#E8F0FE', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE', flexDirection: 'row', justifyContent: 'center' },
  imagePickerBtnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 13 },
  previewContainer: { position: 'relative', marginTop: 10, alignItems: 'center' },
  previewImage: { width: '100%T' as any, height: 160, borderRadius: 8 },
  deletePhotoBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: '#fff', borderRadius: 12 },
  entregaRow: { flexDirection: 'row', gap: 10 },
  entregaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2563EB', gap: 6 },
  entregaBtnSelected: { backgroundColor: '#2563EB' },
  entregaText: { color: '#2563EB', fontWeight: 'bold', fontSize: 12 },
  entregaTextSelected: { color: '#FFF' },
  carritoCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  itemNombre: { color: '#0F172A', fontSize: 13, fontWeight: 'bold', flex: 1 },
  itemPrecio: { color: '#166534', fontSize: 12, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8 },
  totalLabel: { fontWeight: 'bold', color: '#0F172A', fontSize: 14 },
  totalValue: { fontWeight: 'bold', color: '#166534', fontSize: 15 },
  avisoPago: { fontSize: 11, color: '#64748B', fontStyle: 'italic', marginTop: 6 },
  btnConfirmar: { backgroundColor: '#2563EB', padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  btnConfirmarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyText: { color: '#64748B', fontSize: 12, fontStyle: 'italic', paddingVertical: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.55)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16 },
  modalTitle: { color: '#0F172A', fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  inputModal: { backgroundColor: '#F8FAFC', color: '#0F172A', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, fontSize: 13, marginBottom: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  btnGuardarCliente: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnGuardarClienteText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});