import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PaqueteriaIndex() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const paqueteriaId = params.paqueteriaId ? Number(params.paqueteriaId) : 1;

  const opciones = [
    { title: 'Bandeja de Entrada y Calidad', route: '/paqueteria/bandeja', desc: 'Control de calidad e impresión formal de etiquetas' },
    { title: 'Control de Envío al Cliente', route: '/paqueteria/envios', desc: 'Generación de códigos de seguridad y entrega de equipos' },
    { title: 'Recepción y Repuestos', route: '/paqueteria/repuestos', desc: 'Alerta de repuestos, listados de remitos y stock' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeCard}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>CENTRO DE EMPAQUETADO</Text>
        </View>
        <Text style={styles.headerTitle}>Gestión Logística</Text>
        <Text style={styles.subtitle}>Seleccioná un módulo operativo para realizar el control de calidad, envíos y recepción de repuestos</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>Activo</Text>
            <Text style={styles.statLabel}>Sistema Logístico</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>En Línea</Text>
            <Text style={styles.statLabel}>Estado Operativo</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Módulos Disponibles</Text>

      <View style={styles.grid}>
        {opciones.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: item.route as any, params: { paqueteriaId } })}
          >
            <View style={styles.cardIndicator} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  contentContainer: { padding: 20, paddingBottom: 40 },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 14 },
  grid: { gap: 12 },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardIndicator: { width: 4, backgroundColor: '#2563EB' },
  cardBody: { flex: 1, padding: 16 },
  cardTitle: { color: '#0F172A', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { color: '#64748B', fontSize: 12, lineHeight: 16 },
});