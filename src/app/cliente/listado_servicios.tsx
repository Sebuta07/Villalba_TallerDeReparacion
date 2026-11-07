import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

export default function ListadoServiciosScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  
  // Rescatar de forma global el usuarioId de la sesión activa
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : null;

  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [catSeleccionada, setCatSeleccionada] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    try {
      const res = await fetch(`${API_BASE}/cliente/listado_servicios.php`);
      const json = await res.json();
      if (json.estado === 'success') {
        setServicios(json.servicios || []);
        setCategorias(json.categorias || []);
      }
    } catch (e) {
      console.error('Error al conectar con la API de servicios:', e);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por búsqueda y categoría
  const serviciosFiltrados = servicios.filter((serv) => {
    const coincideTexto =
      serv.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      serv.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = catSeleccionada === null || serv.categoria_id === catSeleccionada;
    return coincideTexto && coincideCat;
  });

  const solicitarServicio = (servicio: any) => {
    router.push({
      pathname: '/cliente/solicitar_reparacion' as any,
      params: { 
        usuarioId: usuarioId, // Propagamos el usuarioId hacia la pantalla de solicitud
        servicioId: servicio.id, 
        servicioNombre: servicio.nombre 
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loaderText}>Cargando catálogo de servicios...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* CABECERA DE LA PANTALLA */}
      <View style={styles.header}>
        <Text style={styles.title}>Catálogo de Servicios</Text>
        <Text style={styles.subtitle}>Especialidades del laboratorio de microelectrónica</Text>
      </View>

      {/* BARRA DE BÚSQUEDA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar mantenimiento, módulo, limpieza..."
          placeholderTextColor="#94A3B8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* BOTONES DE FILTRO POR CATEGORÍA */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, catSeleccionada === null && styles.filterChipActive]}
          onPress={() => setCatSeleccionada(null)}
        >
          <Text style={[styles.filterChipText, catSeleccionada === null && styles.filterChipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterChip, catSeleccionada === cat.id && styles.filterChipActive]}
            onPress={() => setCatSeleccionada(catSeleccionada === cat.id ? null : cat.id)}
          >
            <Text style={[styles.filterChipText, catSeleccionada === cat.id && styles.filterChipTextActive]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTADO DE SERVICIOS */}
      <FlatList
        data={serviciosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={48} color="#64748B" />
            <Text style={styles.emptyTitle}>No se encontraron servicios</Text>
            <Text style={styles.emptySub}>Intenta con otra búsqueda o categoría</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imagen }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardBody}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.categoria_nombre.toUpperCase()}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardDesc}>{item.descripcion}</Text>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.priceLabel}>Precio estimado</Text>
                  <Text style={styles.priceValue}>${item.costo.toLocaleString('es-AR')}</Text>
                </View>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => solicitarServicio(item)}
                >
                  <Text style={styles.actionBtnText}>PEDIR TURNO</Text>
                  <Ionicons name="calendar-outline" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#071026' },
  loaderText: { color: '#CBD5E1', marginTop: 10, fontSize: 13, fontWeight: '600' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1E42',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#0D1E42',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#13161F',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardImage: { width: '100%', height: 130 },
  cardBody: { padding: 14 },
  categoryBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  categoryBadgeText: { color: '#38BDF8', fontSize: 9, fontWeight: '800' },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  cardDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginBottom: 14 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  priceLabel: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  priceValue: { color: '#10B981', fontSize: 16, fontWeight: '800' },
  actionBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptySub: { color: '#64748B', fontSize: 12, marginTop: 4 },
});