import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_LOGIN = `${process.env.EXPO_PUBLIC_API_URL}/login.php`;

export default function LoginScreen() {
  const router = useRouter();
  const [usuarioOEmail, setUsuarioOEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!usuarioOEmail.trim() || !password.trim()) {
      Alert.alert('Atención', 'Por favor completá todos los campos.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          usuario_o_email: usuarioOEmail.trim(),
          password: password,
        }),
      });

      const textResponse = await response.text();
      console.log("RESPUESTA REAL DEL SERVIDOR:", textResponse);
      const data = JSON.parse(textResponse);

      if (response.ok && data.success) {
        const { id, rol_id, nombre, apellido } = data.usuario;

        switch (rol_id) {
          case 1:
            router.replace({ pathname: '/admin' as any, params: { nombre, apellido, empleadoId: id } });
            break;
          case 2:
            router.replace({ pathname: '/recepcionista' as any, params: { nombre, apellido, empleadoId: id } });
            break;
          case 3:
            router.replace({ pathname: '/tecnico' as any, params: { nombre, apellido, empleadoId: id } });
            break;
          case 4:
            router.replace({ pathname: '/cliente' as any, params: { nombre, apellido, usuarioId: id } });
            break;
          case 5:
            router.replace({ pathname: '/comercio' as any, params: { nombre, apellido, comercioId: id } });
            break;
          case 6:
            router.replace({ pathname: '/paqueteria' as any, params: { nombre, apellido, paqueteriaId: id } });
            break;
          default:
            Alert.alert('Error', 'Rol de usuario no reconocido.');
            break;
        }
      } else {
        Alert.alert('Atención', data.message || 'Credenciales inválidas.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de Red', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>¡Bienvenido!</Text>
        <Text style={styles.subtitle}>Taller de Electrónica</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Usuario o Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresá tu usuario o correo"
            placeholderTextColor="#64748B"
            value={usuarioOEmail}
            onChangeText={setUsuarioOEmail}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresá tu contraseña"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tenés una cuenta? </Text>
            <TouchableOpacity onPress={() => router.navigate('/registro' as any)}>
              <Text style={styles.registerLink}>Registrate acá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  scrollContent: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#0F172A' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#64748B', marginBottom: 24 },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 6 },
  input: {
    backgroundColor: '#F1F4F9',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E9F0',
    fontSize: 16,
    marginBottom: 16,
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: { backgroundColor: '#64748B' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: { color: '#64748B', fontSize: 14 },
  registerLink: { color: '#2563EB', fontWeight: 'bold', fontSize: 14 },
});