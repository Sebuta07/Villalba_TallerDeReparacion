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
  esServicio: boolean;
  observacionesItem?: string;
}

interface CatalogoItem {
  categoria_equipo_id?: number;
  marca_equipo_id?: number;
  modelo_equipo_id?: number;
  formas_pago_id?: number;
  nombre: string;
}

interface MetodoPagoAsignado {
  forma_pago_id: number;
  nombre: string;
  monto: string;
}

interface UsuarioItem {
  [key: string]: any;
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
    ? JSON.parse(params.carritoInicial as string).map((item: any) => ({ ...item, observacionesItem: item.observacionesItem || '' })) 
    : [];

  const [serviciosCarrito, setServiciosCarrito] = useState<ItemServicio[]>(carritoInicial);
  
  const [categorias, setCategorias] = useState<CatalogoItem[]>([]);
  const [marcas, setMarcas] = useState<CatalogoItem[]>([]);
  const [modelos, setModelos] = useState<CatalogoItem[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [formasPago, setFormasPago] = useState<CatalogoItem[]>([]);
  const [busquedaUsuario, setBusquedaUsuario] = useState<string>('');

  const [pagosSeleccionados, setPagosSeleccionados] = useState<MetodoPagoAsignado[]>([]);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);
  const [categoriaEquipoId, setCategoriaEquipoId] = useState<string>('');
  const [marcaEquipoId, setMarcaEquipoId] = useState<string>('');
  const [modeloEquipoId, setModeloEquipoId] = useState<string>('');
  const [numeroSerie, setNumeroSerie] = useState<string>('');
  const [imei, setImei] = useState<string>('');
  const [diagnosticoCliente, setDiagnosticoCliente] = useState<string>('');
  
  // 📸 Estado para las fotos del dispositivo
  const [fotosDispositivo, setFotosDispositivo] = useState<string[]>([]);
  
  // 🚚 Opción de Entrega recuperada
  const [tipoEntrega, setTipoEntrega] = useState<'sucursal' | 'envio'>('sucursal');

  const [loadingCatalogos, setLoadingCatalogos] = useState<boolean>(true);
  const [loadingEnvio, setLoadingEnvio] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [nuevoApellido, setNuevoApellido] = useState<string>('');
  const [nuevoDni, setNuevoDni] = useState<string>('');
  const [nuevoEmail, setNuevoEmail] = useState<string>('');
  const [nuevoTelefono, setNuevoTelefono] = useState<string>('');
  const [nuevoDireccion, setNuevoDireccion] = useState<string>('');
  const [nuevoLocalidad, setNuevoLocalidad] = useState<string>('');
  const [nuevoUsername, setNuevoUsername] = useState<string>('');

  const obtenerIdUsuario = (item: any): number => {
    if (!item) return 0;
    const posibleId = item.usuario_id || item.usuarios_id || item.id || item.id_usuario;
    return Number(posibleId) || 0;
  };

  useEffect(() => {
    fetchCatalogos();
  }, []);

  const fetchCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.estado === 'success' || data.usuarios) {
        setCategorias(data.categorias || []);
        setMarcas(data.marcas || []);
        setModelos(data.modelos || []);
        
        let listaUsuarios = data.usuarios || [];
        setUsuarios(listaUsuarios);
        if (listaUsuarios.length > 0) {
          const primerId = obtenerIdUsuario(listaUsuarios[0]);
          if (primerId > 0) setUsuarioSeleccionado(primerId);
        }

        const formasPagoCargadas = data.formas_pago || [];
        setFormasPago(formasPagoCargadas);

        if (formasPagoCargadas.length > 0) {
          setPagosSeleccionados([
            { 
              forma_pago_id: Number(formasPagoCargadas[0].formas_pago_id || formasPagoCargadas[0].forma_pago_id || 1), 
              nombre: formasPagoCargadas[0].nombre, 
              monto: '' 
            }
          ]);
        } else {
          setPagosSeleccionados([{ forma_pago_id: 1, nombre: 'Efectivo', monto: '' }]);
        }
      }
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
      Alert.alert('Aviso', 'No se pudieron cargar los catálogos o usuarios.');
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const seleccionarFotosGaleria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Se necesitan permisos para acceder a la galería.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets) {
      const nuevasUris = resultado.assets.map(asset => asset.uri);
      setFotosDispositivo(prev => [...prev, ...nuevasUris]);
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
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
      setFotosDispositivo(prev => [...prev, resultado.assets[0].uri]);
    }
  };

  const eliminarFoto = (index: number) => {
    setFotosDispositivo(prev => prev.filter((_, i) => i !== index));
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = busquedaUsuario.toLowerCase();
    const nombreCompleto = `${u.nombre} ${u.apellido || ''}`.toLowerCase();
    const dniStr = String(u.dni_cuit || '').toLowerCase();
    return nombreCompleto.includes(texto) || dniStr.includes(texto);
  });

  const modificarCantidad = (servicios_id: number, operacion: 'sumar' | 'restar') => {
    setServiciosCarrito((prev) =>
      prev
        .map((item) => {
          if (item.servicios_id === servicios_id) {
            const nuevaCantidad = operacion === 'sumar' ? (item.cantidad || 1) + 1 : (item.cantidad || 1) - 1;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean) as ItemServicio[]
    );
  };

  const actualizarObservacionItem = (servicios_id: number, texto: string) => {
    setServiciosCarrito((prev) =>
      prev.map((item) => 
        item.servicios_id === servicios_id ? { ...item, observacionesItem: texto } : item
      )
    );
  };

  const calcularTotal = () => {
    return serviciosCarrito.reduce((acc, item) => {
      const precio = Number(item.precio_venta) || Number(item.costo) || 0;
      return acc + (precio * (item.cantidad || 1));
    }, 0);
  };

  const agregarMetodoPago = () => {
    const idPorDefecto = formasPago.length > 0 ? Number(formasPago[0].formas_pago_id || formasPago[0].formas_pago_id || 1) : 1;
    const nombrePorDefecto = formasPago.length > 0 ? formasPago[0].nombre : 'Efectivo';
    setPagosSeleccionados([...pagosSeleccionados, { forma_pago_id: idPorDefecto, nombre: nombrePorDefecto, monto: '' }]);
  };

  const eliminarMetodoPago = (index: number) => {
    if (pagosSeleccionados.length === 1) {
      Alert.alert('Atención', 'Debe haber al menos un método de pago.');
      return;
    }
    const nuevosPagos = pagosSeleccionados.filter((_, i) => i !== index);
    setPagosSeleccionados(nuevosPagos);
  };

  const actualizarMontoPago = (index: number, monto: string) => {
    const nuevosPagos = [...pagosSeleccionados];
    nuevosPagos[index].monto = monto;
    setPagosSeleccionados(nuevosPagos);
  };

  const actualizarTipoPago = (index: number, idString: string) => {
    const idNum = Number(idString);
    const metodoEncontrado = formasPago.find(p => Number(p.formas_pago_id || p.formas_pago_id) === idNum);
    const nombreMetodo = metodoEncontrado ? metodoEncontrado.nombre : '';

    const nuevosPagos = [...pagosSeleccionados];
    nuevosPagos[index].forma_pago_id = idNum;
    nuevosPagos[index].nombre = nombreMetodo;
    setPagosSeleccionados(nuevosPagos);
  };

  const validarPagos = (totalVenta: number) => {
    const sumaPagos = pagosSeleccionados.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
    if (Math.abs(sumaPagos - totalVenta) > 0.05) {
      Alert.alert('Error en pagos', `La suma de los pagos ($${sumaPagos.toFixed(2)}) no coincide con el total de la orden ($${totalVenta.toFixed(2)}).`);
      return false;
    }
    return true;
  };

  const eliminarServicio = (servicios_id: number) => {
    const nuevoCarrito = serviciosCarrito.filter((item) => item.servicios_id !== servicios_id);
    setServiciosCarrito(nuevoCarrito);
  };

  // Función XMLHttpRequest compatible para enviar datos y múltiples imágenes de forma segura en Expo
  const enviarOrdenConXHR = (formData: FormData): Promise<any> => {
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
      xhr.onerror = () => reject(new Error('Error de conexión con el servidor'));
      xhr.send(formData);
    });
  };

  const procesarOrdenReparacion = async (usuarioIdOverride?: number) => {
    const targetUsuarioId = usuarioIdOverride || usuarioSeleccionado;

    if (!targetUsuarioId || isNaN(targetUsuarioId) || targetUsuarioId === 0) {
      Alert.alert('Faltan datos', 'Por favor selecciona o registra un cliente de la lista.');
      return;
    }

    if (!categoriaEquipoId || !marcaEquipoId || !modeloEquipoId) {
      Alert.alert('Faltan datos', 'Selecciona la categoría, marca y modelo del equipo.');
      return;
    }

    if (serviciosCarrito.length === 0) {
      Alert.alert('Carrito vacío', 'No hay servicios en el carrito para procesar.');
      return;
    }

    const totalVenta = calcularTotal();
    if (!validarPagos(totalVenta)) return;

    try {
      setLoadingEnvio(true);

      const formData = new FormData();
      formData.append('empleado_id', String(empleadoId));
      formData.append('usuario_id', String(targetUsuarioId));
      formData.append('total', totalVenta.toFixed(2));
      formData.append('tipo_entrega', tipoEntrega);
      formData.append('pagos', JSON.stringify(pagosSeleccionados.map(p => ({
        forma_pago_id: p.forma_pago_id,
        monto: Number(p.monto)
      }))));
      formData.append('servicios', JSON.stringify(serviciosCarrito.map(item => ({
        servicios_id: item.servicios_id,
        cantidad: item.cantidad || 1,
        precio_unitario: Number(item.precio_venta) || Number(item.costo) || 0,
        subtotal: (Number(item.precio_venta) || Number(item.costo) || 0) * (item.cantidad || 1),
        observaciones: item.observacionesItem || ''
      }))));
      formData.append('equipo', JSON.stringify({
        categoria_equipo_id: Number(categoriaEquipoId),
        marca_equipo_id: Number(marcaEquipoId),
        modelo_equipo_id: Number(modeloEquipoId),
        numero_serie: numeroSerie.trim() || null,
        imei: imei.trim() || null,
        diagnostico_cliente: diagnosticoCliente.trim()
      }));

      // Adjuntar las fotos seleccionadas al FormData
      fotosDispositivo.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `foto_dispositivo_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('fotos[]', {
          uri,
          name: filename,
          type,
        } as any);
      });

      const data = await enviarOrdenConXHR(formData);

      if (data.estado === 'success') {
        const ordenIdGenerada = data.orden_id || data.id || 'N/D';
        
        router.replace({
          pathname: './comprobante' as any,
          params: {
            ordenId: String(ordenIdGenerada),
            empleadoId: String(empleadoId),
            usuarioId: String(targetUsuarioId),
            carrito: JSON.stringify(serviciosCarrito),
            total: String(totalVenta),
            categoriaEquipoId: String(categoriaEquipoId),
            marcaEquipoId: String(marcaEquipoId),
            modeloEquipoId: String(modeloEquipoId),
            numeroSerie: String(numeroSerie),
            imei: String(imei),
            diagnosticoCliente: String(diagnosticoCliente),
            fecha: new Date().toLocaleString()
          }
        });
      } else {
        Alert.alert('Error', data.mensaje || 'No se pudo registrar la orden en el servidor.');
      }

    } catch (err) {
      console.error('Error al enviar la orden:', err);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoadingEnvio(false);
    }
  };

  const registrarOrdenConUsuarioNuevo = async () => {
    if (!nuevoNombre.trim() || !nuevoDni.trim() || !nuevoTelefono.trim() || !nuevoEmail.trim()) {
      Alert.alert('Atención', 'Complete Nombre, DNI/CUIT, Teléfono y Correo.');
      return;
    }

    if (!categoriaEquipoId || !marcaEquipoId || !modeloEquipoId) {
      Alert.alert('Faltan datos', 'Selecciona la categoría, marca y modelo del equipo.');
      return;
    }

    if (serviciosCarrito.length === 0) {
      Alert.alert('Carrito vacío', 'No hay servicios en el carrito para procesar.');
      return;
    }

    const totalVenta = calcularTotal();
    if (!validarPagos(totalVenta)) return;

    setLoadingEnvio(true);

    try {
      const formData = new FormData();
      formData.append('empleado_id', String(empleadoId));
      formData.append('usuario_id', '');
      formData.append('total', totalVenta.toFixed(2));
      formData.append('tipo_entrega', tipoEntrega);
      formData.append('pagos', JSON.stringify(pagosSeleccionados.map(p => ({
        forma_pago_id: p.forma_pago_id,
        monto: Number(p.monto)
      }))));
      formData.append('servicios', JSON.stringify(serviciosCarrito.map(item => ({
        servicios_id: item.servicios_id,
        cantidad: item.cantidad || 1,
        precio_unitario: Number(item.precio_venta) || Number(item.costo) || 0,
        subtotal: (Number(item.precio_venta) || Number(item.costo) || 0) * (item.cantidad || 1),
        observaciones: item.observacionesItem || ''
      }))));
      formData.append('equipo', JSON.stringify({
        categoria_equipo_id: Number(categoriaEquipoId),
        marca_equipo_id: Number(marcaEquipoId),
        modelo_equipo_id: Number(modeloEquipoId),
        numero_serie: numeroSerie.trim() || null,
        imei: imei.trim() || null,
        diagnostico_cliente: diagnosticoCliente.trim()
      }));
      formData.append('nuevo_usuario', JSON.stringify({
        nombre: nuevoNombre,
        apellido: nuevoApellido,
        dni_cuit: Number(nuevoDni),
        email: nuevoEmail,
        telefono: nuevoTelefono,
        direccion: nuevoDireccion || 'Sin dirección',
        localidad: nuevoLocalidad || 'Sin localidad',
        username: nuevoUsername.trim() || nuevoNombre.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
        password: '123'
      }));

      fotosDispositivo.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `foto_dispositivo_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('fotos[]', {
          uri,
          name: filename,
          type,
        } as any);
      });

      const resultado = await enviarOrdenConXHR(formData);

      if (resultado.estado === 'success') {
        setModalVisible(false);
        const ordenIdGenerada = resultado.orden_id || resultado.id || 'N/D';
        const nuevoIdCreado = resultado.usuario_id || 0;

        router.replace({
          pathname: './comprobante' as any,
          params: {
            ordenId: String(ordenIdGenerada),
            empleadoId: String(empleadoId),
            usuarioId: String(nuevoIdCreado),
            carrito: JSON.stringify(serviciosCarrito),
            total: String(totalVenta),
            categoriaEquipoId: String(categoriaEquipoId),
            marcaEquipoId: String(marcaEquipoId),
            modeloEquipoId: String(modeloEquipoId),
            numeroSerie: String(numeroSerie),
            imei: String(imei),
            diagnosticoCliente: String(diagnosticoCliente),
            fecha: new Date().toLocaleString()
          }
        });
      } else {
        Alert.alert('Error', resultado.mensaje || 'No se pudo registrar la orden.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error de conexión', 'No se pudo conectar.');
    } finally {
      setLoadingEnvio(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.title}>Recepción de Taller</Text>
      </View>

      <View style={styles.seccionCliente}>
        <View style={styles.clienteHeaderRow}>
          <Text style={styles.labelCliente}>
            Cliente: {usuarioSeleccionado ? <Text style={{color: '#166534', fontWeight: 'bold'}}>ID [{usuarioSeleccionado}]</Text> : <Text style={{color: '#DC2626'}}>Ninguno</Text>}
          </Text>
          <TouchableOpacity style={styles.btnNuevoCliente} onPress={() => setModalVisible(true)}>
            <Ionicons name="person-add" size={14} color="#fff" />
            <Text style={styles.btnNuevoClienteText}> Nuevo</Text>
          </TouchableOpacity>
        </View>

        {loadingCatalogos ? (
          <ActivityIndicator color="#2563EB" style={{ marginVertical: 10 }} />
        ) : (
          <View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={16} color="#64748B" style={styles.searchIcon} />
              <TextInput
                style={styles.searchUser}
                placeholder="Buscar por nombre o DNI..."
                placeholderTextColor="#64748B"
                value={busquedaUsuario}
                onChangeText={setBusquedaUsuario}
              />
            </View>
            <FlatList
              data={usuariosFiltrados}
              keyExtractor={(item, index) => {
                const id = obtenerIdUsuario(item);
                return id > 0 ? id.toString() : index.toString();
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const currentId = Number(obtenerIdUsuario(item));
                const isSelected = Number(usuarioSeleccionado) === currentId;
                return (
                  <TouchableOpacity
                    style={[styles.userChip, isSelected && styles.userChipSelected]}
                    onPress={() => {
                      if (currentId > 0) setUsuarioSeleccionado(currentId);
                    }}
                  >
                    <Text style={[styles.userChipText, isSelected && styles.userChipTextSelected]} numberOfLines={1}>
                      {item.nombre} {item.apellido || ''}
                    </Text>
                    <Text style={[styles.userChipSubText, isSelected && {color: '#FFFFFF'}]}>
                      DNI: {item.dni_cuit}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
              ListEmptyComponent={
                <Text style={styles.emptyUserText}>No se encontró el cliente.</Text>
              }
            />
          </View>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Método de Retiro / Entrega</Text>
        <View style={styles.rowEntrega}>
          <TouchableOpacity 
            style={[styles.btnEntregaOpcion, tipoEntrega === 'sucursal' && styles.btnEntregaSelected]}
            onPress={() => setTipoEntrega('sucursal')}
          >
            <Text style={[styles.textEntregaOpcion, tipoEntrega === 'sucursal' && { color: '#fff', fontWeight: 'bold' }]}>
              Retiro en Sucursal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnEntregaOpcion, tipoEntrega === 'envio' && styles.btnEntregaSelected]}
            onPress={() => setTipoEntrega('envio')}
          >
            <Text style={[styles.textEntregaOpcion, tipoEntrega === 'envio' && { color: '#fff', fontWeight: 'bold' }]}>
              Envío por Paquetería
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Especificaciones del Equipo</Text>

        {!loadingCatalogos && (
          <>
            <Text style={styles.inputLabel}>Categoría de Equipo:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={categoriaEquipoId}
                onValueChange={(itemValue) => setCategoriaEquipoId(itemValue)}
                style={styles.picker}
                dropdownIconColor="#0F172A"
              >
                <Picker.Item label="Seleccione una categoría..." value="" color="#64748B" />
                {categorias.map((cat) => (
                  <Picker.Item key={cat.categoria_equipo_id} label={cat.nombre} value={String(cat.categoria_equipo_id)} color="#0F172A" />
                ))}
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Marca:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={marcaEquipoId}
                onValueChange={(itemValue) => setMarcaEquipoId(itemValue)}
                style={styles.picker}
                dropdownIconColor="#0F172A"
              >
                <Picker.Item label="Seleccione una marca..." value="" color="#64748B" />
                {marcas.map((mar) => (
                  <Picker.Item key={mar.marca_equipo_id} label={mar.nombre} value={String(mar.marca_equipo_id)} color="#0F172A" />
                ))}
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Modelo:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={modeloEquipoId}
                onValueChange={(itemValue) => setModeloEquipoId(itemValue)}
                style={styles.picker}
                dropdownIconColor="#0F172A"
              >
                <Picker.Item label="Seleccione un modelo..." value="" color="#64748B" />
                {modelos.map((mod) => (
                  <Picker.Item key={mod.modelo_equipo_id} label={mod.nombre} value={String(mod.modelo_equipo_id)} color="#0F172A" />
                ))}
              </Picker>
            </View>
          </>
        )}

        <Text style={styles.inputLabel}>Número de Serie:</Text>
        <TextInput
          style={styles.input}
          placeholder="Opcional"
          placeholderTextColor="#64748B"
          value={numeroSerie}
          onChangeText={setNumeroSerie}
        />

        <Text style={styles.inputLabel}>IMEI:</Text>
        <TextInput
          style={styles.input}
          placeholder="Opcional (para celulares)"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          value={imei}
          onChangeText={setImei}
        />

        <Text style={styles.inputLabel}>Diagnóstico del Cliente / Falla:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ej: No enciende, pantalla rota..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={3}
          value={diagnosticoCliente}
          onChangeText={setDiagnosticoCliente}
        />

        {/* 📸 Sección para fotos del estado del dispositivo */}
        <Text style={styles.inputLabel}>Fotos del Estado del Dispositivo:</Text>
        <View style={styles.imageButtonsRow}>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={seleccionarFotosGaleria}>
            <Ionicons name="images-outline" size={16} color="#2563EB" />
            <Text style={styles.imagePickerBtnText}> Galería</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={tomarFotoCamara}>
            <Ionicons name="camera-outline" size={16} color="#2563EB" />
            <Text style={styles.imagePickerBtnText}> Cámara</Text>
          </TouchableOpacity>
        </View>

        {fotosDispositivo.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {fotosDispositivo.map((uri, index) => (
                <View key={index} style={styles.previewContainer}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.deletePhotoBtn} onPress={() => eliminarFoto(index)}>
                    <Ionicons name="close-circle" size={20} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>Servicios en Carrito ({serviciosCarrito.length})</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.agregarMasText}>+ Agregar más</Text>
          </TouchableOpacity>
        </View>

        {serviciosCarrito.length === 0 ? (
          <Text style={styles.emptyText}>No hay servicios agregados.</Text>
        ) : (
          serviciosCarrito.map((item, index) => {
            const precioItem = Number(item.precio_venta) || Number(item.costo) || 0;
            return (
              <View key={item.servicios_id ? item.servicios_id.toString() : index.toString()} style={styles.carritoCard}>
                <View style={styles.carritoRowTop}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.itemNombre}>{item.nombre}</Text>
                    <Text style={styles.itemPrecio}>${precioItem.toFixed(2)} c/u</Text>
                  </View>

                  <View style={styles.cantidadContenedor}>
                    <TouchableOpacity style={styles.btnQty} onPress={() => modificarCantidad(item.servicios_id, 'restar')}>
                      <Text style={styles.btnQtyText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.cantidadText}>{item.cantidad || 1}</Text>
                    <TouchableOpacity style={styles.btnQty} onPress={() => modificarCantidad(item.servicios_id, 'sumar')}>
                      <Text style={styles.btnQtyText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TextInput
                  style={styles.inputObservacionItem}
                  placeholder="Observación opcional para este servicio..."
                  placeholderTextColor="#64748B"
                  value={item.observacionesItem}
                  onChangeText={(text) => actualizarObservacionItem(item.servicios_id, text)}
                />

                <TouchableOpacity onPress={() => eliminarServicio(item.servicios_id)} style={styles.deleteButtonRow}>
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  <Text style={styles.deleteButtonText}>Quitar servicio</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      {serviciosCarrito.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.pagoHeaderRow}>
            <Text style={styles.sectionTitle}>Método(s) de Pago</Text>
            <TouchableOpacity style={styles.btnAddPago} onPress={agregarMetodoPago}>
              <Ionicons name="add" size={14} color="#fff" />
              <Text style={styles.btnAddPagoText}> Agregar Pago</Text>
            </TouchableOpacity>
          </View>

          {pagosSeleccionados.map((pago, index) => (
            <View key={index} style={styles.pagoRowCard}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={String(pago.forma_pago_id)}
                  onValueChange={(itemValue) => actualizarTipoPago(index, itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#0F172A"
                >
                  {formasPago.map((fp) => {
                    const idVal = Number(fp.formas_pago_id || fp.formas_pago_id);
                    return (
                      <Picker.Item 
                        key={idVal} 
                        label={fp.nombre} 
                        value={String(idVal)} 
                        color="#0F172A" 
                      />
                    );
                  })}
                </Picker>
              </View>

              <View style={styles.pagoInputRow}>
                <TextInput
                  style={styles.inputMonto}
                  placeholder="Monto"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={pago.monto}
                  onChangeText={(val) => actualizarMontoPago(index, val)}
                />
                {pagosSeleccionados.length > 1 && (
                  <TouchableOpacity onPress={() => eliminarMetodoPago(index)} style={styles.btnEliminarPago}>
                    <Ionicons name="trash" size={18} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {serviciosCarrito.length > 0 && (
        <View style={styles.footerContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimado:</Text>
            <Text style={styles.totalValue}>${calcularTotal().toFixed(2)}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.btnConfirmar, loadingEnvio && { opacity: 0.7 }]} 
            onPress={() => procesarOrdenReparacion()}
            disabled={loadingEnvio}
          >
            {loadingEnvio ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnConfirmarText}>Registrar Orden de Reparación</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Nuevo Cliente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCloseModal}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput style={styles.inputModal} placeholder="Nombre *" placeholderTextColor="#64748B" value={nuevoNombre} onChangeText={setNuevoNombre} />
              <TextInput style={styles.inputModal} placeholder="Apellido" placeholderTextColor="#64748B" value={nuevoApellido} onChangeText={setNuevoApellido} />
              <TextInput style={styles.inputModal} placeholder="DNI / CUIT *" placeholderTextColor="#64748B" keyboardType="numeric" value={nuevoDni} onChangeText={setNuevoDni} />
              <TextInput style={styles.inputModal} placeholder="Teléfono *" placeholderTextColor="#64748B" keyboardType="phone-pad" value={nuevoTelefono} onChangeText={setNuevoTelefono} />
              <TextInput style={styles.inputModal} placeholder="Correo Electrónico *" placeholderTextColor="#64748B" keyboardType="email-address" autoCapitalize="none" value={nuevoEmail} onChangeText={setNuevoEmail} />
              <TextInput style={styles.inputModal} placeholder="Dirección" placeholderTextColor="#64748B" value={nuevoDireccion} onChangeText={setNuevoDireccion} />
              <TextInput style={styles.inputModal} placeholder="Localidad" placeholderTextColor="#64748B" value={nuevoLocalidad} onChangeText={setNuevoLocalidad} />

              <TouchableOpacity 
                style={[styles.btnGuardarCliente, loadingEnvio && { opacity: 0.6 }]} 
                onPress={registrarOrdenConUsuarioNuevo}
                disabled={loadingEnvio}
              >
                {loadingEnvio ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnGuardarClienteText}>Crear Usuario y Registrar Orden</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 10, gap: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  seccionCliente: { marginBottom: 16, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  clienteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  labelCliente: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  btnNuevoCliente: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnNuevoClienteText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 10, paddingHorizontal: 10 },
  searchIcon: { marginRight: 6 },
  searchUser: { flex: 1, color: '#0F172A', paddingVertical: 9, fontSize: 13 },
  userChip: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, justifyContent: 'center', borderWidth: 1, borderColor: '#CBD5E1', minWidth: 130 },
  userChipSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  userChipText: { color: '#334155', fontSize: 13, fontWeight: 'bold' },
  userChipTextSelected: { color: '#fff', fontWeight: 'bold' },
  userChipSubText: { color: '#64748B', fontSize: 11 },
  emptyUserText: { color: '#64748B', fontSize: 12, fontStyle: 'italic', paddingVertical: 4 },
  sectionCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  sectionTitle: { color: '#0F172A', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  inputLabel: { color: '#64748B', fontSize: 12, marginBottom: 4, marginTop: 8, fontWeight: '600' },
  input: { backgroundColor: '#F8FAFC', color: '#0F172A', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, fontSize: 13, borderWidth: 1, borderColor: '#CBD5E1' },
  textArea: { height: 70, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', overflow: 'hidden' },
  picker: { color: '#0F172A', height: 50 },
  imageButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  imagePickerBtn: { flex: 1, backgroundColor: '#E8F0FE', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE', flexDirection: 'row', justifyContent: 'center' },
  imagePickerBtnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 13 },
  previewContainer: { position: 'relative', width: 70, height: 70 },
  previewImage: { width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  deletePhotoBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FFFFFF', borderRadius: 10 },
  agregarMasText: { color: '#2563EB', fontWeight: 'bold', fontSize: 13 },
  carritoCard: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  carritoRowTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  itemNombre: { color: '#0F172A', fontSize: 14, fontWeight: 'bold' },
  itemPrecio: { color: '#166534', fontSize: 12, marginTop: 2, fontWeight: '600' },
  cantidadContenedor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnQty: { backgroundColor: '#E2E8F0', width: 26, height: 26, justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
  btnQtyText: { color: '#0F172A', fontSize: 14, fontWeight: 'bold' },
  cantidadText: { color: '#0F172A', fontSize: 14, fontWeight: 'bold' },
  inputObservacionItem: { backgroundColor: '#FFFFFF', color: '#0F172A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, fontSize: 12, borderWidth: 1, borderColor: '#CBD5E1', marginTop: 6 },
  deleteButtonRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  deleteButtonText: { color: '#DC2626', fontSize: 11, fontWeight: '600' },
  emptyText: { color: '#64748B', fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 6 },
  pagoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  btnAddPago: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnAddPagoText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  pagoRowCard: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
  pagoInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputMonto: { flex: 1, backgroundColor: '#FFFFFF', color: '#0F172A', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, fontSize: 13, borderWidth: 1, borderColor: '#CBD5E1' },
  btnEliminarPago: { padding: 4 },
  footerContainer: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { color: '#64748B', fontSize: 15, fontWeight: '600' },
  totalValue: { color: '#166534', fontSize: 18, fontWeight: 'bold' },
  btnConfirmar: { backgroundColor: '#2563EB', padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  btnConfirmarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.55)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.15, shadowRadius: 16, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: '#0F172A', fontSize: 17, fontWeight: 'bold' },
  btnCloseModal: { padding: 4 },
  inputModal: { backgroundColor: '#F8FAFC', color: '#0F172A', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, fontSize: 13, marginBottom: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  btnGuardarCliente: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnGuardarClienteText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  rowEntrega: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnEntregaOpcion: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  btnEntregaSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  textEntregaOpcion: { color: '#64748B', fontSize: 12, fontWeight: '500' }
});