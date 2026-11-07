import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminScreen() {
  const router = useRouter();
  const { nombre, apellido } = useLocalSearchParams<{ nombre?: string; apellido?: string }>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.roleBadgeContainer}>
          <Text style={styles.roleBadge}>PANEL ADMINISTRADOR</Text>
        </View>
        <Text style={styles.welcomeText}>¡Hola, {nombre ? `${nombre} ${apellido}` : 'Administrador'}!</Text>
        <Text style={styles.subtext}>Resumen general y gestión del taller</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>128</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>45</Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Órdenes</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Módulos Principales</Text>
      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/admin/proveedores' as any)}
        >
          <Text style={styles.cardTitle}>🚚 Proveedores</Text>
          <Text style={styles.cardSub}>ABM y listados</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/admin/productos' as any)}
        >
          <Text style={styles.cardTitle}>📦 Productos</Text>
          <Text style={styles.cardSub}>Stock e inventario</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/admin/servicios' as any)}
        >
          <Text style={styles.cardTitle}>🛠️ Servicios</Text>
          <Text style={styles.cardSub}>Listado y tarifas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/admin/marcas_modelos' as any)}
        >
          <Text style={styles.cardTitle}>🏷️ Marcas / Modelos</Text>
          <Text style={styles.cardSub}>Clasificación</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 20 },
  header: { marginBottom: 20, alignItems: 'flex-start' },
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
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  subtext: { fontSize: 13.5, color: '#64748B', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#2563EB', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginTop: 10, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    backgroundColor: '#FFFFFF', 
    width: '48%', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  cardSub: { fontSize: 11.5, color: '#64748B' },
});