import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = `${process.env.EXPO_PUBLIC_API_URL}`;

interface StatsData {
  total_reparaciones: number;
  total_productos: number;
  facturacion_global: number;
  clientes: number;
  ordenes: number;
  productos_stock: number;
  top_productos: Array<{ nombre: string; total: number; cantidad: number }>;
  top_servicios: Array<{ nombre: string; total: number }>;
}

export default function AdminScreen() {
  const { nombre, apellido } = useLocalSearchParams<{ nombre?: string; apellido?: string }>();

  const [stats, setStats] = useState<StatsData>({
    total_reparaciones: 0,
    total_productos: 0,
    facturacion_global: 0,
    clientes: 0,
    ordenes: 0,
    productos_stock: 0,
    top_productos: [],
    top_servicios: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cargarEstadisticas = async () => {
    try {
      setErrorMsg(null);
      const urlFinal = `${API_BASE}/admin/estadisticas.php`;
      const res = await fetch(urlFinal);
      const text = await res.text();
      
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error('El servidor devolvió una respuesta inválida.');
      }

      if (json.success && json.estadisticas) {
        setStats(json.estadisticas);
      } else {
        setErrorMsg(json.error || 'Error al obtener datos del servidor.');
      }
    } catch (error: any) {
      setErrorMsg('No se pudo conectar con el servidor XAMPP. Revisa tu red.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarEstadisticas();
  };

  // Función para formatear números con puntos de miles y coma decimal
  const formatMoneda = (monto: number) => {
    return `$ ${monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumero = (num: number) => {
    return num.toLocaleString('es-AR');
  };

  const totalGlobal = stats.total_reparaciones + stats.total_productos || 1;
  const pctReparaciones = Math.round((stats.total_reparaciones / totalGlobal) * 100);
  const pctProductos = 100 - pctReparaciones;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        <View style={styles.header}>
          <View style={styles.roleBadgeContainer}>
            <Text style={styles.roleBadge}>PANEL ADMINISTRADOR</Text>
          </View>
          <Text style={styles.welcomeText}>¡Hola, {nombre ? `${nombre} ${apellido}` : 'Administrador'}!</Text>
          <Text style={styles.subtext}>Resumen financiero y métricas del taller Fénix Lab</Text>
        </View>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loaderText}>Calculando ingresos y estadísticas...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={cargarEstadisticas}>
              <Text style={styles.retryBtnText}>Reintentar Conexión</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* TARJETAS DE DINERO GENERADO */}
            <View style={styles.moneyCardContainer}>
              <View style={[styles.moneyCard, { borderLeftColor: '#2563EB' }]}>
                <Text style={styles.moneyCardTitle}>Ingresos por Reparaciones</Text>
                <Text style={styles.moneyCardAmount}>{formatMoneda(stats.total_reparaciones)}</Text>
                <Text style={styles.moneyCardSub}>Generado con órdenes de taller</Text>
              </View>

              <View style={[styles.moneyCard, { borderLeftColor: '#10B981' }]}>
                <Text style={styles.moneyCardTitle}>Ingresos por Productos</Text>
                <Text style={styles.moneyCardAmount}>{formatMoneda(stats.total_productos)}</Text>
                <Text style={styles.moneyCardSub}>Generado con ventas de stock</Text>
              </View>
            </View>

            {/* GRÁFICO CIRCULAR / DONA (Distribución de Ingresos) */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Distribución Global de Ingresos</Text>
              <View style={styles.donutLegendContainer}>
                <View style={styles.donutVisual}>
                  <View style={styles.donutCenter}>
                    <Text style={styles.donutCenterText}>{formatMoneda(stats.facturacion_global)}</Text>
                    <Text style={styles.donutCenterSub}>Facturación</Text>
                  </View>
                </View>
                <View style={styles.legendList}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.legendText}>Reparaciones ({pctReparaciones}%)</Text>
                      <Text style={styles.legendSubVal}>{formatMoneda(stats.total_reparaciones)}</Text>
                    </View>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.legendText}>Productos ({pctProductos}%)</Text>
                      <Text style={styles.legendSubVal}>{formatMoneda(stats.total_productos)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* GRÁFICO EN ESCALERA / BARRAS (Top Productos / Servicios más vendidos) */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Top Productos y Servicios más Vendidos</Text>
              
              <Text style={styles.stairSectionHeader}>Productos Destacados</Text>
              {stats.top_productos && stats.top_productos.length > 0 ? (
                stats.top_productos.map((prod, idx) => {
                  const maxVal = stats.top_productos[0]?.total || 1;
                  const barWidth = Math.max(15, Math.round((prod.total / maxVal) * 100));
                  return (
                    <View key={`prod-${idx}`} style={styles.stairRow}>
                      <Text style={styles.stairLabel} numberOfLines={1}>{prod.nombre}</Text>
                      <View style={styles.stairBarContainer}>
                        <View style={[styles.stairBarFill, { width: `${barWidth}%`, backgroundColor: '#0284C7' }]} />
                      </View>
                      <Text style={styles.stairValue}>{formatMoneda(prod.total)}</Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>Sin registros de productos</Text>
              )}

              <Text style={[styles.stairSectionHeader, { marginTop: 16 }]}>Servicios de Taller</Text>
              {stats.top_servicios && stats.top_servicios.length > 0 ? (
                stats.top_servicios.map((serv, idx) => {
                  const maxServVal = stats.top_servicios[0]?.total || 1;
                  const barWidthServ = Math.max(15, Math.round((serv.total / maxServVal) * 100));
                  return (
                    <View key={`serv-${idx}`} style={styles.stairRow}>
                      <Text style={styles.stairLabel} numberOfLines={1}>{serv.nombre}</Text>
                      <View style={styles.stairBarContainer}>
                        <View style={[styles.stairBarFill, { width: `${barWidthServ}%`, backgroundColor: '#7C3AED' }]} />
                      </View>
                      <Text style={styles.stairValue}>{formatMoneda(serv.total)}</Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>Sin registros de servicios</Text>
              )}
            </View>

            {/* ESTADÍSTICAS GENERALES CON NÚMEROS FORMATEADOS */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{formatNumero(stats.productos_stock)}</Text>
                <Text style={styles.statLabel}>Productos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{formatNumero(stats.clientes)}</Text>
                <Text style={styles.statLabel}>Clientes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{formatNumero(stats.ordenes)}</Text>
                <Text style={styles.statLabel}>Órdenes</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 16, paddingBottom: 30 },
  header: { marginBottom: 16, alignItems: 'flex-start' },
  roleBadgeContainer: { marginBottom: 6 },
  roleBadge: { 
    backgroundColor: '#E8F0FE', 
    color: '#2563EB', 
    fontWeight: 'bold', 
    fontSize: 11, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 6, 
    overflow: 'hidden' 
  },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  subtext: { fontSize: 13, color: '#64748B', marginTop: 2 },
  
  loaderBox: { padding: 40, alignItems: 'center' },
  loaderText: { color: '#64748B', marginTop: 8, fontSize: 12 },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: { color: '#991B1B', fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 12 },
  retryBtn: { backgroundColor: '#DC2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  moneyCardContainer: { gap: 12, marginBottom: 16 },
  moneyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 5,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  moneyCardTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  moneyCardAmount: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  moneyCardSub: { fontSize: 11, color: '#94A3B8' },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  chartTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 14 },
  
  donutLegendContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  donutVisual: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#2563EB',
    borderTopColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: { alignItems: 'center', justifyContent: 'center' },
  donutCenterText: { fontSize: 10, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  donutCenterSub: { fontSize: 9, color: '#64748B' },

  legendList: { flex: 1, marginLeft: 16, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#0F172A', fontWeight: '600' },
  legendSubVal: { fontSize: 11, color: '#64748B' },

  stairSectionHeader: { fontSize: 12, fontWeight: 'bold', color: '#2563EB', marginBottom: 8 },
  stairRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  stairLabel: { width: 105, fontSize: 11, color: '#334155' },
  stairBarContainer: { flex: 1, height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
  stairBarFill: { height: '100%', borderRadius: 5 },
  stairValue: { width: 85, fontSize: 11, color: '#0F172A', textAlign: 'right', fontWeight: 'bold' },
  emptyText: { color: '#64748B', fontSize: 11, fontStyle: 'italic', marginBottom: 4 },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#2563EB', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
});