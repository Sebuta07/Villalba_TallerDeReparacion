import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

export default function EnvioDispositivoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : 3;

  // 'retiro' = Buscar equipo en casa / 'entrega' = Devolver equipo reparado
  const [tipoServicio, setTipoServicio] = useState<'retiro' | 'entrega'>('retiro');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [barrio, setBarrio] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const enviarSolicitud = async () => {
    if (!calle.trim() || !barrio.trim()) {
      Alert.alert('Atención', 'Por favor ingresa al menos la calle y el barrio.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('usuario_id', String(usuarioId));
      formData.append('tipo_servicio', tipoServicio);
      formData.append('calle', calle.trim());
      formData.append('numero', numero.trim());
      formData.append('barrio', barrio.trim());
      formData.append('observaciones', observaciones.trim());

      const response = await fetch(`${API_BASE}/cliente/solicitar_envio.php`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (json.success) {
        Alert.alert(
          '¡Solicitud Registrada!',
          json.mensaje,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', json.error || 'No se pudo procesar la solicitud.');
      }
    } catch (e) {
      Alert.alert('Error', 'Falla de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#38BDF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Logística de Dispositivos</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* SELECTOR DE TIPO DE LOGÍSTICA */}
        <Text style={styles.sectionTitle}>Selecciona la Modalidad</Text>
        
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.optionCard, tipoServicio === 'retiro' && styles.optionCardActive]}
            onPress={() => setTipoServicio('retiro')}
          >
            <Ionicons 
              name="bicycle-outline" 
              size={24} 
              color={tipoServicio === 'retiro' ? '#FFF' : '#38BDF8'} 
            />
            <Text style={[styles.optionTitle, tipoServicio === 'retiro' && styles.optionTitleActive]}>
              Retiro a Domicilio
            </Text>
            <Text style={styles.optionSub}>Pasamos a buscar tu equipo por tu casa para repararlo.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, tipoServicio === 'entrega' && styles.optionCardActive]}
            onPress={() => setTipoServicio('entrega')}
          >
            <Ionicons 
              name="home-outline" 
              size={24} 
              color={tipoServicio === 'entrega' ? '#FFF' : '#38BDF8'} 
            />
            <Text style={[styles.optionTitle, tipoServicio === 'entrega' && styles.optionTitleActive]}>
              Entrega de Reparado
            </Text>
            <Text style={styles.optionSub}>Te devolvemos tu equipo ya arreglado a tu domicilio.</Text>
          </TouchableOpacity>
        </View>

        {/* FORMULARIO DE DIRECCIÓN */}
        <View style={styles.formCard}>
          <Text style={styles.formHeaderTitle}>Dirección de {tipoServicio === 'retiro' ? 'Retiro' : 'Entrega'}</Text>
          <Text style={styles.formHeaderSub}>Indica dónde realizaremos la gestión de logística</Text>

          <Text style={styles.inputLabel}>Calle *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ej: Av. Gutnisky" 
            placeholderTextColor="#64748B" 
            value={calle} 
            onChangeText={setCalle} 
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Número</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: 2450" 
                placeholderTextColor="#64748B" 
                value={numero} 
                onChangeText={setNumero} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Barrio *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: Centro" 
                placeholderTextColor="#64748B" 
                value={barrio} 
                onChangeText={setBarrio} 
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Observaciones / Dispositivo</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            placeholder="Ej: Notebook HP Ryzen 3 / Timbre no funciona, dejar en recepción..." 
            placeholderTextColor="#64748B" 
            multiline 
            value={observaciones} 
            onChangeText={setObservaciones} 
          />

          <TouchableOpacity style={styles.submitBtn} onPress={enviarSolicitud} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>CONFIRMAR SOLICITUD</Text>
            )}
          </TouchableOpacity>
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
  sectionTitle: { color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  optionsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  optionCard: {
    flex: 1,
    backgroundColor: '#13161F',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'flex-start',
  },
  optionCardActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  optionTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginTop: 10, marginBottom: 4 },
  optionTitleActive: { color: '#FFFFFF' },
  optionSub: { color: '#94A3B8', fontSize: 10, lineHeight: 14 },
  formCard: {
    backgroundColor: '#13161F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  formHeaderTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  formHeaderSub: { color: '#94A3B8', fontSize: 11, marginBottom: 10 },
  inputLabel: { color: '#CBD5E1', fontSize: 11, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#0D1E42', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#FFF', fontSize: 13, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  submitBtn: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' }
});