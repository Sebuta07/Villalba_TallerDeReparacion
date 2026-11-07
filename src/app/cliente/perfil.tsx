import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

export default function PerfilScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : 3;

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados basados estrictamente en las columnas de la tabla 'usuarios'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dniCuit, setDniCuit] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const res = await fetch(`${API_BASE}/cliente/perfil.php?usuario_id=${usuarioId}`);
      const json = await res.json();
      if (json.success && json.usuario) {
        setUsername(json.usuario.username || '');
        setEmail(json.usuario.email || '');
        setNombre(json.usuario.nombre || '');
        setApellido(json.usuario.apellido || '');
        setDniCuit(json.usuario.dni_cuit ? String(json.usuario.dni_cuit) : '');
        setFechaNacimiento(json.usuario.fecha_nacimiento || '');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar la información del perfil.');
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      const formData = new FormData();
      formData.append('usuario_id', String(usuarioId));
      formData.append('nombre', nombre.trim());
      formData.append('apellido', apellido.trim());
      formData.append('email', email.trim());
      formData.append('dni_cuit', dniCuit.trim());
      formData.append('fecha_nacimiento', fechaNacimiento.trim());

      const response = await fetch(`${API_BASE}/cliente/perfil.php`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      if (json.success) {
        Alert.alert('¡Éxito!', 'Tus datos se han guardado correctamente.');
      } else {
        Alert.alert('Error', json.error || 'No se pudieron guardar los cambios.');
      }
    } catch (e) {
      Alert.alert('Error', 'Falla de conexión con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => router.replace('/' as any) }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loaderText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#38BDF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Mi Perfil</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* FORMULARIO EDITABLE */}
        <View style={styles.cardForm}>
          <View style={styles.avatarBox}>
            <Ionicons name="person" size={32} color="#38BDF8" />
          </View>
          <Text style={styles.cardHeaderTitle}>@{username || 'usuario'}</Text>
          <Text style={styles.cardHeaderSub}>Actualiza tus datos o completa los campos vacíos</Text>

          <Text style={styles.inputLabel}>Nombre</Text>
          <TextInput 
            style={styles.input} 
            value={nombre} 
            onChangeText={setNombre} 
            placeholder="Ej: Sebastián" 
            placeholderTextColor="#64748B" 
          />

          <Text style={styles.inputLabel}>Apellido</Text>
          <TextInput 
            style={styles.input} 
            value={apellido} 
            onChangeText={setApellido} 
            placeholder="Ej: Gómez" 
            placeholderTextColor="#64748B" 
          />

          <Text style={styles.inputLabel}>Correo Electrónico</Text>
          <TextInput 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
            placeholder="correo@ejemplo.com" 
            placeholderTextColor="#64748B" 
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>DNI o CUIT</Text>
          <TextInput 
            style={styles.input} 
            value={dniCuit} 
            onChangeText={setDniCuit} 
            placeholder="Ej: 45123456" 
            placeholderTextColor="#64748B" 
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Fecha de Nacimiento (AAAA-MM-DD)</Text>
          <TextInput 
            style={styles.input} 
            value={fechaNacimiento} 
            onChangeText={setFechaNacimiento} 
            placeholder="Ej: 2005-08-15" 
            placeholderTextColor="#64748B" 
          />

          <TouchableOpacity style={styles.saveBtn} onPress={guardarCambios} disabled={guardando}>
            {guardando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>GUARDAR CAMBIOS</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ACCESOS RÁPIDOS */}
        <Text style={styles.sectionTitle}>Accesos del Taller</Text>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push({ pathname: '/cliente/historial_compras' as any, params: { usuarioId } })}
        >
          <View style={styles.menuIconBox}>
            <Ionicons name="receipt-outline" size={20} color="#38BDF8" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.menuTitle}>Mis Compras y Pedidos</Text>
            <Text style={styles.menuSub}>Ver comprobantes e historial de transacciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push({ pathname: '/cliente/seguimiento' as any, params: { usuarioId } })}
        >
          <View style={styles.menuIconBox}>
            <Ionicons name="phone-portrait-outline" size={20} color="#38BDF8" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.menuTitle}>Estado del Dispositivo</Text>
            <Text style={styles.menuSub}>Seguimiento de reparaciones y chat técnico</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/cliente/quienes_somos' as any)}
        >
          <View style={styles.menuIconBox}>
            <Ionicons name="information-circle-outline" size={20} color="#38BDF8" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.menuTitle}>Quiénes Somos</Text>
            <Text style={styles.menuSub}>Conoce más sobre nuestro taller y servicios</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </TouchableOpacity>

        {/* BOTÓN CERRAR SESIÓN */}
        <TouchableOpacity style={styles.logoutBtn} onPress={cerrarSesion}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#071026' },
  loaderText: { color: '#CBD5E1', marginTop: 10, fontSize: 13, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { backgroundColor: '#0D1E42', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  cardForm: {
    backgroundColor: '#13161F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0D1E42',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  cardHeaderTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  cardHeaderSub: { color: '#94A3B8', fontSize: 11, marginBottom: 14 },
  inputLabel: { color: '#CBD5E1', fontSize: 11, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#0D1E42', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#FFF', fontSize: 13, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  saveBtn: { backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  sectionTitle: { color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  menuItem: {
    backgroundColor: '#13161F',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0D1E42', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  menuTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  menuSub: { color: '#64748B', fontSize: 11, marginTop: 2 },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: { color: '#EF4444', fontSize: 13, fontWeight: '800' }
});