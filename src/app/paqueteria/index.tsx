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

interface MetricasPaqueteria {
  entregados: number;
  retiros: number;
  stock_verificado: number;
}

interface DashboardData {
  metricas: MetricasPaqueteria;
  movimientos: any[];
}

export default function PaqueteriaScreen() {
  const { nombre, apellido, empleadoId } = useLocalSearchParams<{ nombre?: string; apellido?: string; empleadoId?: string }>();

  const currentEmpleadoId = empleadoId ? Number(empleadoId) : 1;
  const nombreCompleto = nombre ? `${nombre} ${apellido || ''}` : 'Logística';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [data, setData] = useState<DashboardData>({
    metricas: {
      entregados: 0,
      retiros: 0,
      stock_verificado: 0,
    },
    movimientos: [],
  });

  const cargarDatosPaqueteria = async () => {
    try {
      const urlFinal = `${API_BASE}/paqueteria/dashboard_paqueteria.php?empleado_id=${currentEmpleadoId}`;
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
          movimientos: json.movimientos || [],
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
    cargarDatosPaqueteria();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatosPaqueteria();
  };

  const formatNumero = (num: number) => {
    return Number(num || 0).toLocaleString('es-AR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        {/* PANEL DE BIENVENIDA */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>¡Bienvenido al panel de paquetería, {nombreCompleto}!</Text>
        </View>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <>
            {/* SECCIÓN 1: MÉTRICAS DE RENDIMIENTO */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Rendimiento Logístico</Text>
              
              <View style={styles.metricsGrid}>
                {/* Entregas a Domicilio */}
                <View style={[styles.metricCard, { borderTopColor: '#10B981' }]}>
                  <Text style={styles.metricNumber}>{formatNumero(data.metricas.entregados)}</Text>
                  <Text style={styles.metricLabel}>Entregas</Text>
                  <Text style={styles.metricSub}>Paquetes entregados con éxito</Text>
                </View>

                {/* Retiros a Domicilio */}
                <View style={[styles.metricCard, { borderTopColor: '#8B5CF6' }]}>
                  <Text style={styles.metricNumber}>{formatNumero(data.metricas.retiros)}</Text>
                  <Text style={styles.metricLabel}>Retiros</Text>
                  <Text style={styles.metricSub}>Equipos retirados a domicilio</Text>
                </View>

                {/* Pedidos Verificados */}
                <View style={[styles.metricCard, { borderTopColor: '#F59E0B', width: '100%', marginTop: 12 }]}>
                  <Text style={styles.metricNumber}>{formatNumero(data.metricas.stock_verificado)}</Text>
                  <Text style={styles.metricLabel}>Pedidos de Stock Verificados</Text>
                  <Text style={styles.metricSub}>Movimientos entre sucursales validados</Text>
                </View>
              </View>
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

  sectionContainer: { marginBottom: 32 },
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
    padding: 18,
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
  metricNumber: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  metricLabel: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 2 },
  metricSub: { fontSize: 10, color: '#64748B', lineHeight: 14 },

  /* ESTILOS DE TARJETAS (HISTORIAL LOGÍSTICO) */
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardItemTitle: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  cardItemSub: { fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 16 },
  cardHighlight: { flex: 1, fontSize: 11, fontWeight: 'bold', color: '#0284C7', textAlign: 'right', marginLeft: 12 },
  cardDate: { fontSize: 10, color: '#94A3B8', marginTop: 10 },

  emptyCard: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { color: '#64748B', fontSize: 12, fontStyle: 'italic' },
});