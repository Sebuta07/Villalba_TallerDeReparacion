import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/fenix_lab/api_app';

export default function ComercioIndex() {
  const params = useLocalSearchParams();
  const comercioId = params.comercioId ? Number(params.comercioId) : 1;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroVentas, setFiltroVentas] = useState('');
  
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [reposiciones, setReposiciones] = useState<any[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);

  const cargarDatosComercio = async () => {
    try {
      const urlFinal = `${API_BASE}/comercio/dashboard_unificado.php?comercio_id=${comercioId}`;
      console.log('Consultando comercio en:', urlFinal);

      const res = await fetch(urlFinal);
      const text = await res.text();
      
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error('Error al parsear JSON:', text);
        return;
      }
      
      if (json.success) {
        setOrdenes(json.ordenes || []);
        setInventario(json.inventario || []);
        setReposiciones(json.reposiciones || []);
        setVentas(json.ventas || []);
      }
    } catch (error) {
      console.error('Error cargando datos de comercio:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatosComercio();
  };

  const formatMoneda = (monto: number) => {
    return `$ ${Number(monto || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const ventasFiltradas = ventas.filter((v) => 
    String(v.codigo_compra || v.id_compra || '').toLowerCase().includes(filtroVentas.toLowerCase()) ||
    String(v.resumen_productos || '').toLowerCase().includes(filtroVentas.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        <View style={styles.welcomeCard}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>PANEL DE CONTROL COMERCIO</Text>
          </View>
          <Text style={styles.headerTitle}>Vista Operativa General</Text>
          <Text style={styles.subtitle}>Supervisión de taller, inventario, reposiciones y registro de ventas</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>Activo</Text>
              <Text style={styles.statLabel}>Sistema</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>Sucursal {comercioId}</Text>
              <Text style={styles.statLabel}>Terminal</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loaderText}>Sincronizando información del comercio...</Text>
          </View>
        ) : (
          <>
            {/* SECCIÓN 1: ÓRDENES DE REPARACIÓN Y PRESUPUESTOS */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Órdenes de Reparación y Presupuestos</Text>
              {ordenes.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>No hay órdenes registradas.</Text></View>
              ) : (
                ordenes.map((ord, idx) => (
                  <View key={`ord-${idx}`} style={styles.cardItem}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardItemTitle}>Orden #{ord.reparacion_orden_id}</Text>
                      <Text style={styles.cardBadgeState}>{ord.estado_nombre || 'En Proceso'}</Text>
                    </View>
                    <Text style={styles.cardItemSub}>Falla: {ord.diagnostico_cliente}</Text>
                    <View style={[styles.rowBetween, { marginTop: 8 }]}>
                      <Text style={styles.cardLabel}>Presupuesto Actual:</Text>
                      <Text style={styles.cardHighlight}>{formatMoneda(ord.presupuesto_monto || ord.total)}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* SECCIÓN 2: CONTROL DE INVENTARIO Y STOCK */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Control de Inventario y Stock</Text>
              {inventario.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>Sin productos en inventario.</Text></View>
              ) : (
                inventario.map((prod, idx) => (
                  <View key={`inv-${idx}`} style={styles.cardItem}>
                    <Text style={styles.cardItemTitle}>{prod.nombre}</Text>
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardLabel}>Stock Disponible: {prod.stock_disponible}</Text>
                      <Text style={styles.cardHighlight}>{formatMoneda(prod.precio_venta)}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* SECCIÓN 3: HISTORIAL DE REPOSICIÓN DE PRODUCTOS */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Historial de Reposición de Productos</Text>
              {reposiciones.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>No hay solicitudes de reposición recientes.</Text></View>
              ) : (
                reposiciones.map((rep, idx) => (
                  <View key={`rep-${idx}`} style={styles.cardItem}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardItemTitle}>{rep.producto_nombre}</Text>
                      <Text style={styles.cardBadgeState}>{rep.estado_pedido}</Text>
                    </View>
                    <Text style={styles.cardItemSub}>Cantidad solicitada: {rep.cantidad_solicitada}</Text>
                    <Text style={styles.cardDate}>Fecha: {rep.fecha_pedido}</Text>
                  </View>
                ))
              )}
            </View>

            {/* SECCIÓN 4: LISTA DE VENTAS Y FILTRADO */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Registro y Filtrado de Ventas</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Filtrar por código o descripción..."
                placeholderTextColor="#94A3B8"
                value={filtroVentas}
                onChangeText={setFiltroVentas}
              />
              {ventasFiltradas.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>No se encontraron ventas con ese criterio.</Text></View>
              ) : (
                ventasFiltradas.map((v, idx) => (
                  <View key={`vta-${idx}`} style={styles.cardItem}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardItemTitle}>{v.codigo_compra || `Venta #${v.id_compra}`}</Text>
                      <Text style={styles.cardHighlight}>{formatMoneda(v.total_final)}</Text>
                    </View>
                    <Text style={styles.cardItemSub}>{v.resumen_productos}</Text>
                    <Text style={styles.cardDate}>Fecha: {v.fecha_compra}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentContainer: { padding: 20, paddingBottom: 40 },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  badgeText: { color: '#2563EB', fontWeight: 'bold', fontSize: 11, letterSpacing: 0.5 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: '#CBD5E1' },
  
  loaderBox: { padding: 40, alignItems: 'center' },
  loaderText: { color: '#64748B', marginTop: 8, fontSize: 13 },

  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 6 },
  
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardItemTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  cardBadgeState: { fontSize: 10, fontWeight: 'bold', color: '#2563EB', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  cardItemSub: { fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 16 },
  cardLabel: { fontSize: 11, color: '#64748B' },
  cardHighlight: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  cardDate: { fontSize: 10, color: '#94A3B8', marginTop: 6 },

  searchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 12,
  },
  emptyCard: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { color: '#64748B', fontSize: 12, fontStyle: 'italic' },
});