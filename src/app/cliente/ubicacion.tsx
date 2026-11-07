import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// HTML estructurado para renderizar el iframe de Google Maps sin bloqueos
const HTML_MAPA = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; background-color: #071026; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: 0; filter: invert(90%) hue-rotate(180deg) contrast(120%); }
      </style>
    </head>
    <body>
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2261.70136808801!2d-58.15745810708711!3d-26.145394018335164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x945ca5a793027157%3A0x4258abecc260dc62!2sEPET%20N%C2%B07%20%22Arcadio%20Salame%22!5e1!3m2!1ses-419!2sar!4v1793934684335!5m2!1ses-419!2sar" 
        allowfullscreen="" 
        loading="lazy">
      </iframe>
    </body>
  </html>
`;

const MAP_EXTERNAL_URL = 'https://maps.google.com/?q=EPET+N7+Vicente+Arcadio+Salemi';

export default function UbicacionScreen() {
  const router = useRouter();

  const abrirEnMapasExternos = () => {
    Linking.openURL(MAP_EXTERNAL_URL).catch(() => {
      alert('No se pudo abrir la aplicación de mapas.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#38BDF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Ubicación del Taller</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* CONTENEDOR DEL MAPA CON HTML LIMPIO */}
      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: HTML_MAPA }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>

      {/* INFORMACIÓN INSTITUCIONAL */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="school-outline" size={22} color="#38BDF8" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.placeTitle}>EPET Nº 7 "Vicente Arcadio Salemi"</Text>
            <Text style={styles.placeSub}>Casa Central / Base de Operaciones Fénix Lab</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#94A3B8" />
          <Text style={styles.detailText}>Horarios de atención: Lunes a Viernes de 08:00 a 18:00 hs</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#94A3B8" />
          <Text style={styles.detailText}>Formosa, Argentina (Zona Circuito 5)</Text>
        </View>

        {/* BOTÓN EXTERNO */}
        <TouchableOpacity style={styles.externalMapBtn} onPress={abrirEnMapasExternos}>
          <Ionicons name="navigate-outline" size={16} color="#FFF" />
          <Text style={styles.externalMapText}>ABRIR EN GOOGLE MAPS</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { backgroundColor: '#0D1E42', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  mapContainer: { flex: 1, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', marginVertical: 10 },
  webView: { flex: 1, backgroundColor: '#071026' },
  infoCard: { backgroundColor: '#13161F', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#0D1E42', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  placeTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  placeSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginVertical: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  detailText: { color: '#CBD5E1', fontSize: 12 },
  externalMapBtn: { backgroundColor: '#2563EB', flexDirection: 'row', gap: 8, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  externalMapText: { color: '#FFF', fontSize: 12, fontWeight: '800' }
});