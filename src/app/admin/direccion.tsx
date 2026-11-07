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

interface Pais { pais_id: number; nombre: string; }
interface Provincia { provincia_id: number; nombre: string; }
interface Ciudad { ciudad_id: number; nombre: string; }
interface CodigoPostal { codigo_postal_id: number; codigo: string; }

interface Direccion {
  id: number;
  provincia_id?: number | null;
  provincia_nombre?: string | null;
  ciudad_id?: number | null;
  ciudad_nombre?: string | null;
  codigo_postal_id?: number | null;
  codigo_postal_valor?: string | null;
  calle?: string | null;
  numero?: string | null;
  barrio?: string | null;
  manzana?: string | null;
  casa?: string | null;
  piso_dpto?: string | null;
  observaciones?: string | null;
  estado_general_id: number;
  pais_id?: number | null;
  pais_nombre?: string | null;
  direccion_completa?: string | null;
}

const API_URL =`${process.env.EXPO_PUBLIC_API_URL}/admin/direccion.php`;

export default function DireccionesScreen() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [codigosPostales, setCodigosPostales] = useState<CodigoPostal[]>([]);

  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [paisId, setPaisId] = useState<number | null>(null);
  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [ciudadId, setCiudadId] = useState<number | null>(null);
  const [codigoPostalId, setCodigoPostalId] = useState<number | null>(null);
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [barrio, setBarrio] = useState('');
  const [manzana, setManzana] = useState('');
  const [casa, setCasa] = useState('');
  const [pisoDpto, setPisoDpto] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    obtenerDirecciones();
  }, [filtroEstado]);

  const obtenerDirecciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?estado=${filtroEstado}`);
      const json = await response.json();
      if (json.success) {
        setDirecciones(json.data);
        if (json.paises) setPaises(json.paises);
        if (json.provincias) setProvincias(json.provincias);
        if (json.ciudades) setCiudades(json.ciudades);
        if (json.codigos_postales) setCodigosPostales(json.codigos_postales);
      } else {
        Alert.alert('Error', json.message || 'No se pudieron cargar las direcciones.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const guardarDireccion = async () => {
    try {
      const method = editandoId ? 'PUT' : 'POST';
      const bodyData = {
        id: editandoId,
        pais_id: paisId,
        provincia_id: provinciaId,
        ciudad_id: ciudadId,
        codigo_postal_id: codigoPostalId,
        calle: calle.trim(),
        numero: numero.trim(),
        barrio: barrio.trim(),
        manzana: manzana.trim(),
        casa: casa.trim(),
        piso_dpto: pisoDpto.trim(),
        observaciones: observaciones.trim(),
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
        obtenerDirecciones();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al guardar la dirección.');
    }
  };

  const confirmarInhabilitar = (id: number, descripcion: string) => {
    Alert.alert(
      'Inhabilitar Dirección',
      `¿Estás seguro de inhabilitar la dirección "${descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inhabilitar',
          style: 'destructive',
          onPress: () => cambiarEstadoDireccion(id, 'DELETE'),
        },
      ]
    );
  };

  const cambiarEstadoDireccion = async (id: number, method: 'DELETE' | 'PATCH') => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, { method });
      const json = await response.json();

      if (json.success) {
        Alert.alert('Éxito', json.message);
        obtenerDirecciones();
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo procesar la solicitud.');
    }
  };

  const generarPDF = async () => {
    const filasHtml = direccionesFiltradas
      .map(
        (d, index) => `
        <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">#${d.id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${d.direccion_completa || 'Sin detalles'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${d.barrio || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${d.ciudad_nombre || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${d.provincia_nombre || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${d.pais_nombre || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: ${
            d.estado_general_id === 1 ? '#166534' : '#DC2626'
          };">
            ${d.estado_general_id === 1 ? 'Activa' : 'Inactiva'}
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
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th { background-color: #2563EB; color: white; padding: 12px; text-align: left; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Taller</h1>
          <p class="subtitle">Reporte de Direcciones</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Dirección</th>
                <th>Barrio</th>
                <th>Ciudad</th>
                <th>Provincia</th>
                <th>País</th>
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
    setPaisId(null);
    setProvinciaId(null);
    setCiudadId(null);
    setCodigoPostalId(null);
    setCalle('');
    setNumero('');
    setBarrio('');
    setManzana('');
    setCasa('');
    setPisoDpto('');
    setObservaciones('');
    setModalVisible(true);
  };

  const abrirModalEditar = (d: Direccion) => {
    setEditandoId(d.id);
    setPaisId(d.pais_id ?? null);
    setProvinciaId(d.provincia_id ?? null);
    setCiudadId(d.ciudad_id ?? null);
    setCodigoPostalId(d.codigo_postal_id ?? null);
    setCalle(d.calle ?? '');
    setNumero(d.numero ?? '');
    setBarrio(d.barrio ?? '');
    setManzana(d.manzana ?? '');
    setCasa(d.casa ?? '');
    setPisoDpto(d.piso_dpto ?? '');
    setObservaciones(d.observaciones ?? '');
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoId(null);
  };

  const direccionesFiltradas = direcciones.filter(
    (d) =>
      (d.calle && d.calle.toLowerCase().includes(busqueda.toLowerCase())) ||
      (d.barrio && d.barrio.toLowerCase().includes(busqueda.toLowerCase())) ||
      (d.ciudad_nombre && d.ciudad_nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (d.provincia_nombre && d.provincia_nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (d.pais_nombre && d.pais_nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Direcciones</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'todos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('todos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'todos' && styles.filterBtnTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'activos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('activos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'activos' && styles.filterBtnTextActive]}>Activos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filtroEstado === 'inactivos' && styles.filterBtnActive]}
          onPress={() => setFiltroEstado('inactivos')}
        >
          <Text style={[styles.filterBtnText, filtroEstado === 'inactivos' && styles.filterBtnTextActive]}>Inactivos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topActionRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por calle, barrio, ciudad, país..."
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
          data={direccionesFiltradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const esActiva = item.estado_general_id === 1;
            return (
              <View style={[styles.card, !esActiva && styles.cardDisabled]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, !esActiva && styles.cardTitleDisabled]}>
                    📍 {item.direccion_completa || `Dirección #${item.id}`}
                  </Text>
                  <Text style={styles.cardSub}>
                    {item.barrio ? `B° ${item.barrio} | ` : ''}
                    {item.ciudad_nombre || 'Ciudad N/D'}, {item.provincia_nombre || 'Provincia N/D'}
                  </Text>
                  <Text style={styles.cardSub}>País: {item.pais_nombre || 'No asignado'}</Text>
                  {item.observaciones ? <Text style={styles.cardObs}>Obs: {item.observaciones}</Text> : null}
                </View>

                <View style={styles.actionButtons}>
                  {esActiva ? (
                    <>
                      <TouchableOpacity style={styles.editBtn} onPress={() => abrirModalEditar(item)}>
                        <Text style={styles.editBtnText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmarInhabilitar(item.id, item.direccion_completa || 'esta dirección')}>
                        <Text style={styles.deleteBtnText}>Inhabilitar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.activateBtn} onPress={() => cambiarEstadoDireccion(item.id, 'PATCH')}>
                      <Text style={styles.activateBtnText}>Activar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron direcciones registradas.</Text>}
        />
      )}

      <TouchableOpacity style={styles.fabPrintButton} onPress={generarPDF}>
        <Ionicons name="print-outline" size={26} color="#2563EB" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={cerrarModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>{editandoId ? 'Editar Dirección' : 'Nueva Dirección'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>País</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={paisId} onValueChange={(val) => setPaisId(val ? Number(val) : null)} style={styles.pickerStyle} dropdownIconColor="#2563EB">
                  <Picker.Item label="-- Seleccione un país --" value={null} color="#64748B" />
                  {paises.map((p) => (<Picker.Item key={p.pais_id} label={p.nombre} value={p.pais_id} color="#0F172A" style={{ backgroundColor: '#FFFFFF' }} />))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>Provincia</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={provinciaId} onValueChange={(val) => setProvinciaId(val ? Number(val) : null)} style={styles.pickerStyle} dropdownIconColor="#2563EB">
                  <Picker.Item label="-- Seleccione provincia --" value={null} color="#64748B" />
                  {provincias.map((pr) => (<Picker.Item key={pr.provincia_id} label={pr.nombre} value={pr.provincia_id} color="#0F172A" style={{ backgroundColor: '#FFFFFF' }} />))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>Ciudad</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={ciudadId} onValueChange={(val) => setCiudadId(val ? Number(val) : null)} style={styles.pickerStyle} dropdownIconColor="#2563EB">
                  <Picker.Item label="-- Seleccione ciudad --" value={null} color="#64748B" />
                  {ciudades.map((c) => (<Picker.Item key={c.ciudad_id} label={c.nombre} value={c.ciudad_id} color="#0F172A" style={{ backgroundColor: '#FFFFFF' }} />))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>Código Postal</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={codigoPostalId} onValueChange={(val) => setCodigoPostalId(val ? Number(val) : null)} style={styles.pickerStyle} dropdownIconColor="#2563EB">
                  <Picker.Item label="-- Seleccione código postal --" value={null} color="#64748B" />
                  {codigosPostales.map((cp) => (<Picker.Item key={cp.codigo_postal_id} label={cp.codigo} value={cp.codigo_postal_id} color="#0F172A" style={{ backgroundColor: '#FFFFFF' }} />))}
                </Picker>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.inputLabel}>Calle</Text>
                  <TextInput style={styles.modalInput} placeholder="Calle" placeholderTextColor="#64748B" value={calle} onChangeText={setCalle} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Número</Text>
                  <TextInput style={styles.modalInput} placeholder="Nº" placeholderTextColor="#64748B" value={numero} onChangeText={setNumero} />
                </View>
              </View>

              <Text style={styles.inputLabel}>Barrio</Text>
              <TextInput style={styles.modalInput} placeholder="Barrio" placeholderTextColor="#64748B" value={barrio} onChangeText={setBarrio} />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Manzana</Text>
                  <TextInput style={styles.modalInput} placeholder="Mz." placeholderTextColor="#64748B" value={manzana} onChangeText={setManzana} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Casa</Text>
                  <TextInput style={styles.modalInput} placeholder="Casa" placeholderTextColor="#64748B" value={casa} onChangeText={setCasa} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Piso / Dpto</Text>
                  <TextInput style={styles.modalInput} placeholder="Piso/Dpto" placeholderTextColor="#64748B" value={pisoDpto} onChangeText={setPisoDpto} />
                </View>
              </View>

              <Text style={styles.inputLabel}>Observaciones</Text>
              <TextInput style={styles.modalInput} placeholder="Observaciones adicionales" placeholderTextColor="#64748B" value={observaciones} onChangeText={setObservaciones} />
            </ScrollView>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={cerrarModal}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={guardarDireccion}>
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
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
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  cardTitleDisabled: { color: '#64748B', fontStyle: 'italic' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardObs: { fontSize: 11, color: '#DC2626', marginTop: 2, fontStyle: 'italic' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#E8F0FE', padding: 8, borderRadius: 6 },
  editBtnText: { color: '#2563EB', fontSize: 13, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 6 },
  deleteBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  activateBtn: { backgroundColor: '#DCFCE7', padding: 8, borderRadius: 6 },
  activateBtnText: { color: '#166534', fontWeight: 'bold', fontSize: 13 },
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
  modalInput: {
    backgroundColor: '#F1F4F9',
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  pickerStyle: { height: 45, width: '100%', color: '#0F172A' },
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