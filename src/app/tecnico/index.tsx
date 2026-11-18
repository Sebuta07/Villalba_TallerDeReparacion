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

interface MetricasTecnico {
  cola_ingreso: number;
  en_proceso: number;
  finalizados_hoy: number;
  diagnosticos_realizados: number;
  equipos_entregados: number;
}

interface DashboardData {
  metricas: MetricasTecnico;
  top_categorias: any[];
}

export default function TecnicoScreen() {
  const { nombre, apellido, empleadoId } = useLocalSearchParams<{ nombre?: string; apellido?: string; empleadoId?: string }>();

  const currentEmpleadoId = empleadoId ? Number(empleadoId) : 1;
  const nombreUsuario = nombre ? `${nombre} ${apellido || ''}` : 'Técnico';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [data, setData] = useState<DashboardData>({
    metricas: {
      cola_ingreso: 0,
      en_proceso: 0,
      finalizados_hoy: 0,
      diagnosticos_realizados: 0,
      equipos_entregados: 0,
    },
    top_categorias: [],
  });

  const cargarDatosTecnico = async () => {
    try {
      const urlFinal = `${API_BASE}/tecnico/dashboard_tecnico.php?empleado_id=${currentEmpleadoId}`;
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
          metricas: json.metricas,
          top_categorias: json.top_categorias || [],
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
    cargarDatosTecnico();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatosTecnico();
  };

  // Formato para cantidades enteras con puntos de miles
  const formatNumero = (num: number) => {
    return Number(num || 0).toLocaleString('es-AR');
  };

  // Valor máximo para el gráfico
  const maxCategoria = data.top_categorias.length > 0 
    ? Math.max(...data.top_categorias.map(c => Number(c.cantidad))) 
    : 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        {/* PANEL DE BIENVENIDA */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>¡Bienvenido al panel técnico, {nombreUsuario}!</Text>
        </View>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <>
            {/* SECCIÓN 1: MONITOR DEL EMBUDO DE TRABAJO */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Monitor de Trabajo</Text>
              
              <View style={styles.metricsGrid}>
                {/* Tarjeta: Cola de Ingreso */}
                <View style={[styles.metricCard, { borderTopColor: '#DC2626' }]}>
                  <Text style={styles.metricNumber}>{formatNumero(data.metricas.cola_ingreso)}</Text>
                  <Text style={styles.metricLabel}>Cola de Ingreso</Text>
                  <Text style={styles.metricSub}>Equipos pendientes de revisión</Text>
                </View>

                {/* Tarjeta: En Proceso */}
                <View style={[styles.metricCard, { borderTopColor: '#0284C7' }]}>
                  <Text style={styles.metricNumber}>{formatNumero(data.metricas.en_proceso)}</Text>
                  <Text style={styles.metricLabel}>Frenados / Espera</Text>
                  <Text style={styles.metricSub}>En proceso o esperando repuesto</Text>
                </View>

                {/* Tarjeta: Productividad */}
                <View style={[styles.metricCard, { borderTopColor: '#10B981', width: '100%' }]}>
                  <Text style={styles.metricNumber}>{formatNumero(data.metricas.finalizados_hoy)}</Text>
                  <Text style={styles.metricLabel}>Productividad Finalizada</Text>
                  <Text style={styles.metricSub}>Equipos reparados exitosamente</Text>
                </View>
              </View>
            </View>

            {/* SECCIÓN 2: HISTORIAL DE RENDIMIENTO (NUEVAS ESTADÍSTICAS) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Historial de Rendimiento</Text>
              
              <View style={styles.metricsGrid}>
                <View style={[styles.metricCard, { borderTopColor: '#8B5CF6' }]}>
                  <Text style={styles.metricNumber}>{formatNumero(data.metricas.diagnosticos_realizados)}</Text>
                  <Text style={styles.metricLabel}>Diagnósticos</Text>
                  <Text style={styles.metricSub}>Total realizados</Text>
                </View>

                <View style={[styles.metricCard, { borderTopColor: '#F59E0B' }]}>
                  <Text style={styles.metricNumber}>{formatNumero(data.metricas.equipos_entregados)}</Text>
                  <Text style={styles.metricLabel}>Entregados</Text>
                  <Text style={styles.metricSub}>Total despachados</Text>
                </View>
              </View>
            </View>

            {/* SECCIÓN 3: GRÁFICO (CATEGORÍAS MÁS REPARADAS) */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Top Categorías Reparadas</Text>
              {data.top_categorias && data.top_categorias.length > 0 ? (
                <View style={styles.simpleChartContainer}>
                  {data.top_categorias.map((cat, idx) => {
                    const pct = Math.max(5, Math.round((Number(cat.cantidad) / maxCategoria) * 100));
                    return (
                      <View key={`cat-${idx}`} style={styles.simpleChartRow}>
                        <View style={styles.simpleChartTextRow}>
                          <Text style={styles.simpleChartName} numberOfLines={1}>{cat.categoria}</Text>
                          <Text style={styles.simpleChartValue}>{formatNumero(cat.cantidad)}</Text>
                        </View>
                        <View style={styles.simpleBarBackground}>
                          <View style={[styles.simpleBarFill, { width: `${pct}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>Sin datos de categorías registrados</Text>
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
  content: { padding: 20, paddingBottom: 40 },
  
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
  
  /* ESTILOS DE MÉTRICAS */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 4,
    alignItems: 'flex-start',
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  metricNumber: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  metricLabel: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 2 },
  metricSub: { fontSize: 10, color: '#64748B', lineHeight: 14 },

  /* ESTILOS DEL GRÁFICO (HORIZONTAL) */
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  chartTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  
  simpleChartContainer: { gap: 14 },
  simpleChartRow: { width: '100%' },
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

  emptyText: { color: '#64748B', fontSize: 12, fontStyle: 'italic' },
});