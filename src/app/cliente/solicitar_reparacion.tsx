import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useGlobalSearchParams, useRouter } from 'expo-router'; // <-- Usamos useGlobalSearchParams
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

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

export default function SolicitarReparacionScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams(); // <-- Captura globalmente el usuarioId de la sesión de rutas
  
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : null;
  
  const servicioIdParam = params.servicioId ? Number(params.servicioId) : 3;
  const [servicioInfo, setServicioInfo] = useState<any>({
    id: servicioIdParam,
    nombre: params.servicioNombre ? String(params.servicioNombre) : 'Reparación de Módulo de Pantalla',
    costo: 50000
  });

  // ... (el resto de tus estados se mantienen igual)
  const [categorias, setCategorias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);

  const [catSel, setCatSel] = useState<any>(null);
  const [marcaSel, setMarcaSel] = useState<any>(null);
  const [modeloSel, setModeloSel] = useState<any>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoSelect, setTipoSelect] = useState<'cat' | 'marca' | 'modelo' | null>(null);
  const [busquedaModal, setBusquedaModal] = useState('');

  const [diagnostico, setDiagnostico] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [imei, setImei] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState<'sucursal' | 'envio'>('sucursal');
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si por alguna razón no llega el usuarioId, impedimos la acción y avisamos
    if (!usuarioId) {
      Alert.alert(
        'Sesión Requerida',
        'No se detectó un usuario activo. Por favor inicia sesión nuevamente.',
        [{ text: 'Volver', onPress: () => router.back() }]
      );
      return;
    }
    fetchFormData();
  }, [usuarioId]);

  const fetchFormData = async () => {
    try {
      const res = await fetch(`${API_BASE}/cliente/solicitar_reparacion.php?servicio_id=${servicioIdParam}`);
      const json = await res.json();
      
      setCategorias(json.categorias || []);
      setMarcas(json.marcas || []);
      setModelos(json.modelos || []);
      if (json.servicio) {
        setServicioInfo(json.servicio);
      }

      if (json.categorias?.length) setCatSel(json.categorias[0]);
      if (json.marcas?.length) setMarcaSel(json.marcas[0]);
      if (json.modelos?.length) setModeloSel(json.modelos[0]);
    } catch (e) {
      console.error('Error al cargar datos del formulario', e);
    }
  };

  const abrirSelect = (tipo: 'cat' | 'marca' | 'modelo') => {
    setTipoSelect(tipo);
    setBusquedaModal('');
    setModalVisible(true);
  };

  const seleccionarItem = (item: any) => {
    if (tipoSelect === 'cat') setCatSel(item);
    if (tipoSelect === 'marca') setMarcaSel(item);
    if (tipoSelect === 'modelo') setModeloSel(item);
    setModalVisible(false);
  };

  const getListaFiltradaModal = () => {
    let lista = [];
    if (tipoSelect === 'cat') lista = categorias;
    if (tipoSelect === 'marca') lista = marcas;
    if (tipoSelect === 'modelo') lista = modelos;

    return lista.filter((i) => i.nombre.toLowerCase().includes(busquedaModal.toLowerCase()));
  };

  const seleccionarImagen = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagenUri(result.assets[0].uri);
    }
  };

  const enviarOrdenConXHR = (formData: FormData): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/cliente/solicitar_reparacion.php`);
      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res);
        } catch (e) {
          reject(new Error('Respuesta del servidor no válida (No es JSON)'));
        }
      };
      xhr.onerror = () => reject(new Error('Error de red al conectar con el servidor'));
      xhr.send(formData);
    });
  };

  const confirmarEnvioOrden = () => {
    if (!usuarioId) {
      Alert.alert('Error', 'No se ha detectado el usuario logueado.');
      return;
    }
    if (!diagnostico.trim()) {
      Alert.alert('Atención', 'Ingresa una descripción de la falla.');
      return;
    }

    Alert.alert(
      'Confirmar Orden',
      '¿Desea realizar la orden de reparación?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí', onPress: () => ejecutarEnvioOrden() }
      ]
    );
  };

  const ejecutarEnvioOrden = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      // ENVIAR ESTRICTAMENTE EL ID REAL DEL USUARIO QUE INICIÓ SESIÓN (ej: 16 para sebuta1)
      formData.append('usuario_id', String(usuarioId));
      formData.append('servicio_id', String(servicioInfo.id));
      formData.append('diagnostico_cliente', diagnostico);
      formData.append('tipo_entrega', tipoEntrega);
      formData.append('categoria_equipo_id', String(catSel?.id || 1));
      formData.append('marca_equipo_id', String(marcaSel?.id || 1));
      formData.append('modelo_equipo_id', String(modeloSel?.id || 1));
      formData.append('numero_serie', numeroSerie.trim() || '');
      formData.append('imei', imei.trim() || '');

      if (imagenUri) {
        const filename = imagenUri.split('/').pop() || 'foto.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('imagen', {
          uri: imagenUri,
          name: filename,
          type,
        } as any);
      }

      const json = await enviarOrdenConXHR(formData);

      if (json.success) {
        Alert.alert(
          '¡Éxito!',
          'La orden de reparación se ha registrado correctamente.',
          [{ text: 'OK', onPress: () => router.replace({ pathname: '/cliente/seguimiento', params: { usuarioId } }) }]
        );
      } else {
        Alert.alert('Error del Servidor', json.error || 'No se pudo registrar.');
      }
    } catch (e: any) {
      console.error('Error detallado de red/catch:', e);
      Alert.alert('Falla de conexión', e.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Solicitud de Turno</Text>
          <Text style={styles.subtitle}>{servicioInfo.nombre} - <Text style={{ color: '#10B981' }}>${Number(servicioInfo.costo).toLocaleString('es-AR')}</Text></Text>
        </View>

        <View style={styles.formCard}>
          
          <Text style={styles.label}>Categoría</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => abrirSelect('cat')}>
            <Text style={styles.selectBoxText}>{catSel?.nombre || 'Seleccionar...'}</Text>
            <Ionicons name="search" size={16} color="#38BDF8" />
          </TouchableOpacity>

          <Text style={styles.label}>Marca</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => abrirSelect('marca')}>
            <Text style={styles.selectBoxText}>{marcaSel?.nombre || 'Seleccionar...'}</Text>
            <Ionicons name="search" size={16} color="#38BDF8" />
          </TouchableOpacity>

          <Text style={styles.label}>Modelo</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => abrirSelect('modelo')}>
            <Text style={styles.selectBoxText}>{modeloSel?.nombre || 'Seleccionar...'}</Text>
            <Ionicons name="search" size={16} color="#38BDF8" />
          </TouchableOpacity>

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describir problema..."
            placeholderTextColor="#64748B"
            multiline
            value={diagnostico}
            onChangeText={setDiagnostico}
          />

          <Text style={styles.label}>Nro de Serie</Text>
          <TextInput style={styles.input} placeholder="Opcional" placeholderTextColor="#64748B" value={numeroSerie} onChangeText={setNumeroSerie} />

          <Text style={styles.label}>IMEI</Text>
          <TextInput style={styles.input} placeholder="Opcional" placeholderTextColor="#64748B" value={imei} onChangeText={setImei} />

          <Text style={styles.label}>Modalidad de Entrega</Text>
          <View style={styles.deliveryRow}>
            <TouchableOpacity
              style={[styles.deliveryBtn, tipoEntrega === 'sucursal' && styles.deliveryBtnActive]}
              onPress={() => setTipoEntrega('sucursal')}
            >
              <Text style={[styles.deliveryText, tipoEntrega === 'sucursal' && styles.deliveryTextActive]}>En Sucursal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deliveryBtn, tipoEntrega === 'envio' && styles.deliveryBtnActive]}
              onPress={() => setTipoEntrega('envio')}
            >
              <Text style={[styles.deliveryText, tipoEntrega === 'envio' && styles.deliveryTextActive]}>Envío</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Fotografía</Text>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={seleccionarImagen}>
            {imagenUri ? (
              <Image source={{ uri: imagenUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="camera-outline" size={24} color="#38BDF8" />
                <Text style={styles.placeholderText}>Adjuntar foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={confirmarEnvioOrden} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>CONFIRMAR ORDEN</Text>}
          </TouchableOpacity>

        </View>

      </ScrollView>

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar {tipoSelect === 'cat' ? 'Categoría' : tipoSelect === 'marca' ? 'Marca' : 'Modelo'}</Text>
            
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar..."
              placeholderTextColor="#64748B"
              value={busquedaModal}
              onChangeText={setBusquedaModal}
            />

            <ScrollView style={{ maxHeight: 250 }}>
              {getListaFiltradaModal().map((item) => (
                <TouchableOpacity key={item.id} style={styles.modalItem} onPress={() => seleccionarItem(item)}>
                  <Text style={styles.modalItemText}>{item.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#38BDF8', fontSize: 13, marginTop: 4, fontWeight: '700' },
  formCard: { backgroundColor: '#13161F', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  label: { color: '#CBD5E1', fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  selectBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0D1E42', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  selectBoxText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: '#0D1E42', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#FFFFFF', fontSize: 13 },
  textArea: { height: 75, textAlignVertical: 'top' },
  deliveryRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  deliveryBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1E42', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  deliveryBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  deliveryText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  deliveryTextActive: { color: '#FFFFFF' },
  imagePickerBtn: { height: 110, backgroundColor: '#0D1E42', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)', justifyContent: 'center', alignItems: 'center', marginTop: 4, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#94A3B8', fontSize: 11, marginTop: 4, fontWeight: '600' },
  submitBtn: { backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, marginTop: 24 },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#0D1E42', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  modalSearchInput: { backgroundColor: '#13161F', color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, fontSize: 13, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  modalItemText: { color: '#CBD5E1', fontSize: 13, fontWeight: '600', textAlign: 'center' }
});