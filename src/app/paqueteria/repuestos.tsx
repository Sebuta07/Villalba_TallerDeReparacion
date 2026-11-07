import * as Print from 'expo-print';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_REPUESTOS = `${process.env.EXPO_PUBLIC_API_URL}/paqueteria/recibir_repuestos.php`;

export default function RepuestosScreen() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarPedidos(); }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_REPUESTOS);
      const data = await res.json();
      if (data.success) {
        const pendientes = data.pedidos.filter((p: any) => Number(p.estado_general_id) !== 2);
        setPedidos(pendientes);
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const imprimirListadoCompleto = async () => {
    if (pedidos.length === 0) {
      Alert.alert('Atención', 'No hay repuestos pendientes para imprimir.');
      return;
    }

    let filasHTML = pedidos.map((p, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.producto_nombre}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${p.cantidad}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.usuario_nombre} ${p.usuario_apellido}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #333; }
            h2 { text-align: center; color: #2563EB; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #2563EB; color: white; padding: 10px; text-align: left; font-size: 13px; }
            td { font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>REMITO LOGÍSTICO DE REPUESTOS PENDIENTES</h2>
          <table>
            <thead>
              <tr>
                <th>PRODUCTO</th>
                <th>CANTIDAD</th>
                <th>SOLICITANTE</th>
              </tr>
            </thead>
            <tbody>
              ${filasHTML}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({ html: htmlContent });
    } catch {
      Alert.alert('Error', 'No se pudo generar la impresión.');
    }
  };

  const realizarControlYActualizarStock = async (item: any) => {
    Alert.alert(
      'Confirmar Control de Repuestos',
      `¿Se verificó la recepción de "${item.producto_nombre}" (Cantidad: ${item.cantidad})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar y Actualizar Stock',
          onPress: async () => {
            try {
              const res = await fetch(API_REPUESTOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  envios_sucursal_id: item.envios_sucursal_id,
                  productos_id: item.productos_id,
                  cantidad: item.cantidad
                })
              });
              const json = await res.json();
              if (json.success) {
                Alert.alert('¡Stock Actualizado!', json.message);
                cargarPedidos();
              } else {
                Alert.alert('Error', json.message);
              }
            } catch {
              Alert.alert('Error', 'Falla de conexión con el servidor.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recepción y Control de Repuestos</Text>

      <TouchableOpacity style={styles.btnPrintAll} onPress={imprimirListadoCompleto}>
        <Text style={styles.btnPrintText}>Imprimir Listado Completo</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.envios_sucursal_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prodName}>{item.producto_nombre}</Text>
                <Text style={styles.text}>Cantidad: <Text style={styles.orange}>{item.cantidad} unidades</Text></Text>
                <Text style={styles.text}>Solicitado por: {item.usuario_nombre} {item.usuario_apellido}</Text>
                {item.observaciones ? <Text style={styles.text}>Obs: {item.observaciones}</Text> : null}
              </View>

              <TouchableOpacity style={styles.btnControl} onPress={() => realizarControlYActualizarStock(item)}>
                <Text style={styles.btnTextSmall}>Controlar</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay repuestos pendientes de control.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F4F6FA' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, textAlign: 'center' },
  btnPrintAll: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#2563EB', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 14, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  btnPrintText: { color: '#2563EB', fontWeight: 'bold', fontSize: 13 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  prodName: { color: '#0F172A', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  text: { color: '#475569', fontSize: 12, marginBottom: 2 },
  orange: { color: '#D97706', fontWeight: 'bold' },
  btnControl: { backgroundColor: '#166534', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, shadowColor: '#166534', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  btnTextSmall: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 30, fontSize: 14 }
});