import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecepcionistaScreen() {
  const router = useRouter();
  const { nombre, apellido, empleadoId } = useLocalSearchParams<{ nombre?: string; apellido?: string; empleadoId?: string }>();

  const currentEmpleadoId = empleadoId ? Number(empleadoId) : 1;
  const nombreCompleto = nombre ? `${nombre} ${apellido || ''}` : 'Recepcionista';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Cabecera / Perfil Ejecutivo */}
      <View style={styles.headerCard}>
        <View style={styles.roleBadgeContainer}>
          <Text style={styles.roleBadgeText}>PANEL DE RECEPCIÓN</Text>
        </View>
        <Text style={styles.welcomeText}>Hola, {nombreCompleto}</Text>
        <Text style={styles.subtext}>Sistema integral de gestión de taller y ventas</Text>

        {/* Widget Creativo Re Copado: Indicadores rápidos del sistema */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>Activo</Text>
            <Text style={styles.statLabel}>Estado de Caja</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>ID: {currentEmpleadoId}</Text>
            <Text style={styles.statLabel}>Operador</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>Online</Text>
            <Text style={styles.statLabel}>Servidor Taller</Text>
          </View>
        </View>
      </View>

      {/* Sección Ventas y Stock */}
      <Text style={styles.sectionTitle}>Ventas y Stock</Text>
      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push({
            pathname: '/recepcionista/productos',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <View style={styles.cardIndicator} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Listado de Productos</Text>
            <Text style={styles.cardSub}>Catálogo general de artículos</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push({
            pathname: '/recepcionista/calculadora',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <View style={styles.cardIndicator} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Calculadora</Text>
            <Text style={styles.cardSub}>Operaciones y cuentas rápidas</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cardFullWidth} 
          onPress={() => router.push({
            pathname: '/recepcionista/carrito',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <View style={[styles.cardIndicator, { backgroundColor: '#166534' }]} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Carrito y Facturación</Text>
            <Text style={styles.cardSub}>Generación de tickets de compra y cobros</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Sección Servicios y Reparaciones */}
      <Text style={styles.sectionTitle}>Servicios y Reparaciones</Text>
      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push({
            pathname: '/recepcionista/servicios',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <View style={styles.cardIndicator} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Listado de Servicio</Text>
            <Text style={styles.cardSub}>Gestión técnica de servicios</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/recepcionista/nueva_orden' as any)}
        >
          <View style={styles.cardIndicator} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Nueva Orden</Text>
            <Text style={styles.cardSub}>Comprobante de recepción</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push({
            pathname: '/recepcionista/diagnostico',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <View style={styles.cardIndicator} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Llamado Diagnóstico</Text>
            <Text style={styles.cardSub}>Avisos y notas a técnicos</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push({
            pathname: '/recepcionista/avance',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <View style={styles.cardIndicator} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Avance de Reparación</Text>
            <Text style={styles.cardSub}>Seguimiento de estados</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Sección Equipos */}
      <Text style={styles.sectionTitle}>Equipos</Text>
      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.cardFullWidth} 
          onPress={() => router.push({
            pathname: '/recepcionista/estado_equipos',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <View style={styles.cardIndicator} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Estado de Equipos</Text>
            <Text style={styles.cardSub}>Control detallado de ingreso y salida en el taller</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 20, paddingBottom: 40 },
  headerCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center'
  },
  roleBadgeContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 10,
  },
  roleBadgeText: { 
    color: '#2563EB', 
    fontWeight: 'bold', 
    fontSize: 11, 
    letterSpacing: 0.5
  },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 4 },
  subtext: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 16 },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: '#CBD5E1' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginTop: 12, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    backgroundColor: '#FFFFFF', 
    width: '48%', 
    borderRadius: 12, 
    marginBottom: 14, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A', 
    shadowOpacity: 0.04, 
    shadowRadius: 6, 
    elevation: 1,
    flexDirection: 'row',
    overflow: 'hidden'
  },
  cardFullWidth: {
    backgroundColor: '#FFFFFF', 
    width: '100%', 
    borderRadius: 12, 
    marginBottom: 14, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A', 
    shadowOpacity: 0.04, 
    shadowRadius: 6, 
    elevation: 1,
    flexDirection: 'row',
    overflow: 'hidden'
  },
  cardIndicator: { width: 4, backgroundColor: '#2563EB' },
  cardBody: { flex: 1, padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
  cardSub: { fontSize: 11, color: '#64748B', lineHeight: 15 },
});