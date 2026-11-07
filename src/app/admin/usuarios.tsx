import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Direccion {
  direccion_id: number;
  calle?: string | null;
  numero?: string | number | null;
  barrio?: string | null;
  manzana?: string | number | null;
  casa?: string | number | null;
  piso_dpto?: string | null;
}

interface Pais {
  pais_id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  dni_cuit: string | number;
  direccion_id?: number | null;
  direccion_completa?: string | null;
  pais_id?: number | null;
  pais_nombre?: string | null;
  rol_id: number;
  genero_id: number;
  fecha_nacimiento?: string | null;
  estado_general_id: number;
}

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/admin/usuarios.php`;

export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dniCuit, setDniCuit] = useState('');
  const [direccionId, setDireccionId] = useState<number | null>(null);
  const [paisId, setPaisId] = useState<number | null>(null);
  const [rolId, setRolId] = useState<number>(1);
  const [generoId, setGeneroId] = useState<number>(1);
  const [fechaNacimiento, setFechaNacimiento] = useState('');

  useEffect(() => {
    obtenerUsuarios();
  }, [filtroEstado]);

  const obtenerUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?estado=${filtroEstado}`);
      const json = await response.json();
      if (json.success) {
        setUsuarios(json.data);
        if (json.direcciones) setDirecciones(json.direcciones);
        if (json.paises) setPaises(json.paises);
      } else {
        Alert.alert('Error', json.message || 'No se pudieron cargar los usuarios.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const guardarUsuario = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Atención', 'El campo de usuario y email son obligatorios.');
      return;
    }

    try {
      const method = editandoId ? 'PUT' : 'POST';
      const bodyData = {
        id: editandoId,
        username: String(username || '').trim(),
        password: password ? password : undefined,
        email: String(email || '').trim(),
        nombre: String(nombre || '').trim(),
        apellido: String(apellido || '').trim(),
        dni_cuit: String(dniCuit || '').trim(),
        direccion_id: direccionId,
        pais_id: paisId,
        rol_id: rolId,
        genero_id: generoId,
        fecha_nacimiento: String(fechaNacimiento || '').trim() ? String(fechaNacimiento).trim() : null,
      };

      const response = await fetch(API_URL, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const json = await response.json();

      if (json.success) {
        Alert.alert('Éxito', json.message);
        cerrarModal();
        obtenerUsuarios();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al guardar el usuario.');
    }
  };

  const confirmarEliminar = (id: number, nombreCompleto: string) => {
    Alert.alert(
      'Inhabilitar Usuario',
      `¿Estás seguro de inhabilitar al usuario "${nombreCompleto}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inhabilitar',
          style: 'destructive',
          onPress: () => cambiarEstadoUsuario(id, 'DELETE'),
        },
      ]
    );
  };

  const cambiarEstadoUsuario = async (id: number, me: 'DELETE' | 'PATCH') => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, { method: me });
      const json = await response.json();

      if (json.success) {
        Alert.alert('Operación exitosa', json.message);
        obtenerUsuarios();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo procesar la solicitud.');
    }
  };

  const generarPDF = async () => {
    const tituloFiltro =
      filtroEstado === 'todos'
        ? 'Todos los Usuarios'
        : filtroEstado === 'activos'
        ? 'Usuarios Activos'
        : 'Usuarios Inactivos';

    const filasHtml = usuariosFiltrados
      .map(
        (u, index) => `
        <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${u.id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${u.username ?? ''}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;"><b>${u.nombre ?? ''} ${u.apellido ?? ''}</b></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${u.email ?? ''}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${u.pais_nombre ?? 'No asignado'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${u.direccion_completa ?? 'Sin dirección'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: ${
            u.estado_general_id === 1 ? '#166534' : '#DC2626'
          }; font-weight: bold;">
            ${u.estado_general_id === 1 ? 'Activo' : 'Inactivo'}
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; background-color: #ffffff; color: #333; }
            h1 { text-align: center; color: #2563EB; font-size: 22px; margin-bottom: 5px; }
            p.subtitle { text-align: center; color: #64748B; font-size: 14px; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background-color: #2563EB; color: white; padding: 12px; text-align: left; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Taller</h1>
          <p class="subtitle">Reporte de Usuarios - ${tituloFiltro}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>País</th>
                <th>Dirección</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filasHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo generar el archivo PDF.');
    }
  };

  const abrirModalCrear = () => {
    setEditandoId(null);
    setUsername('');
    setPassword('');
    setEmail('');
    setNombre('');
    setApellido('');
    setDniCuit('');
    setDireccionId(null);
    setPaisId(null);
    setRolId(1);
    setGeneroId(1);
    setFechaNacimiento('');
    setModalVisible(true);
  };

  const abrirModalEditar = (u: Usuario) => {
    setEditandoId(u.id);
    setUsername(u.username ?? '');
    setPassword('');
    setEmail(u.email ?? '');
    setNombre(u.nombre ?? '');
    setApellido(u.apellido ?? '');
    setDniCuit(u.dni_cuit !== null && u.dni_cuit !== undefined ? String(u.dni_cuit) : '');
    setDireccionId(u.direccion_id ? Number(u.direccion_id) : null);
    setPaisId(u.pais_id ? Number(u.pais_id) : null);
    setRolId(u.rol_id ? Number(u.rol_id) : 1);
    setGeneroId(u.genero_id ? Number(u.genero_id) : 1);
    setFechaNacimiento(u.fecha_nacimiento ?? '');
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoId(null);
  };

  const usuariosFiltrados = usuarios
    .filter((u) => {
      const query = busqueda ? busqueda.toLowerCase() : '';
      const nombreMatch = u.nombre ? u.nombre.toLowerCase().includes(query) : false;
      const apellidoMatch = u.apellido ? u.apellido.toLowerCase().includes(query) : false;
      const usernameMatch = u.username ? u.username.toLowerCase().includes(query) : false;
      const emailMatch = u.email ? u.email.toLowerCase().includes(query) : false;
      const dniMatch = u.dni_cuit !== null && u.dni_cuit !== undefined ? String(u.dni_cuit).toLowerCase().includes(query) : false;
      const paisMatch = u.pais_nombre ? u.pais_nombre.toLowerCase().includes(query) : false;
      const direccionMatch = u.direccion_completa ? u.direccion_completa.toLowerCase().includes(query) : false;

      return nombreMatch || apellidoMatch || usernameMatch || emailMatch || dniMatch || paisMatch || direccionMatch;
    })
    .sort((a, b) => a.estado_general_id - b.estado_general_id);

  const formatearDireccion = (dir: Direccion) => {
    const partes: string[] = [];
    if (dir.calle && dir.calle.trim() !== '') {
      partes.push(dir.calle.trim());
      if (dir.numero) partes.push(String(dir.numero));
    }
    if (dir.barrio && dir.barrio.trim() !== '') partes.push(`B° ${dir.barrio.trim()}`);
    if (dir.manzana) partes.push(`Mz. ${dir.manzana}`);
    if (dir.casa) partes.push(`Casa ${dir.casa}`);
    if (dir.piso_dpto && dir.piso_dpto.trim() !== '') partes.push(`(${dir.piso_dpto.trim()})`);
    return partes.length > 0 ? partes.join(' ') : `Dirección #${dir.direccion_id}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'todos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('todos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'todos' && styles.filterBtnTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'activos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('activos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'activos' && styles.filterBtnTextActive]}>
            Activos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'inactivos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('inactivos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'inactivos' && styles.filterBtnTextActive]}>
            Inactivos
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topActionRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por usuario, nombre, país, dirección..."
          placeholderTextColor="#64748B"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <TouchableOpacity style={styles.addButton} onPress={abrirModalCrear}>
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={usuariosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const esActivo = item.estado_general_id === 1;
            const nombreCompleto = `${item.nombre ?? ''} ${item.apellido ?? ''}`.trim() || 'Sin Nombre';
            return (
              <View style={[styles.card, !esActivo && styles.cardDisabled]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, !esActivo && styles.cardTitleDisabled]}>
                    👤 {nombreCompleto} {!esActivo && '(Inactivo)'}
                  </Text>
                  <Text style={styles.cardSub}>@{item.username ?? 'sin_usuario'} | DNI: {item.dni_cuit ?? '-'}</Text>
                  <Text style={styles.cardSub}>País: {item.pais_nombre ?? 'No asignado'}</Text>
                  <Text style={styles.cardDir}>
                    📍 {item.direccion_completa ? item.direccion_completa : 'Sin dirección asignada'}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  {esActivo ? (
                    <>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => abrirModalEditar(item)}
                      >
                        <Text style={styles.editBtnText}>Modificar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => confirmarEliminar(item.id, nombreCompleto)}
                      >
                        <Text style={styles.deleteBtnText}>Inhabilitar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.activateBtn}
                      onPress={() => cambiarEstadoUsuario(item.id, 'PATCH')}
                    >
                      <Text style={styles.activateBtnText}>Activar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron usuarios registrados.</Text>
          }
        />
      )}

      <TouchableOpacity style={styles.fabPrintButton} onPress={generarPDF}>
        <Ionicons name="print-outline" size={26} color="#2563EB" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>
              {editandoId ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Usuario</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Username"
                placeholderTextColor="#64748B"
                value={username}
                onChangeText={setUsername}
              />

              <Text style={styles.inputLabel}>
                Contraseña <Text style={styles.optionalText}>{editandoId ? '(Dejar en blanco para no cambiar)' : '(Opcional)'}</Text>
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Password"
                placeholderTextColor="#64748B"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Email"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.inputLabel}>Nombre <Text style={styles.optionalText}>(Opcional)</Text></Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre"
                placeholderTextColor="#64748B"
                value={nombre}
                onChangeText={setNombre}
              />

              <Text style={styles.inputLabel}>Apellido <Text style={styles.optionalText}>(Opcional)</Text></Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Apellido"
                placeholderTextColor="#64748B"
                value={apellido}
                onChangeText={setApellido}
              />

              <Text style={styles.inputLabel}>DNI / CUIT <Text style={styles.optionalText}>(Opcional)</Text></Text>
              <TextInput
                style={styles.modalInput}
                placeholder="DNI o CUIT"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={dniCuit}
                onChangeText={setDniCuit}
              />

              <Text style={styles.inputLabel}>País / Nacionalidad</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={paisId}
                  onValueChange={(itemValue) => setPaisId(itemValue ? Number(itemValue) : null)}
                  style={styles.pickerStyle}
                  dropdownIconColor="#64748B"
                >
                  <Picker.Item label="-- Seleccione un país --" value={null} color="#64748B" />
                  {paises.map((pais) => (
                    <Picker.Item key={pais.pais_id} label={pais.nombre} value={pais.pais_id} color="#0F172A" />
                  ))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>Dirección <Text style={styles.optionalText}>(Opcional)</Text></Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={direccionId}
                  onValueChange={(itemValue) => setDireccionId(itemValue ? Number(itemValue) : null)}
                  style={styles.pickerStyle}
                  dropdownIconColor="#64748B"
                >
                  <Picker.Item label="-- Sin dirección seleccionada --" value={null} color="#64748B" />
                  {direcciones.map((dir) => (
                    <Picker.Item
                      key={dir.direccion_id}
                      label={formatearDireccion(dir)}
                      value={dir.direccion_id}
                      color="#0F172A"
                    />
                  ))}
                </Picker>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Rol</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={rolId}
                      onValueChange={(itemValue) => setRolId(Number(itemValue))}
                      style={styles.pickerStyle}
                      dropdownIconColor="#64748B"
                    >
                      <Picker.Item label="Administrador" value={1} color="#0F172A" />
                      <Picker.Item label="Recepcionista" value={2} color="#0F172A" />
                      <Picker.Item label="Técnico" value={3} color="#0F172A" />
                      <Picker.Item label="Cliente" value={4} color="#0F172A" />
                      <Picker.Item label="Comercio" value={5} color="#0F172A" />
                      <Picker.Item label="Paqueteria" value={6} color="#0F172A" />
                    </Picker>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Género</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={generoId}
                      onValueChange={(itemValue) => setGeneroId(Number(itemValue))}
                      style={styles.pickerStyle}
                      dropdownIconColor="#64748B"
                    >
                      <Picker.Item label="Masculino" value={1} color="#0F172A" />
                      <Picker.Item label="Femenino" value={2} color="#0F172A" />
                    </Picker>
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>
                Fecha de Nacimiento (YYYY-MM-DD) <Text style={styles.optionalText}>(Opcional)</Text>
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748B"
                value={fechaNacimiento}
                onChangeText={setFechaNacimiento}
              />
            </ScrollView>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={cerrarModal}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={guardarUsuario}
              >
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F4F6FA' },
  filterContainer: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  filterBtnText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  filterBtnTextActive: { color: '#FFFFFF' },
  topActionRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: '#0F172A',
  },
  addButton: {
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardDisabled: { backgroundColor: '#F1F4F9', opacity: 0.7, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  cardTitleDisabled: { color: '#64748B', fontStyle: 'italic' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardDir: { fontSize: 12, color: '#2563EB', marginTop: 4, fontWeight: '500' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#E8F0FE', padding: 8, borderRadius: 6 },
  editBtnText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 6 },
  deleteBtnText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  activateBtn: { backgroundColor: '#DCFCE7', padding: 8, borderRadius: 6 },
  activateBtnText: { color: '#166534', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 30, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 16, 38, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  inputLabel: { fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: '600', marginTop: 8 },
  optionalText: { color: '#64748B', fontWeight: 'normal' },
  modalInput: {
    backgroundColor: '#F1F4F9',
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  pickerContainer: {
    backgroundColor: '#F1F4F9',
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerStyle: {
    height: 50,
    width: '100%',
    color: '#0F172A',
  },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#E2E8F0' },
  cancelBtnText: { color: '#64748B', fontWeight: '600' },
  saveBtn: { backgroundColor: '#2563EB' },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  fabPrintButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});