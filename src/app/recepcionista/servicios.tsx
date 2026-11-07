import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Servicio {
  servicios_id: number;
  nombre: string;
  descripcion: string;
  categorias_servicios_id: number;
  categoria?: string;
  fecha_registro: string;
  costo: string | number;
  estado_general_id: number;
}

export default function ServiciosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const empleadoId = params.empleadoId ? Number(params.empleadoId) : 1;
  const carritoActual = params.carrito ? JSON.parse(params.carrito as string) : [];

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>('');
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/recepcionista/servicios.php`);
      const data = await response.json();
      
      let listaServicios = [];
      if (Array.isArray(data)) {
        listaServicios = data;
      } else if (data.datos && Array.isArray(data.datos)) {
        listaServicios = data.datos;
      } else if (data.servicios && Array.isArray(data.servicios)) {
        listaServicios = data.servicios;
      }

      setServicios(listaServicios);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeleccionServicio = (id: number) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(sId => sId !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  };

  const enviarAlCarrito = () => {
    if (seleccionados.length === 0) {
      Alert.alert('Atención', 'Selecciona al menos un servicio.');
      return;
    }

    const serviciosSeleccionados = servicios
      .filter(s => seleccionados.includes(s.servicios_id))
      .map(s => ({
        ...s,
        esServicio: true, 
        productos_id: 0, 
        precio_venta: s.costo,
        cantidad: 1,
        observacionesItem: ''
      }));

    const carritoCombinado = [...carritoActual, ...serviciosSeleccionados];

    router.push({
      pathname: './carrito_servicios', 
      params: {
        carritoInicial: JSON.stringify(carritoCombinado),
        empleadoId: String(empleadoId)
      }
    });
  };

  const serviciosFiltrados = servicios.filter(item => 
    item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderItemServicio = ({ item }: { item: Servicio }) => {
    const costoNumerico = Number(item.costo) || 0;
    const estaSeleccionado = seleccionados.includes(item.servicios_id);

    return (
      <TouchableOpacity 
        style={[styles.card, estaSeleccionado && styles.cardSelected]} 
        onPress={() => toggleSeleccionServicio(item.servicios_id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons 
                name={estaSeleccionado ? "checkbox" : "square-outline"} 
                size={20} 
                color={estaSeleccionado ? "#2563EB" : "#64748B"} 
              />
              <Text style={styles.nombreServicio}>{item.nombre}</Text>
            </View>
            <Text style={styles.categoriaText}>
              Categoría ID: {item.categorias_servicios_id} {item.categoria ? `- ${item.categoria}` : ''}
            </Text>
          </View>
          <View style={styles.precioBadge}>
            <Text style={styles.precioText}>${costoNumerico.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.descripcionServicio} numberOfLines={2}>
          {item.descripcion || 'Sin descripción detallada.'}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfoItem}>
            <Ionicons name="calendar-outline" size={13} color="#64748B" />
            <Text style={styles.footerInfoText}> Reg: {item.fecha_registro || 'N/D'}</Text>
          </View>
          
          <View style={styles.footerInfoItem}>
            <Ionicons 
              name={item.estado_general_id === 1 ? "checkmark-circle-outline" : "close-circle-outline"} 
              size={13} 
              color={item.estado_general_id === 1 ? "#166534" : "#DC2626"} 
            />
            <Text style={[styles.footerInfoText, { color: item.estado_general_id === 1 ? "#166534" : "#DC2626", fontWeight: '600' }]}>
              {item.estado_general_id === 1 ? ' Activo' : ' Inactivo'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccionar Servicios</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o descripción..."
          placeholderTextColor="#64748B"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>Cargando servicios...</Text>
        </View>
      ) : (
        <FlatList
          data={serviciosFiltrados}
          keyExtractor={(item) => item.servicios_id ? item.servicios_id.toString() : Math.random().toString()}
          renderItem={renderItemServicio}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="construct-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No se encontraron servicios registrados.</Text>
            </View>
          }
        />
      )}

      {seleccionados.length > 0 && (
        <View style={styles.footerAceptar}>
          <TouchableOpacity style={styles.btnAceptar} onPress={enviarAlCarrito}>
            <Text style={styles.btnAceptarText}>Añadir ({seleccionados.length}) al Carrito</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 16, marginTop: 10 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#0F172A', paddingVertical: 10, fontSize: 14 },

  listContainer: { gap: 12, paddingBottom: 80 },

  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  nombreServicio: { color: '#0F172A', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  categoriaText: { color: '#64748B', fontSize: 11, marginLeft: 28 },

  precioBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#BBF7D0' },
  precioText: { color: '#166534', fontSize: 15, fontWeight: 'bold' },

  descripcionServicio: { color: '#475569', fontSize: 13, marginBottom: 12, lineHeight: 18, marginLeft: 28 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8, alignItems: 'center', marginLeft: 28 },
  footerInfoItem: { flexDirection: 'row', alignItems: 'center' },
  footerInfoText: { color: '#64748B', fontSize: 12 },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#64748B', marginTop: 10, fontSize: 13 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { color: '#64748B', fontSize: 14, marginTop: 10 },

  footerAceptar: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  btnAceptar: { backgroundColor: '#2563EB', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 10, gap: 8, shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  btnAceptarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});