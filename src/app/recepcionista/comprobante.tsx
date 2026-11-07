import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';

interface ItemServicio {
  servicios_id: number;
  nombre: string;
  precio_venta?: number;
  costo?: number;
  cantidad: number;
  observacionesItem?: string;
}

export default function ComprobanteServicioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const ordenId = params.ordenId ? String(params.ordenId) : 'N/D';
  const empleadoId = params.empleadoId ? String(params.empleadoId) : '1';
  const usuarioId = params.usuarioId ? String(params.usuarioId) : 'N/D';
  const total = params.total ? String(params.total) : '0.00';
  const fecha = params.fecha ? String(params.fecha) : new Date().toLocaleString();
  
  const numeroSerie = params.numeroSerie ? String(params.numeroSerie) : 'Sin especificar';
  const imei = params.imei ? String(params.imei) : 'Sin especificar';
  const diagnosticoCliente = params.diagnosticoCliente ? String(params.diagnosticoCliente) : 'Sin observaciones';

  const carrito: ItemServicio[] = params.carrito 
    ? JSON.parse(params.carrito as string) 
    : [];

  const imprimirComprobante = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; color: #ff3333; }
            .info { margin-bottom: 15px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <h2>COMPROBANTE DE ORDEN DE REPARACIÓN</h2>
          <div class="info">
            <p><strong>Nº de Orden:</strong> #${ordenId}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>ID Cliente:</strong> ${usuarioId}</p>
            <p><strong>Atendido por (Empleado):</strong> ID #${empleadoId}</p>
          </div>
          <hr/>
          <div class="info">
            <h3>Detalles del Equipo</h3>
            <p><strong>Nº de Serie:</strong> ${numeroSerie}</p>
            <p><strong>IMEI:</strong> ${imei}</p>
            <p><strong>Diagnóstico / Falla:</strong> ${diagnosticoCliente}</p>
          </div>
          <h3>Servicios Solicitados</h3>
          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Cant.</th>
                <th>Observación</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${carrito.map(item => {
                const precio = Number(item.precio_venta) || Number(item.costo) || 0;
                const sub = precio * (item.cantidad || 1);
                return `
                  <tr>
                    <td>${item.nombre}</td>
                    <td>${item.cantidad || 1}</td>
                    <td>${item.observacionesItem || '-'}</td>
                    <td>$${sub.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <p class="total">Total Estimado: $${Number(total).toFixed(2)}</p>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error('Error al imprimir:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.cardComprobante}>
        <Ionicons name="checkmark-circle" size={50} color="#4cd137" style={{ alignSelf: 'center', marginBottom: 10 }} />
        <Text style={styles.tituloComprobante}>¡Orden Registrada con Éxito!</Text>
        <Text style={styles.subtituloComprobante}>Orden N° #{ordenId}</Text>

        <View style={styles.seccionDetalle}>
          <Text style={styles.labelInfo}>Fecha: <Text style={styles.valorInfo}>{fecha}</Text></Text>
          <Text style={styles.labelInfo}>Cliente ID: <Text style={styles.valorInfo}>{usuarioId}</Text></Text>
          <Text style={styles.labelInfo}>Atendido por ID: <Text style={styles.valorInfo}>{empleadoId}</Text></Text>
        </View>

        <View style={styles.seccionDetalle}>
          <Text style={styles.subseccionTitulo}>Datos del Equipo</Text>
          <Text style={styles.labelInfo}>Nº Serie: <Text style={styles.valorInfo}>{numeroSerie}</Text></Text>
          <Text style={styles.labelInfo}>IMEI: <Text style={styles.valorInfo}>{imei}</Text></Text>
          <Text style={styles.labelInfo}>Falla: <Text style={styles.valorInfo}>{diagnosticoCliente}</Text></Text>
        </View>

        <View style={styles.seccionDetalle}>
          <Text style={styles.subseccionTitulo}>Servicios</Text>
          {carrito.map((item, index) => {
            const precio = Number(item.precio_venta) || Number(item.costo) || 0;
            const sub = precio * (item.cantidad || 1);
            return (
              <View key={index} style={styles.itemFila}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNombre}>{item.nombre} (x{item.cantidad || 1})</Text>
                  {item.observacionesItem ? <Text style={styles.itemObs}>Obs: {item.observacionesItem}</Text> : null}
                </View>
                <Text style={styles.itemPrecio}>${sub.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${Number(total).toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.btnPrint} onPress={imprimirComprobante}>
          <Ionicons name="print-outline" size={18} color="#fff" />
          <Text style={styles.btnPrintText}>Imprimir / Guardar PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnVolver} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.btnVolverText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  contentContainer: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  cardComprobante: { backgroundColor: '#1e1e1e', width: '100%', maxWidth: 500, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2c2c2c' },
  tituloComprobante: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtituloComprobante: { color: '#ff3333', fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  seccionDetalle: { backgroundColor: '#181818', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#2c2c2c' },
  subseccionTitulo: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#2c2c2c', paddingBottom: 4 },
  labelInfo: { color: '#888', fontSize: 13, marginBottom: 4 },
  valorInfo: { color: '#fff', fontWeight: '500' },
  itemFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#262626' },
  itemNombre: { color: '#fff', fontSize: 13, fontWeight: '500' },
  itemObs: { color: '#888', fontSize: 11, fontStyle: 'italic' },
  itemPrecio: { color: '#ff3333', fontSize: 13, fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10, paddingHorizontal: 4 },
  totalLabel: { color: '#aaa', fontSize: 16, fontWeight: 'bold' },
  totalAmount: { color: '#4cd137', fontSize: 20, fontWeight: 'bold' },
  btnPrint: { backgroundColor: '#ff3333', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 10, gap: 8, marginTop: 10 },
  btnPrintText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  btnVolver: { backgroundColor: '#2c2c2c', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnVolverText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});