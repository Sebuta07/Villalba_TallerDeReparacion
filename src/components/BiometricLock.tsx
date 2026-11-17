import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function BiometricLock({ children }: { children: ReactNode }) {
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const autenticar = async () => {
    try {
      setVerificando(true);
      setErrorMsg(null);

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const configurada = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !configurada) {
        setDesbloqueado(true);
        return;
      }

      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquear Fénix Lab',
        fallbackLabel: 'Usar PIN del teléfono',
        disableDeviceFallback: false,
      });

      if (res.success) {
        setDesbloqueado(true);
      } else {
        setErrorMsg('No se pudo verificar tu identidad.');
      }
    } catch {
      setErrorMsg('Error al iniciar la autenticación.');
    } finally {
      setVerificando(false);
    }
  };

  useEffect(() => {
    autenticar();
  }, []);

  if (desbloqueado) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="finger-print" size={64} color="#38BDF8" />
      <Text style={styles.title}>Fénix Lab bloqueado</Text>
      <Text style={styles.subtitle}>Usa tu huella o el PIN de tu celular para entrar.</Text>

      {verificando ? (
        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 20 }} />
      ) : (
        <>
          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
          <TouchableOpacity style={styles.btn} onPress={autenticar}>
            <Ionicons name="lock-open-outline" size={18} color="#FFF" />
            <Text style={styles.btnText}>Desbloquear</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 16 },
  subtitle: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  error: { color: '#F87171', fontSize: 12, marginBottom: 14, textAlign: 'center' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10 },
  btnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});