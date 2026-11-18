import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_REGISTRO = `${process.env.EXPO_PUBLIC_API_URL}/registro.php`;

interface FormRegistro {
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni_cuit: string;
  genero_id: number;
}

export default function RegistroScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [terminosAceptados, setTerminosAceptados] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [form, setForm] = useState<FormRegistro>({
    username: '',
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    dni_cuit: '',
    genero_id: 1,
  });

  const handleChange = (key: keyof FormRegistro, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegistro = async () => {
    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.nombre.trim() ||
      !form.apellido.trim() ||
      !form.dni_cuit.trim()
    ) {
      Alert.alert('Atención', 'Por favor completá todos los campos obligatorios.');
      return;
    }

    if (!terminosAceptados) {
      Alert.alert('Atención', 'Debe aceptar los términos y condiciones para continuar con el registro.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        username: form.username.trim(),
        password: form.password,
        email: form.email.trim(),
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        dni_cuit: parseInt(form.dni_cuit.trim(), 10),
        genero_id: form.genero_id,
      };

      const response = await fetch(API_REGISTRO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const textResponse = await response.text();
      const data = JSON.parse(textResponse);

      if (response.ok || response.status === 201) {
        Alert.alert('Éxito', data.message || 'Te registraste correctamente.', [
          {
            text: 'Iniciar Sesión',
            onPress: () => router.replace('/'),
          },
        ]);
      } else {
        Alert.alert('Atención', data.message || 'No se pudo completar el registro.');
      }
    } catch (error) {
      console.error('Error de Fetch:', error);
      Alert.alert('Error de Red', 'No se pudo conectar con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Crear Cuenta</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Nombre de Usuario *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresá tu usuario"
            placeholderTextColor="#64748B"
            value={form.username}
            onChangeText={(val) => handleChange('username', val)}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Correo Electrónico *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresá tu correo"
            placeholderTextColor="#64748B"
            value={form.email}
            onChangeText={(val) => handleChange('email', val)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresá tu clave"
            placeholderTextColor="#64748B"
            value={form.password}
            onChangeText={(val) => handleChange('password', val)}
            secureTextEntry
          />

          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresá tu nombre"
            placeholderTextColor="#64748B"
            value={form.nombre}
            onChangeText={(val) => handleChange('nombre', val)}
          />

          <Text style={styles.label}>Apellido *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresá tu apellido"
            placeholderTextColor="#64748B"
            value={form.apellido}
            onChangeText={(val) => handleChange('apellido', val)}
          />

          <Text style={styles.label}>DNI / CUIT *</Text>
          <TextInput
            style={styles.input}
            placeholder="Sin puntos ni guiones"
            placeholderTextColor="#64748B"
            value={form.dni_cuit}
            onChangeText={(val) => handleChange('dni_cuit', val)}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Género *</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                form.genero_id === 1 && styles.genderButtonSelected,
              ]}
              onPress={() => handleChange('genero_id', 1)}
            >
              <Text
                style={[
                  styles.genderText,
                  form.genero_id === 1 && styles.genderTextSelected,
                ]}
              >
                Masculino
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                form.genero_id === 2 && styles.genderButtonSelected,
              ]}
              onPress={() => handleChange('genero_id', 2)}
            >
              <Text
                style={[
                  styles.genderText,
                  form.genero_id === 2 && styles.genderTextSelected,
                ]}
              >
                Femenino
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sección de Términos y Condiciones */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={[styles.checkbox, terminosAceptados && styles.checkboxChecked]}
              onPress={() => setTerminosAceptados(!terminosAceptados)}
            >
              {terminosAceptados && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsNormalText}>He leído y acepto los </Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={styles.termsLink}>Términos y Condiciones</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleRegistro}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tenés una cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace('/')}>
              <Text style={styles.loginLink}>Iniciá sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal con el Contrato Formal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Términos y Condiciones de Servicio</Text>
            
            <ScrollView 
              style={styles.modalScroll} 
              contentContainerStyle={styles.modalScrollContainer}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.contractText}>
                CONTRATO DE PRESTACION DE SERVICIOS TECNICOS Y CONDICIONES DE CUSTODIA DE EQUIPOS{'\n\n'}
                PRIMERO: El cliente entrega el equipo al establecimiento técnico bajo su entera responsabilidad, autorizando la revisión, diagnóstico y posterior presupuesto de reparación.{'\n\n'}
                SEGUNDO: Una vez finalizada la reparación y notificado el cliente, este dispondrá de un plazo máximo e improrrogable de noventa (90) días corridos (equivalente a un aproximado de 3 meses) para proceder al retiro definitivo del dispositivo y al pago total del importe presupuestado y acordado por los servicios prestados.{'\n\n'}
                TERCERO: Vencido el plazo estipulado en la cláusula precedente sin que el comitente haya retirado el dispositivo o abonado los saldos pendientes, se considerará al bien como formalmente ABANDONADO en los términos de la legislación vigente. En consecuencia, el taller técnico quedará plenamente facultado para disponer del dispositivo de la forma que considere conveniente, lo que incluye su uso personal, afectación a repuestos, donación, enajenación o venta directa a terceros para compensar los gastos de almacenaje, honorarios técnicos y lucro cesante, renunciando expresamente el cliente a cualquier reclamo posterior, indemnización o acción legal de índole civil o penal.{'\n\n'}
                CUARTO: El establecimiento no se hace responsable por equipos que presenten fallas preexistentes ocultas, daños por corrosión interna avanzada o deterioros derivados de manipulaciones previas ajenas a nuestro personal técnico.{'\n\n'}
                QUINTO: La aceptación digital de estos términos mediante el registro en el sistema implica la conformidad total e irrevocable con cada una de las cláusulas aquí expuestas.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setTerminosAceptados(true);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Aceptar y Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  scrollContent: { padding: 20, flexGrow: 1 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#0F172A', marginBottom: 20 },
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
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E9F0',
    backgroundColor: '#F1F4F9',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  genderText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  termsTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  termsNormalText: {
    color: '#64748B',
    fontSize: 14,
  },
  termsLink: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: { color: '#64748B', fontSize: 14 },
  loginLink: { color: '#2563EB', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    height: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScroll: {
    flex: 1,
    marginBottom: 15,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  modalScrollContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  contractText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});