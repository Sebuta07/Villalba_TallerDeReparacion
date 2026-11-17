import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
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
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

export default function SolicitarReparacionScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();

  const usuarioId = params.usuarioId ? Number(params.usuarioId) : null;

  const servicioIdParam = params.servicioId ? Number(params.servicioId) : 3;
  const [servicioInfo, setServicioInfo] = useState<any>({
    id: servicioIdParam,
    nombre: params.servicioNombre ? String(params.servicioNombre) : 'Reparación de Módulo de Pantalla',
    costo: 50000
  });

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

  // Campos de dirección para envío a domicilio
  const [calle, setCalle] = useState('');
  const [manzana, setManzana] = useState('');
  const [casa, setCasa] = useState('');
  const [barrio, setBarrio] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [coordenadasGPS, setCoordenadasGPS] = useState<string>('');

  // Estados para GPS y Modal de Mapa Interactivo
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [modalMapaVisible, setModalMapaVisible] = useState(false);
  const [regionMapa, setRegionMapa] = useState({
    latitude: -26.1849,
    longitude: -58.1731,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [coordenadasPin, setCoordenadasPin] = useState({
    latitude: -26.1849,
    longitude: -58.1731,
  });

  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  const formatearCoordenadas = (lat: number, lon: number) =>
    `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

  // 1. OBTENER UBICACIÓN ACTUAL GPS AUTOMÁTICA
  const obtenerUbicacionGPS = async () => {
    try {
      setBuscandoUbicacion(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requieren permisos de ubicación.');
        setBuscandoUbicacion(false);
        return;
      }

      const ubicacion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = ubicacion.coords;
      const coordsStr = formatearCoordenadas(latitude, longitude);

      setCoordenadasGPS(coordsStr);
      setRegionMapa({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setCoordenadasPin({ latitude, longitude });

      await realizarGeocodificacionInversa(latitude, longitude, coordsStr);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación GPS.');
    } finally {
      setBuscandoUbicacion(false);
    }
  };

  // 2. GEOCODIFICACIÓN INVERSA (Autocompleta calle/barrio y deja la coordenada en observaciones)
  const realizarGeocodificacionInversa = async (lat: number, lon: number, coordsStr: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'FenixLabApp/1.0' } }
      );
      const data = await response.json();

      if (data && data.address) {
        const dir = data.address;
        setCalle(dir.road || dir.pedestrian || dir.suburb || '');
        setBarrio(dir.neighbourhood || dir.city_district || dir.town || dir.city || '');
        if (dir.house_number) {
          setCasa(String(dir.house_number));
        }
      }
    } catch (e) {
      console.log('Error geocodificación:', e);
    } finally {
      setObservaciones((prev) => {
        const limpio = prev.replace(/GPS Coordenadas:\s*-?\d+\.\d+,\s*-?\d+\.\d+\s*\|?\s*/i, '').trim();
        return limpio ? `GPS Coordenadas: ${coordsStr} | ${limpio}` : `GPS Coordenadas: ${coordsStr}`;
      });
    }
  };

  // 3. CONFIRMAR UBICACIÓN SELECCIONADA DESDE EL MAPA
  const confirmarUbicacionMapa = async () => {
    const coordsStr = formatearCoordenadas(coordenadasPin.latitude, coordenadasPin.longitude);
    setCoordenadasGPS(coordsStr);
    setModalMapaVisible(false);
    setBuscandoUbicacion(true);
    await realizarGeocodificacionInversa(coordenadasPin.latitude, coordenadasPin.longitude, coordsStr);
    setBuscandoUbicacion(false);
    Alert.alert('¡Ubicación establecida!', `Coordenadas ${coordsStr} guardadas.`);
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
    const result = await ImagePicker.launchImageLibraryAsync({
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
    if (tipoEntrega === 'envio' && (!calle.trim() || !barrio.trim() || !manzana.trim() || !casa.trim())) {
      Alert.alert('Atención', 'Por favor completa calle, manzana, casa y barrio para el envío.');
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
      formData.append('usuario_id', String(usuarioId));
      formData.append('servicio_id', String(servicioInfo.id));
      formData.append('diagnostico_cliente', diagnostico);
      formData.append('tipo_entrega', tipoEntrega);
      formData.append('categoria_equipo_id', String(catSel?.id || 1));
      formData.append('marca_equipo_id', String(marcaSel?.id || 1));
      formData.append('modelo_equipo_id', String(modeloSel?.id || 1));
      formData.append('numero_serie', numeroSerie.trim() || '');
      formData.append('imei', imei.trim() || '');

      if (tipoEntrega === 'envio') {
        // Garantiza que la coordenada siempre viaje dentro de observaciones
        let obsFinal = observaciones.trim();
        if (coordenadasGPS && !obsFinal.includes(coordenadasGPS)) {
          obsFinal = obsFinal
            ? `GPS Coordenadas: ${coordenadasGPS} | ${obsFinal}`
            : `GPS Coordenadas: ${coordenadasGPS}`;
        }

        formData.append('calle', calle.trim());
        formData.append('manzana', manzana.trim());
        formData.append('casa', casa.trim());
        formData.append('barrio', barrio.trim());
        formData.append('observaciones', obsFinal);
      }

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
          <Text style={styles.subtitle}>
            {servicioInfo.nombre} - <Text style={{ color: '#10B981' }}>${Number(servicioInfo.costo).toLocaleString('es-AR')}</Text>
          </Text>
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
              <Ionicons name="storefront-outline" size={16} color={tipoEntrega === 'sucursal' ? '#FFF' : '#94A3B8'} />
              <Text style={[styles.deliveryText, tipoEntrega === 'sucursal' && styles.deliveryTextActive]}>En Sucursal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deliveryBtn, tipoEntrega === 'envio' && styles.deliveryBtnActive]}
              onPress={() => setTipoEntrega('envio')}
            >
              <Ionicons name="car-outline" size={16} color={tipoEntrega === 'envio' ? '#FFF' : '#94A3B8'} />
              <Text style={[styles.deliveryText, tipoEntrega === 'envio' && styles.deliveryTextActive]}>Envío a Domicilio</Text>
            </TouchableOpacity>
          </View>

          {tipoEntrega === 'envio' && (
            <View style={styles.addressForm}>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.mapButton, { flex: 1 }]}
                  onPress={obtenerUbicacionGPS}
                  disabled={buscandoUbicacion}
                >
                  {buscandoUbicacion ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="locate" size={16} color="#FFF" />
                      <Text style={styles.mapButtonText}>GPS Actual</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mapButton, { flex: 1, backgroundColor: '#1D4ED8', borderColor: '#2563EB' }]}
                  onPress={() => setModalMapaVisible(true)}
                >
                  <Ionicons name="map-outline" size={16} color="#FFF" />
                  <Text style={styles.mapButtonText}>Elegir en Mapa</Text>
                </TouchableOpacity>
              </View>

              {coordenadasGPS ? (
                <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
                  Coordenada seleccionada: {coordenadasGPS}
                </Text>
              ) : null}

              <Text style={styles.inputLabel}>Calle *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Las Orquídeas"
                placeholderTextColor="#64748B"
                value={calle}
                onChangeText={setCalle}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Manzana *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 48"
                    placeholderTextColor="#64748B"
                    value={manzana}
                    onChangeText={setManzana}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Casa *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 7"
                    placeholderTextColor="#64748B"
                    value={casa}
                    onChangeText={setCasa}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Barrio *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Eva Perón"
                placeholderTextColor="#64748B"
                value={barrio}
                onChangeText={setBarrio}
              />

              <Text style={styles.inputLabel}>Indicaciones / Observaciones</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Portón azul, calle de tierra..."
                placeholderTextColor="#64748B"
                value={observaciones}
                onChangeText={setObservaciones}
              />
            </View>
          )}

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

      {/* MODAL DEL MAPA INTERACTIVO */}
      <Modal visible={modalMapaVisible} animationType="slide" transparent={false} onRequestClose={() => setModalMapaVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#071026' }}>
          <View style={styles.headerMapModal}>
            <Text style={styles.title}>Selecciona tu Ubicación</Text>
            <TouchableOpacity onPress={() => setModalMapaVisible(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, position: 'relative' }}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={{ width: '100%', height: '100%' }}
              initialRegion={regionMapa}
              onRegionChangeComplete={(reg) => {
                setCoordenadasPin({ latitude: reg.latitude, longitude: reg.longitude });
                setCoordenadasGPS(formatearCoordenadas(reg.latitude, reg.longitude));
              }}
            >
              <Marker
                coordinate={coordenadasPin}
                title="Punto de Entrega"
                description="Mueve el mapa para centrar el pin aquí"
              />
            </MapView>

            <View style={styles.markerFixed} pointerEvents="none">
              <Ionicons name="location" size={36} color="#EF4444" />
            </View>
          </View>

          <View style={styles.mapFooter}>
            <Text style={styles.mapHelperText}>
              Coordenadas: {coordenadasGPS || formatearCoordenadas(coordenadasPin.latitude, coordenadasPin.longitude)}
            </Text>
            <TouchableOpacity style={styles.confirmMapBtn} onPress={confirmarUbicacionMapa}>
              <Text style={styles.confirmMapBtnText}>CONFIRMAR ESTA UBICACIÓN</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL SELECTOR CATEGORÍA / MARCA / MODELO */}
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
  deliveryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0D1E42', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  deliveryBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  deliveryText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  deliveryTextActive: { color: '#FFFFFF' },
  addressForm: { marginTop: 12 },
  mapButton: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: '#10B981' },
  mapButtonText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  inputLabel: { color: '#CBD5E1', fontSize: 11, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  headerMapModal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#071026', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  markerFixed: { position: 'absolute', top: '50%', left: '50%', marginLeft: -18, marginTop: -36, alignItems: 'center', justifyContent: 'center' },
  mapFooter: { padding: 16, backgroundColor: '#13161F', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mapHelperText: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginBottom: 10 },
  confirmMapBtn: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  confirmMapBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
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