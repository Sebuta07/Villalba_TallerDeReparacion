import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
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
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  // Estados para los datos de envío a domicilio (manual + Google Maps)
  const [calle, setCalle] = useState<string>('');
  const [manzana, setManzana] = useState<string>('');
  const [casa, setCasa] = useState<string>('');
  const [barrio, setBarrio] = useState<string>('');
  const [observacionesEnvio, setObservacionesEnvio] = useState<string>('');
  const [coordenadasGPS, setCoordenadasGPS] = useState<string>('');

  // Estados para GPS y Modal de Mapa Interactivo
  const [buscandoUbicacion, setBuscandoUbicacion] = useState<boolean>(false);
  const [modalMapaVisible, setModalMapaVisible] = useState<boolean>(false);
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

  // 2. GEOCODIFICACIÓN INVERSA
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
      setObservacionesEnvio((prev) => {
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

    if (tipoEntrega === 'envio') {
      if (!calle.trim() || !barrio.trim()) {
        Alert.alert('Datos de envío incompletos', 'Por favor completa al menos la Calle y el Barrio para el envío a domicilio.');
        return;
      }
    }

    try {
      setLoadingEnvio(true);
      const formData = new FormData();
      formData.append('usuario_id', String(usuarioSeleccionado));
      formData.append('empleado_id', String(empleadoId));
      formData.append('servicios_id', String(serviciosCarrito[0].servicios_id));
      formData.append('diagnostico_cliente', diagnosticoCliente.trim());
      formData.append('tipo_entrega', tipoEntrega);
      formData.append('categoria_equipo_id', categoriaEquipoId);
      formData.append('marca_equipo_id', marcaEquipoId);
      formData.append('modelo_equipo_id', modeloEquipoId);
      formData.append('numero_serie', numeroSerie.trim());
      formData.append('imei', imei.trim());

      if (tipoEntrega === 'envio') {
        let obsFinal = observacionesEnvio.trim();
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

      if (fotoDispositivo) {
        const filename = fotoDispositivo.split('/').pop() || 'foto_equipo.jpg';
        formData.append('imagen', { uri: fotoDispositivo, name: filename, type: 'image/jpeg' } as any);
      }

      const data = await enviarOrdenConXHR(formData);
      
      if (data.success) {
        // AQUÍ ESTÁ EL CAMBIO PRINCIPAL: Redirigimos al comprobante enviando todos los parámetros necesarios
        router.replace({
          pathname: '/recepcionista/comprobante',
          params: {
            ordenId: String(data.orden_id || 'N/D'),
            empleadoId: String(empleadoId),
            usuarioId: String(usuarioSeleccionado),
            total: String(calcularTotal()),
            fecha: new Date().toLocaleString(),
            numeroSerie: numeroSerie.trim() || 'Sin especificar',
            imei: imei.trim() || 'Sin especificar',
            diagnosticoCliente: diagnosticoCliente.trim() || 'Sin observaciones',
            carrito: JSON.stringify(serviciosCarrito)
          }
        });
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

        {/* FORMULARIO CONDICIONAL DE ENVÍO A DOMICILIO (MANUAL + GOOGLE MAPS) */}
        {tipoEntrega === 'envio' && (
          <View style={styles.envioFormContainer}>
            <Text style={styles.envioFormHeader}>Ubicación del Hogar del Cliente</Text>

            <View style={styles.mapActionsRow}>
              <TouchableOpacity
                style={[styles.mapActionBtn, { backgroundColor: '#059669' }]}
                onPress={obtenerUbicacionGPS}
                disabled={buscandoUbicacion}
              >
                {buscandoUbicacion ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="locate" size={16} color="#FFF" />
                    <Text style={styles.mapActionText}>GPS Actual</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mapActionBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => setModalMapaVisible(true)}
              >
                <Ionicons name="map-outline" size={16} color="#FFF" />
                <Text style={styles.mapActionText}>Elegir en Google Maps</Text>
              </TouchableOpacity>
            </View>

            {coordenadasGPS ? (
              <Text style={styles.coordBadge}>📍 Coordenadas: {coordenadasGPS}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Calle / Altura *:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Av. 25 de Mayo 850"
              placeholderTextColor="#64748B"
              value={calle}
              onChangeText={setCalle}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Manzana:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Mz 48"
                  placeholderTextColor="#64748B"
                  value={manzana}
                  onChangeText={setManzana}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Casa / Dpto:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Casa 7"
                  placeholderTextColor="#64748B"
                  value={casa}
                  onChangeText={setCasa}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Barrio *:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Barrio Las Orquídeas"
              placeholderTextColor="#64748B"
              value={barrio}
              onChangeText={setBarrio}
            />

            <Text style={styles.inputLabel}>Observaciones / Coordenadas:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Portón azul, o pega coordenadas / link de Maps..."
              placeholderTextColor="#64748B"
              value={observacionesEnvio}
              onChangeText={setObservacionesEnvio}
            />
          </View>
        )}
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

      {/* MODAL DEL MAPA INTERACTIVO */}
      <Modal visible={modalMapaVisible} animationType="slide" transparent={false} onRequestClose={() => setModalMapaVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#071026' }}>
          <View style={styles.headerMapModal}>
            <Text style={styles.mapModalTitle}>Ubicación del Hogar del Cliente</Text>
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
                title="Domicilio del Cliente"
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
  previewImage: { width: '100%' as any, height: 160, borderRadius: 8 },
  deletePhotoBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: '#fff', borderRadius: 12 },
  entregaRow: { flexDirection: 'row', gap: 10 },
  entregaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2563EB', gap: 6 },
  entregaBtnSelected: { backgroundColor: '#2563EB' },
  entregaText: { color: '#2563EB', fontWeight: 'bold', fontSize: 12 },
  entregaTextSelected: { color: '#FFF' },
  envioFormContainer: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  envioFormHeader: { fontSize: 13, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  mapActionsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  mapActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  mapActionText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  coordBadge: { color: '#059669', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  rowInputs: { flexDirection: 'row', gap: 10 },
  headerMapModal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#071026', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mapModalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  markerFixed: { position: 'absolute', top: '50%', left: '50%', marginLeft: -18, marginTop: -36, alignItems: 'center', justifyContent: 'center' },
  mapFooter: { padding: 16, backgroundColor: '#13161F', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mapHelperText: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginBottom: 10 },
  confirmMapBtn: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  confirmMapBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
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