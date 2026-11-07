import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/comercio/ordenes.php`;

export default function OrdenesScreen() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [filtradas, setFiltradas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useLocalSearchParams();
  const comercioId = params.comercioId || 1;

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrdenes(data.ordenes);
          setFiltradas(data.ordenes);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleBuscar = (texto: string) => {
    setBusqueda(texto);
    if (!texto.trim()) {
      setFiltradas(ordenes);
      return;
    }
    const query = texto.toLowerCase();
    const resultado = ordenes.filter(item => {
      const nombreCompleto = `${item.cliente_nombre} ${item.cliente_apellido}`.toLowerCase();
      const dniStr = item.dni_cuit ? item.dni_cuit.toString() : '';
      return nombreCompleto.includes(query) || dniStr.includes(query);
    });
    setFiltradas(resultado);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#2563EB" size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Órdenes de Reparación</Text>
      
      <TextInput
        style={styles.inputBusqueda}
        placeholder="Buscar por DNI o Nombre del cliente..."
        placeholderTextColor="#64748B"
        value={busqueda}
        onChangeText={handleBuscar}
      />

      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.reparacion_orden_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeader}>Orden #{item.reparacion_orden_id}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.estado_or || 'Pendiente'}</Text>
              </View>
            </View>

            <Text style={styles.text}>Cliente: <Text style={styles.highlight}>{item.cliente_nombre} {item.cliente_apellido}</Text> (DNI: {item.dni_cuit || 'N/A'})</Text>
            <Text style={styles.text}>Equipo: <Text style={styles.highlight}>{item.marca} {item.modelo}</Text> (S/N: {item.numero_serie || 'N/A'})</Text>
            <Text style={styles.text}>Técnico Asignado: <Text style={styles.highlight}>{item.tecnico_nombre ? `${item.tecnico_nombre} ${item.tecnico_apellido}` : 'Sin técnico asignado'}</Text></Text>
            <Text style={styles.text}>Problema: {item.diagnostico_cliente || 'Sin descripción'}</Text>
            
            <View style={styles.footerCard}>
              <Text style={styles.total}>Presupuesto: ${item.presupuesto || '0.00'}</Text>
              
              <TouchableOpacity 
                style={styles.btnPresupuesto}
                onPress={() => router.push({
                  pathname: '/comercio/presupuesto' as any,
                  params: { 
                    comercioId, 
                    ordenId: item.reparacion_orden_id, 
                    montoActual: item.presupuesto,
                    clienteNombre: `${item.cliente_nombre} ${item.cliente_apellido}`,
                    equipoInfo: `${item.marca} ${item.modelo}`
                  }
                })}
              >
                <Text style={styles.btnPresupuestoText}>Gestionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  center: { flex: 1, backgroundColor: '#F4F6FA', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, textAlign: 'center' },
  inputBusqueda: { backgroundColor: '#FFFFFF', color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 15, fontSize: 14, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardHeader: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FDE68A' },
  badgeText: { color: '#D97706', fontSize: 11, fontWeight: 'bold' },
  text: { color: '#475569', fontSize: 13, marginBottom: 4 },
  highlight: { color: '#0F172A', fontWeight: '500' },
  footerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  total: { color: '#166534', fontWeight: 'bold', fontSize: 14 },
  btnPresupuesto: { backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  btnPresupuestoText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }
});