import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Producto {
  productos_id: number;
  nombre: string;
  descripcion: string;
  precio_venta: string;
  garantia: number;
  observaciones: string;
  categoria: string;
  marca: string;
  modelo: string;
  codigo_barra: string;
  imagen?: string;
  estado_general_id: number;
}

export interface ItemCarrito extends Producto {
  cantidad: number;
}

export default function ProductosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const empleadoId = params.empleadoId ? Number(params.empleadoId) : 1;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/recepcionista/productos.php`);
      const data = await response.json();

      if (data.estado === 'success') {
        setProductos(data.datos);
        setProductosFiltrados(data.datos);
      } else {
        setError(data.mensaje || 'Error al cargar productos');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (texto: string) => {
    setBusqueda(texto);
    if (texto.trim() === '') {
      setProductosFiltrados(productos);
    } else {
      const textoMinuscula = texto.toLowerCase();
      const filtrados = productos.filter((item) => {
        return (
          item.nombre?.toLowerCase().includes(textoMinuscula) ||
          item.marca?.toLowerCase().includes(textoMinuscula) ||
          item.modelo?.toLowerCase().includes(textoMinuscula) ||
          item.categoria?.toLowerCase().includes(textoMinuscula) ||
          item.codigo_barra?.toLowerCase().includes(textoMinuscula)
        );
      });
      setProductosFiltrados(filtrados);
    }
  };

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prevCarrito) => {
      const existe = prevCarrito.find((item) => item.productos_id === producto.productos_id);
      if (existe) {
        return prevCarrito.map((item) =>
          item.productos_id === producto.productos_id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prevCarrito, { ...producto, cantidad: 1 }];
      }
    });
  };

  const renderItem = ({ item }: { item: Producto }) => {
    const imageUrl = item.imagen 
      ? `${process.env.EXPO_PUBLIC_API_URL}/uploads/productos/${item.imagen}`
      : null;

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8}
        onPress={() => agregarAlCarrito(item)}
      >
        <View style={styles.cardMainContent}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.productoImagen} />
          ) : (
            <View style={[styles.productoImagen, styles.sinImagenContainer]}>
              <Text style={styles.sinImagenText}>Sin foto</Text>
            </View>
          )}

          <View style={styles.cardContentRight}>
            <View style={styles.cardHeader}>
              <Text style={styles.productoNombre}>{item.nombre}</Text>
              <Text style={styles.productoPrecio}>${Number(item.precio_venta).toFixed(2)}</Text>
            </View>

            <Text style={styles.productoDesc} numberOfLines={2}>{item.descripcion || 'Sin descripción'}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.badge}>{item.marca || 'Sin Marca'}</Text>
          <Text style={styles.badge}>{item.modelo || 'Sin Modelo'}</Text>
          <Text style={styles.badgeCategory}>{item.categoria || 'General'}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.subtext}>Código: {item.codigo_barra || 'N/A'}</Text>
          <Text style={styles.subtextAction}>+ Toca para agregar</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de Productos</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre, marca, modelo, categoría..."
        placeholderTextColor="#64748B"
        value={busqueda}
        onChangeText={handleSearch}
      />

      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.productos_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron productos.</Text>
          </View>
        }
      />

      {carrito.length > 0 && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => 
            router.push({
              pathname: '/recepcionista/carrito',
              params: { 
                carritoInicial: JSON.stringify(carrito), 
                empleadoId: empleadoId 
              }
            })
          }
        >
          <Ionicons name="cart" size={24} color="#fff" />
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{cantidadTotal}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, textAlign: 'center' },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: 14,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  listContainer: { paddingBottom: 80 },
  centered: { flex: 1, backgroundColor: '#F4F6FA', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#64748B', marginTop: 10, fontSize: 14 },
  errorText: { color: '#DC2626', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardMainContent: { flexDirection: 'row', marginBottom: 8 },
  productoImagen: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F1F5F9', marginRight: 12 },
  sinImagenContainer: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
  sinImagenText: { color: '#64748B', fontSize: 10 },
  cardContentRight: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  productoNombre: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', flex: 1, marginRight: 8 },
  productoPrecio: { fontSize: 15, fontWeight: 'bold', color: '#166534' },
  productoDesc: { fontSize: 13, color: '#64748B', marginBottom: 6 },
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  badge: { backgroundColor: '#F1F5F9', color: '#334155', fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  badgeCategory: { backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden', fontWeight: '600', borderWidth: 1, borderColor: '#BFDBFE' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  subtext: { fontSize: 11, color: '#64748B' },
  subtextAction: { fontSize: 11, color: '#2563EB', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#64748B', fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2563EB',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  badgeContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#2563EB', fontSize: 11, fontWeight: 'bold' },
});