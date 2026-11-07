import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TecnicoScreen() {
  const router = useRouter();
  const { nombre, apellido, empleadoId } = useLocalSearchParams<{ nombre?: string; apellido?: string; empleadoId?: string }>();

  const currentEmpleadoId = empleadoId ? Number(empleadoId) : 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.roleBadgeContainer}>
          <Text style={styles.roleBadge}>PANEL DE TÉCNICO</Text>
        </View>
        <Text style={styles.welcomeText}>¡Hola, {nombre ? `${nombre} ${apellido}` : 'Técnico'}!</Text>
        <Text style={styles.subtext}>Seleccioná una opción para gestionar las reparaciones del taller</Text>
      </View>

      <Text style={styles.sectionTitle}>Gestión Operativa</Text>
      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push({
            pathname: '/tecnico/listado_reparaciones',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <Text style={styles.cardTitle}>Listado de Reparaciones</Text>
          <Text style={styles.cardSub}>Órdenes asignadas y pendientes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push({
            pathname: '/tecnico/tomar_orden',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <Text style={styles.cardTitle}>Listado de Órdenes</Text>
          <Text style={styles.cardSub}>Tomar nuevas órdenes de taller</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push({
            pathname: '/tecnico/diagnostico',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <Text style={styles.cardTitle}>Formulario Diagnóstico</Text>
          <Text style={styles.cardSub}>Notas y fallas técnicas en equipos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push({
            pathname: '/tecnico/presupuesto',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <Text style={styles.cardTitle}>Carga de Presupuesto</Text>
          <Text style={styles.cardSub}>Costos de repuestos y mano de obra</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push({
            pathname: '/tecnico/notas',
            params: { empleadoId: currentEmpleadoId }
          } as any)}
        >
          <Text style={styles.cardTitle}>Chat con el Cliente</Text>
          <Text style={styles.cardSub}>Actualizaciones y notas del proceso</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 20 },
  header: { marginBottom: 24, alignItems: 'center' },
  roleBadgeContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 10,
  },
  roleBadge: { 
    color: '#2563EB', 
    fontWeight: 'bold', 
    fontSize: 11, 
    letterSpacing: 0.5
  },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  subtext: { fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    backgroundColor: '#FFFFFF', 
    width: '48%', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 14, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A', 
    shadowOpacity: 0.05, 
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#64748B', lineHeight: 16 },
});