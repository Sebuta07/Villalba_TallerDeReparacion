import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print'; // Asegúrate de tener instalado expo-print

export default function TicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const ventaId = params.ventaId || 'N/D';
  const empleadoId = params.empleadoId || 'N/D';
  const total = params.total || '0.00';
  const fecha = params.fecha || new Date().toLocaleString();
  
  // Reconstruir el carrito desde los parámetros
  const carrito = params.carrito ? JSON.parse(params.carrito as string) : [];

  const imprimirTicket = async () => {
    try {
      // Generar HTML simple para el ticket de impresión térmica o PDF
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: monospace; padding: 20px; color: #000; }
              h2, h3 { text-align: center; margin: 0; }
              .center { text-align: center; }
              .line { border-bottom: 1px dashed #000; margin: 10px 0; }
              table { width: 100%; border-collapse: collapse; }
              th, td { text-align: left; font-size: 12px; padding: 4px 0; }
              .total { font-size: 14px; font-weight: bold; text-align: right; }
            </style>
          </head>
          <body>
            <h2>COMPROBANTE DE VENTA</h2>
            <p class="center">Ticket N°: ${ventaId}</p>
            <p class="center">Fecha: ${fecha}</p>
            <p class="center">Empleado ID: ${empleadoId}</p>
            <div class="line"></div>
            <table>
              <thead>
                <tr>
                  <th>Cant. / Producto</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${carrito.map((item: any) => `
                  <tr>
                    <td>${item.cantidad}x ${item.nombre}<br/><small>$${item.precio_venta} c/u</small></td>
                    <td style="text-align: right; vertical-align: top;">$${(Number(item.precio_venta) * item.cantidad).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="line"></div>
            <p class="total">TOTAL: $${Number(total).toFixed(2)}</p>
            <div class="line"></div>
            <p class="center">¡Gracias por su compra!</p>
          </body>
        </html>
      `;

      // Invocar la función nativa de impresión de Expo
      await Print.printAsync({
        html: htmlContent
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo iniciar la impresión.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.ticketCard}>
        <Ionicons name="checkmark-circle" size={50} color="#4cd137" style={{ alignSelf: 'center', marginBottom: 10 }} />
        <Text style={styles.title}>¡Venta Exitosa!</Text>
        <Text style={styles.subTitle}>Ticket #{ventaId}</Text>
        <Text style={styles.fechaText}>{fecha}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionHeader}>Detalle de Productos</Text>
        {carrito.map((item: any, index: number) => (
          <View key={index} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemText}>{item.cantidad}x {item.nombre}</Text>
              {item.observacionesItem ? <Text style={styles.obsText}>Obs: {item.observacionesItem}</Text> : null}
            </View>
            <Text style={styles.itemPrecio}>${(Number(item.precio_venta) * item.cantidad).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Pagado:</Text>
          <Text style={styles.totalValue}>${Number(total).toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.btnPrint} onPress={imprimirTicket}>
          <Ionicons name="print" size={18} color="#fff" />
          <Text style={styles.btnPrintText}> Imprimir / Guardar Ticket</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btnVolver} 
          onPress={() => router.replace('/recepcionista/registrar_venta')} // Ajusta la ruta de vuelta a tu panel principal o de ventas
        >
          <Text style={styles.btnVolverText}>Nueva Venta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  ticketCard: { backgroundColor: '#161616', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#333', marginTop: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  subTitle: { fontSize: 15, color: '#aaa', textAlign: 'center', marginTop: 4 },
  fechaText: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 15 },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemText: { color: '#ccc', fontSize: 13 },
  obsText: { color: '#777', fontSize: 11, fontStyle: 'italic' },
  itemPrecio: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 16, color: '#aaa', fontWeight: 'bold' },
  totalValue: { fontSize: 20, color: '#4cd137', fontWeight: 'bold' },
  btnPrint: { backgroundColor: '#ff3333', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 10 },
  btnPrintText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  btnVolver: { backgroundColor: '#262626', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnVolverText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});