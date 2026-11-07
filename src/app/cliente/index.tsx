import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : 3;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filtroPromo, setFiltroPromo] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [usuarioId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/cliente/home.php?usuario_id=${usuarioId}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setData({
        usuario_logueado: { usuario_id: usuarioId, nombre: 'Cliente', apellido: 'Fénix', username: 'usuario' },
        categorias: [
          { id: 1, nombre: 'Pantallas' },
          { id: 2, nombre: 'Fundas' },
          { id: 3, nombre: 'Llaveros' }
        ],
        productos_destacados: [
          { id: 1, nombre: 'Llavero Pou', categoria: 'Accesorios', precio: 500, rating: '4.9 (50+)', specs: 'RE FACHERITO · EXCLUSIVO', badge_text: 'TALLER PRO', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=85' }
        ],
        promociones: [
          { tipo: 'productos', titulo: 'Módulos y Displays Originales', descripcion: 'Repuestos directos con garantía.', precio_viejo: 60000, precio_nuevo: 50000, badge: 'PROMO PRODUCTO · 15% OFF' }
        ],
        resenas: [
          { id_resena: 1, nombre_cliente: 'Noelia Jacquelin', calificacion: 5, comentario: 'Excelente precisión en el taller.' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    router.push({ pathname: '/cliente/tienda', params: { usuarioId, busqueda: searchQuery } });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loaderText}>Sincronizando Taller Fenix Lab...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoInitial}>F</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>FENIX LAB</Text>
              {data?.usuario_logueado && (
                <Text style={styles.welcomeUser}>Hola, {data.usuario_logueado.nombre}</Text>
              )}
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/cliente/notificaciones', params: { usuarioId } })} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color="#38BDF8" />
              <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push({ pathname: '/cliente/carrito', params: { usuarioId } })} style={styles.iconBtn}>
              <Ionicons name="cart-outline" size={20} color="#38BDF8" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push({ pathname: '/cliente/perfil', params: { usuarioId } })} style={styles.iconBtn}>
              <Ionicons name="person-outline" size={20} color="#38BDF8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* BUSCADOR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar repuestos, módulos, accesorios..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* HERO BANNER GAMER HUD */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>MICROELECTRÓNICA AVANZADA</Text>
          </View>
          <Text style={styles.heroTitle}>REPARACIÓN PROFESIONAL.{'\n'}<Text style={{ color: '#38BDF8' }}>GARANTÍA TÉCNICA.</Text></Text>
          <Text style={styles.heroDesc}>Diagnóstico con instrumental de precisión para celulares, notebooks y consolas en Formosa.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push({ pathname: '/cliente/solicitar_reparacion', params: { usuarioId } })}>
            <Text style={styles.btnPrimaryText}>SOLICITAR REPARACIÓN</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* LABORATORIO BANNER */}
        <View style={styles.labCard}>
          <Text style={styles.labKicker}>CONTROL DE TALLER</Text>
          <Text style={styles.labTitle}>Seguimiento en Tiempo Real</Text>
          <Text style={styles.labDesc}>Consultá el estado actual de tu orden de reparación y notas del técnico asignado.</Text>
          <View style={styles.labFooter}>
            <View>
              <Text style={styles.labStat}>Sistema Activo</Text>
              <Text style={styles.labSub}>MVC & MySQL Conectado</Text>
            </View>
            <TouchableOpacity style={styles.btnLab} onPress={() => router.push({ pathname: '/cliente/seguimiento', params: { usuarioId } })}>
              <Text style={styles.btnLabText}>VER ESTADO</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CATEGORÍAS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorías del Taller</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {data?.categorias?.map((cat: any, idx: number) => (
            <TouchableOpacity key={idx} style={styles.catItem} onPress={() => router.push({ pathname: '/cliente/tienda', params: { usuarioId } })}>
              <View style={styles.catCircle}>
                <Ionicons name="hardware-chip-outline" size={22} color="#38BDF8" />
              </View>
              <Text style={styles.catLabel}>{cat.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LO MÁS COMPRADO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Productos Destacados</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/cliente/tienda', params: { usuarioId } })}>
            <Text style={styles.viewAll}>Ver todo →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {data?.productos_destacados?.map((prod: any, idx: number) => (
            <View key={idx} style={styles.prodCard}>
              <View style={styles.prodBadge}><Text style={styles.prodBadgeText}>{prod.badge_text}</Text></View>
              <Image source={{ uri: prod.img }} style={styles.prodImg} resizeMode="contain" />
              <Text style={styles.prodName} numberOfLines={2}>{prod.nombre}</Text>
              <Text style={styles.prodRating}>★ {prod.rating}</Text>
              <Text style={styles.prodSpecs} numberOfLines={1}>{prod.specs}</Text>
              <View style={styles.prodFooter}>
                <Text style={styles.prodPrice}>${Number(prod.precio)?.toLocaleString('es-AR')}</Text>
                <TouchableOpacity style={styles.addCartBtn} onPress={() => router.push({ pathname: '/cliente/carrito', params: { usuarioId } })}>
                  <Ionicons name="cart" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* PROMOCIONES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Promociones Vigentes</Text>
        </View>
        <View style={styles.promoTabs}>
          {['todas', 'productos', 'servicios'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.promoTabBtn, filtroPromo === t && styles.promoTabActive]}
              onPress={() => setFiltroPromo(t)}
            >
              <Text style={[styles.promoTabText, filtroPromo === t && styles.promoTabTextActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {data?.promociones
          ?.filter((p: any) => filtroPromo === 'todas' || p.tipo === filtroPromo)
          .map((promo: any, idx: number) => (
            <View key={idx} style={styles.promoCard}>
              <Text style={styles.promoBadgeTop}>{promo.badge}</Text>
              <Text style={styles.promoTitle}>{promo.titulo}</Text>
              <Text style={styles.promoDesc}>{promo.descripcion}</Text>
              <View style={styles.promoPriceRow}>
                {promo.precio_viejo > 0 && <Text style={styles.promoOldPrice}>${promo.precio_viejo?.toLocaleString('es-AR')}</Text>}
                {promo.precio_nuevo > 0 && <Text style={styles.promoNewPrice}>${promo.precio_nuevo?.toLocaleString('es-AR')}</Text>}
              </View>
            </View>
          ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Opiniones de Clientes</Text>
        </View>
        {data?.resenas?.map((res: any, idx: number) => (
          <View key={idx} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewAuthor}>{res.nombre_cliente}</Text>
              <Text style={styles.reviewStars}>★★★★★</Text>
            </View>
            <Text style={styles.reviewText}>{res.comentario}</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#071026' },
  loaderText: { color: '#CBD5E1', marginTop: 10, fontSize: 13, fontWeight: '600' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#38BDF8' },
  logoInitial: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  brandTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  welcomeUser: { color: '#38BDF8', fontSize: 11, fontWeight: '700' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0D1E42', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#2563EB', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D1E42', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)', marginBottom: 16 },
  searchInput: { flex: 1, color: '#fff', fontSize: 13 },
  heroCard: { backgroundColor: '#0D1E42', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 },
  heroBadge: { backgroundColor: 'rgba(37, 99, 235, 0.25)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
  heroBadgeText: { color: '#38BDF8', fontSize: 10, fontWeight: 'bold' },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8, lineHeight: 22 },
  heroDesc: { color: '#CBD5E1', fontSize: 12, marginBottom: 14, lineHeight: 18 },
  btnPrimary: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 999, gap: 8 },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  labCard: { backgroundColor: '#13161F', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)', marginBottom: 16 },
  labKicker: { color: '#14E8B6', fontSize: 10, fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 },
  labTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  labDesc: { color: '#94A3B8', fontSize: 12, marginBottom: 14 },
  labFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 12 },
  labStat: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  labSub: { color: '#64748B', fontSize: 11 },
  btnLab: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnLabText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  viewAll: { color: '#38BDF8', fontSize: 12, fontWeight: 'bold' },
  catScroll: { marginBottom: 16 },
  catItem: { alignItems: 'center', marginRight: 16 },
  catCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#0D1E42', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)', marginBottom: 6 },
  catLabel: { color: '#CBD5E1', fontSize: 11, fontWeight: '600' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  prodCard: { width: (width - 44) / 2, backgroundColor: '#13161F', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  prodBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#2563EB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 1 },
  prodBadgeText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  prodImg: { width: '100%', height: 100, marginBottom: 8, borderRadius: 6 },
  prodName: { color: '#fff', fontSize: 13, fontWeight: 'bold', height: 36, marginBottom: 4 },
  prodRating: { color: '#F59E0B', fontSize: 11, marginBottom: 4 },
  prodSpecs: { color: '#64748B', fontSize: 9, marginBottom: 8 },
  prodFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prodPrice: { color: '#10B981', fontSize: 14, fontWeight: 'bold' },
  addCartBtn: { backgroundColor: '#2563EB', width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  promoTabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  promoTabBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#0D1E42', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  promoTabActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  promoTabText: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold' },
  promoTabTextActive: { color: '#fff' },
  promoCard: { backgroundColor: '#13161F', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  promoBadgeTop: { color: '#38BDF8', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  promoTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  promoDesc: { color: '#94A3B8', fontSize: 11, marginBottom: 8 },
  promoPriceRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  promoOldPrice: { color: '#64748B', fontSize: 12, textDecorationLine: 'line-through' },
  promoNewPrice: { color: '#10B981', fontSize: 15, fontWeight: 'bold' },
  reviewCard: { backgroundColor: '#13161F', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewAuthor: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  reviewStars: { color: '#F59E0B', fontSize: 12 },
  reviewText: { color: '#CBD5E1', fontSize: 12 }
});