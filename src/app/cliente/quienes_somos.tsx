import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuienesSomosScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#38BDF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Quiénes Somos</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* LOGO O IMAGEN INSTITUCIONAL */}
        <View style={styles.bannerBox}>
          <Ionicons name="hardware-chip-outline" size={54} color="#38BDF8" />
          <Text style={styles.brandName}>FÉNIX LAB</Text>
          <Text style={styles.brandSub}>Servicio Técnico y Tecnología Avanzada</Text>
        </View>

        {/* MISIÓN / HISTORIA */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nuestra Misión</Text>
          <Text style={styles.cardText}>
            En Fénix Lab nos especializamos en la reparación integral de dispositivos móviles, consolas y equipos informáticos, ofreciendo soluciones rápidas, transparentes y de alta calidad respaldadas por tecnología de vanguardia.
          </Text>
        </View>

        {/* VALORES / CARACTERÍSTICAS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>¿Por qué elegirnos?</Text>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.featureText}>Diagnósticos precisos y presupuestos transparentes.</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.featureText}>Seguimiento en tiempo real de tus reparaciones.</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.featureText}>Componentes de máxima calidad y garantía escrita.</Text>
          </View>
        </View>

        {/* CONTACTO RÁPIDO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contacto y Ubicación</Text>
          <Text style={styles.cardText}>📍 Atención en sucursal y servicio de entrega a domicilio.</Text>
          <Text style={styles.cardText}>🕒 Lunes a Sábados de 08:00 a 20:00 hs.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { backgroundColor: '#0D1E42', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  bannerBox: { alignItems: 'center', backgroundColor: '#13161F', borderRadius: 16, padding: 24, marginVertical: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  brandName: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: 1, marginTop: 8 },
  brandSub: { color: '#38BDF8', fontSize: 12, fontWeight: '600', marginTop: 4 },
  card: { backgroundColor: '#13161F', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginBottom: 8 },
  cardText: { color: '#94A3B8', fontSize: 13, lineHeight: 18, marginBottom: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  featureText: { color: '#CBD5E1', fontSize: 12, flex: 1 }
});