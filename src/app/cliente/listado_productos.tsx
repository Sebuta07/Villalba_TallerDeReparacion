import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { addToCart, getCartCount } from '../../store/cartStore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

export default function ListadoProductosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentUsuarioId = params.usuarioId ? Number(params.usuarioId) : 3;

  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [catSeleccionada, setCatSeleccionada] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para llevar la cuenta global del carrito
  const [carritoCount, setCarritoCount] = useState(0);
  const [mensajeToast, setMensajeToast] = useState<string | null>(null);

  useEffect(() => {
    fetchProductos();
    setCarritoCount(getCartCount());
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch(`${API_BASE}/cliente/listado_productos.php`);
      const json = await res.json();
      setProductos(json.productos || []);
      setCategorias(json.categorias || []);
    } catch (e) {
      // Datos de respaldo por si la API no está accesible temporalmente
      setCategorias([
        { id: 1, nombre: 'Repuestos' },
        { id: 2, nombre: 'Accesorios' }
      ]);
      setProductos([
        {
          id: 1,
          nombre: 'Módulo Display Samsung A04e',
          descripcion: 'Pantalla táctil y LCD de alta calidad con marco incluido.',
          precio_venta: 25000.00,
          stock: 5,
          categoria_id: 1,
          categoria_nombre: 'Repuestos',
          imagen: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=85'
        },
        {
          id: 2,
          nombre: 'Cable Carga Rápida Tipo C 3A',
          descripcion: 'Cable mallado de alta resistencia de 1 metro.',
          precio_venta: 4500.00,
          stock: 15,
          categoria_id: 2,
          categoria_nombre: 'Accesorios',
          imagen: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=85'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (producto: any) => {
    addToCart(producto);
    setCarritoCount(getCartCount());

    // Mostrar notificación flotante temporal
    setMensajeToast(`¡${producto.nombre} agregado!`);
    setTimeout(() => {
      setMensajeToast(null);
    }, 2000);
  };

  const productosFiltrados = productos.filter((prod) => {
    const coincideTexto =
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = catSeleccionada === null || prod.categoria_id === catSeleccionada;
    return coincideTexto && coincideCat;
  });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loaderText}>Cargando catálogo de productos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* CABECERA */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Catálogo de Productos</Text>
          <Text style={styles.subtitle}>Componentes y accesorios del taller</Text>
        </View>

        {/* BOTÓN ACCESO AL CARRITO */}
        <TouchableOpacity 
          style={styles.cartIconBtn} 
          onPress={() => router.push({ pathname: '/cliente/carrito' as any, params: { usuarioId: currentUsuarioId } })}
        >
          <Ionicons name="cart-outline" size={22} color="#38BDF8" />
          {carritoCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{carritoCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* NOTIFICACIÓN FLOTANTE (TOAST) */}
      {mensajeToast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={styles.toastText}>{mensajeToast}</Text>
        </View>
      )}

      {/* BARRA DE BÚSQUEDA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar repuestos, cables, pantallas..."
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

      {/* FILTROS POR CATEGORÍA */}
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

      {/* LISTADO DE PRODUCTOS */}
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#64748B" />
            <Text style={styles.emptyTitle}>No se encontraron productos</Text>
            <Text style={styles.emptySub}>Intenta con otra búsqueda o categoría</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imagen }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardBody}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{(item.categoria_nombre || 'PRODUCTO').toUpperCase()}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.priceLabel}>Precio</Text>
                  <Text style={styles.priceValue}>${Number(item.precio_venta || item.costo || 0).toLocaleString('es-AR')}</Text>
                </View>

                {/* BOTÓN AGREGAR AUTOMÁTICAMENTE */}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => agregarAlCarrito(item)}
                >
                  <Text style={styles.actionBtnText}>AGREGAR</Text>
                  <Ionicons name="cart" size={16} color="#fff" />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  cartIconBtn: { backgroundColor: '#0D1E42', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', position: 'relative' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#2563EB', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  toast: { position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: '#0D1E42', borderWidth: 1, borderColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 99, shadowColor: '#000', shadowOpacity: 0.3, elevation: 5 },
  toastText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
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