import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/fenix_lab/api_app';

interface DashboardData {
  productos_low_stock: any[];
  top_pedidos: any[];
}

export default function ComercioIndex() {
  const params = useLocalSearchParams();
  const comercioId = params.comercioId ? Number(params.comercioId) : 1;
  const nombreUsuario = params.nombre ? `${params.nombre} ${params.apellido || ''}` : 'Usuario';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [data, setData] = useState<DashboardData>({
    productos_low_stock: [],
    top_pedidos: [],
  });

  const cargarDatosComercio = async () => {
    try {
      const urlFinal = `${API_BASE}/comercio/dashboard_unificado.php?comercio_id=${comercioId}`;
      const res = await fetch(urlFinal);
      const text = await res.text();
      
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        return;
      }
      
      if (json.success) {
        setData({
          productos_low_stock: json.productos_low_stock || [],
          top_pedidos: json.top_pedidos || [],
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatosComercio();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatosComercio();
  };

  // Formato para cantidades enteras
  const formatNumero = (num: number) => {
    return Number(num || 0).toLocaleString('es-AR');
  };

  // Semáforo de stock
  const getStockColor = (disp: number, min: number) => {
    if (disp <= min) return '#DC2626'; // Rojo
    if (disp <= min + 3) return '#F59E0B'; // Amarillo
    return '#10B981'; // Verde
  };

  // Encontrar el valor máximo para el gráfico simple (horizontal)
  const maxPedido = data.top_pedidos.length > 0 
    ? Math.max(...data.top_pedidos.map(r => Number(r.total_pedido))) 
    : 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        {/* PANEL DE BIENVENIDA SIMPLE */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>¡Bienvenido al panel de comercio, {nombreUsuario}!</Text>
        </View>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <>
            {/* SECCIÓN 1: ALERTA DE STOCK (6 PRODUCTOS) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Control de Stock</Text>
              {data.productos_low_stock.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>Inventario con stock suficiente.</Text></View>
              ) : (
                <View style={styles.stockGrid}>
                  {data.productos_low_stock.map((prod, idx) => {
                    const disp = Number(prod.stock_disponible || 0);
                    const min = Number(prod.stock_minimo || 0);
                    const dotColor = getStockColor(disp, min);

                    return (
                      <View key={`low-${idx}`} style={styles.stockCard}>
                        <Text style={styles.stockCardTitle} numberOfLines={2}>{prod.nombre}</Text>
                        <View style={styles.stockCardFooter}>
                          <View style={styles.stockIndicatorRow}>
                            <View style={[styles.stockDot, { backgroundColor: dotColor }]} />
                            <Text style={styles.stockCardDisp}>{formatNumero(disp)} unid.</Text>
                          </View>
                          <Text style={styles.stockCardMin}>Min: {formatNumero(min)}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* SECCIÓN 2: GRÁFICO SIMPLE (HORIZONTAL) DE PEDIDOS DE SUCURSAL */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Productos más pedidos (Sucursal)</Text>
              {data.top_pedidos && data.top_pedidos.length > 0 ? (
                <View style={styles.simpleChartContainer}>
                  {data.top_pedidos.map((ped, idx) => {
                    const pct = Math.max(5, Math.round((Number(ped.total_pedido) / maxPedido) * 100));
                    return (
                      <View key={`ped-${idx}`} style={styles.simpleChartRow}>
                        <View style={styles.simpleChartTextRow}>
                          <Text style={styles.simpleChartName} numberOfLines={1}>{ped.nombre}</Text>
                          <Text style={styles.simpleChartValue}>{formatNumero(ped.total_pedido)} unid.</Text>
                        </View>
                        <View style={styles.simpleBarBackground}>
                          <View style={[styles.simpleBarFill, { width: `${pct}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>Sin historial de pedidos destacadas</Text>
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
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeText: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  
  loaderBox: { padding: 40, alignItems: 'center' },

  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 6 },
  
  /* ESTILOS DE STOCK DE PRODUCTOS (CUADRITOS) */
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  stockCard: {
    backgroundColor: '#F8FAFC',
    width: '48%',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  stockCardTitle: { fontSize: 12, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, lineHeight: 16 },
  stockCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  stockIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockDot: { width: 10, height: 10, borderRadius: 5 },
  stockCardDisp: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  stockCardMin: { fontSize: 10, color: '#64748B' },

  /* ESTILOS DEL GRÁFICO SIMPLE (HORIZONTAL) */
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  
  simpleChartContainer: {
    gap: 14,
  },
  simpleChartRow: {
    width: '100%',
  },
  simpleChartTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  simpleChartName: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    marginRight: 10,
  },
  simpleChartValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  simpleBarBackground: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  simpleBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 4,
  },

  emptyCard: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { color: '#64748B', fontSize: 12, fontStyle: 'italic' },
});