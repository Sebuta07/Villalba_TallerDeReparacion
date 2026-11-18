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

interface MetricasRecepcion {
  equipos_ingresados: number;
  productos_vendidos: number;
  total_reparacion: number;
  total_productos: number;
  total_general: number;
}

export default function RecepcionistaScreen() {
  const { nombre, apellido, empleadoId } = useLocalSearchParams<{ nombre?: string; apellido?: string; empleadoId?: string }>();

  const currentEmpleadoId = empleadoId ? Number(empleadoId) : 1;
  const nombreCompleto = nombre ? `${nombre} ${apellido || ''}` : 'Recepcionista';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [metricas, setMetricas] = useState<MetricasRecepcion>({
    equipos_ingresados: 0,
    productos_vendidos: 0,
    total_reparacion: 0,
    total_productos: 0,
    total_general: 0,
  });

  const cargarDatosRecepcion = async () => {
    try {
      const urlFinal = `${API_BASE}/recepcionista/dashboard_recepcion.php?empleado_id=${currentEmpleadoId}`;
      const res = await fetch(urlFinal);
      const text = await res.text();
      
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        return;
      }
      
      if (json.success) {
        setMetricas(json.metricas);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatosRecepcion();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatosRecepcion();
  };

  // Formato para plata ($ 1.500,00)
  const formatMoneda = (monto: number) => {
    return `$ ${Number(monto || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Formato para cantidades enteras (1.500)
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
          <Text style={styles.welcomeText}>¡Bienvenido al panel de recepción, {nombreCompleto}!</Text>
        </View>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <>
            {/* SECCIÓN 1: RENDIMIENTO OPERATIVO (CANTIDADES) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Rendimiento Operativo</Text>
              
              <View style={styles.metricsGrid}>
                {/* Equipos Ingresados */}
                <View style={[styles.metricCard, { borderTopColor: '#2563EB' }]}>
                  <Text style={styles.metricNumber}>{formatNumero(metricas.equipos_ingresados)}</Text>
                  <Text style={styles.metricLabel}>Equipos Ingresados</Text>
                  <Text style={styles.metricSub}>Órdenes registradas</Text>
                </View>

                {/* Productos Vendidos */}
                <View style={[styles.metricCard, { borderTopColor: '#F59E0B' }]}>
                  <Text style={styles.metricNumber}>{formatNumero(metricas.productos_vendidos)}</Text>
                  <Text style={styles.metricLabel}>Productos Vendidos</Text>
                  <Text style={styles.metricSub}>Unidades despachadas</Text>
                </View>
              </View>
            </View>

            {/* SECCIÓN 2: RESUMEN DE INGRESOS (PLATA) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Resumen de Ingresos</Text>
              
              <View style={styles.metricsGrid}>
                {/* Total Reparaciones */}
                <View style={[styles.metricCard, { borderTopColor: '#8B5CF6' }]}>
                  <Text style={styles.metricMoney} numberOfLines={1} adjustsFontSizeToFit>{formatMoneda(metricas.total_reparacion)}</Text>
                  <Text style={styles.metricLabel}>Total Reparación</Text>
                  <Text style={styles.metricSub}>Facturado en servicio técnico</Text>
                </View>

                {/* Total Productos */}
                <View style={[styles.metricCard, { borderTopColor: '#06B6D4' }]}>
                  <Text style={styles.metricMoney} numberOfLines={1} adjustsFontSizeToFit>{formatMoneda(metricas.total_productos)}</Text>
                  <Text style={styles.metricLabel}>Total Productos</Text>
                  <Text style={styles.metricSub}>Facturado en tienda</Text>
                </View>

                {/* TOTAL GENERAL GIGANTE */}
                <View style={[styles.metricCard, { borderTopColor: '#10B981', width: '100%', marginTop: 12 }]}>
                  <Text style={[styles.metricMoney, { fontSize: 32 }]} numberOfLines={1} adjustsFontSizeToFit>{formatMoneda(metricas.total_general)}</Text>
                  <Text style={styles.metricLabel}>Total General</Text>
                  <Text style={styles.metricSub}>Suma total facturada</Text>
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
  metricNumber: { fontSize: 26, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  metricMoney: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  metricLabel: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 2 },
  metricSub: { fontSize: 10, color: '#64748B', lineHeight: 14 },
});