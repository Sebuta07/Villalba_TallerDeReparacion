import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  // Recepción de parámetros
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
    // Formato HTML en blanco y negro puro, con letra Courier ideal para impresoras térmicas
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; font-size: 14px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 0; font-size: 20px; font-weight: bold; }
            .header p { margin: 2px 0; font-size: 12px; color: #333; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { text-align: left; padding: 6px 0; }
            th { border-bottom: 1px solid #000; font-weight: bold; }
            .total-container { text-align: right; margin-top: 15px; }
            .total { font-size: 18px; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #333; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>FÉNIX LAB</h2>
            <p>Laboratorio Técnico</p>
            <p>Comprobante de Recepción: #${ordenId}</p>
            <p>Fecha: ${fecha}</p>
            <p>Atendido por ID: ${empleadoId} | Cliente ID: ${usuarioId}</p>
          </div>
          
          <div class="line"></div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 2px 0; font-weight: bold;">Datos del Equipo:</p>
            <p style="margin: 2px 0;">S/N: ${numeroSerie}</p>
            <p style="margin: 2px 0;">IMEI: ${imei}</p>
            <p style="margin: 2px 0;">Falla reportada: ${diagnosticoCliente}</p>
          </div>

          <div class="line"></div>
          
          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${carrito.map(item => {
                const precio = Number(item.precio_venta) || Number(item.costo) || 0;
                const sub = precio * (item.cantidad || 1);
                return `
                  <tr>
                    <td>${item.cantidad || 1}x ${item.nombre}<br/><small style="color: #555;">${item.observacionesItem || ''}</small></td>
                    <td style="text-align: right; vertical-align: top;">$${sub.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="line"></div>
          
          <div class="total-container">
            <p class="total">Total Estimado: $${Number(total).toFixed(2)}</p>
          </div>
          
          <div class="line"></div>
          
          <div class="footer">
            <p>El equipo ingresa a revisión técnica.</p>
            <p>El técnico se comunicará con el diagnóstico final.</p>
          </div>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error('Error al imprimir:', error);
      Alert.alert('Error', 'No se pudo iniciar la impresión.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.cardComprobante}>
        <Ionicons name="checkmark-circle" size={56} color="#10B981" style={{ alignSelf: 'center', marginBottom: 16 }} />
        <Text style={styles.tituloComprobante}>¡Orden Registrada!</Text>
        <Text style={styles.subtituloComprobante}>El equipo ha ingresado al taller</Text>

        <View style={styles.receiptContainer}>
          <Text style={styles.receiptHeader}>COMPROBANTE #{ordenId}</Text>
          <Text style={styles.fechaText}>{fecha}</Text>

          <View style={styles.divider} />

          <View style={styles.seccionDetalle}>
            <Text style={styles.labelInfo}>Cliente ID: <Text style={styles.valorInfo}>{usuarioId}</Text></Text>
            <Text style={styles.labelInfo}>Atendido por ID: <Text style={styles.valorInfo}>{empleadoId}</Text></Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.seccionDetalle}>
            <Text style={styles.subseccionTitulo}>Datos del Equipo</Text>
            <Text style={styles.labelInfo}>Nº Serie: <Text style={styles.valorInfo}>{numeroSerie}</Text></Text>
            <Text style={styles.labelInfo}>IMEI: <Text style={styles.valorInfo}>{imei}</Text></Text>
            <Text style={styles.labelInfo}>Falla: <Text style={styles.valorInfo}>{diagnosticoCliente}</Text></Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.seccionDetalle}>
            <Text style={styles.subseccionTitulo}>Servicios Solicitados</Text>
            {carrito.map((item, index) => {
              const precio = Number(item.precio_venta) || Number(item.costo) || 0;
              const sub = precio * (item.cantidad || 1);
              return (
                <View key={index} style={styles.itemFila}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.itemNombre}>{item.nombre} (x{item.cantidad || 1})</Text>
                    {item.observacionesItem ? <Text style={styles.itemObs}>Obs: {item.observacionesItem}</Text> : null}
                  </View>
                  <Text style={styles.itemPrecio}>${sub.toFixed(2)}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimado:</Text>
            <Text style={styles.totalAmount}>${Number(total).toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnPrint} onPress={imprimirComprobante}>
          <Ionicons name="print-outline" size={20} color="#FFFFFF" />
          <Text style={styles.btnPrintText}> Imprimir Comprobante</Text>
        </TouchableOpacity>

        {/* Botón corregido que redirige a servicios */}
        <TouchableOpacity style={styles.btnVolver} onPress={() => router.replace('/recepcionista/servicios')}>
          <Text style={styles.btnVolverText}>Ir a Servicios</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  contentContainer: { alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  cardComprobante: { 
    backgroundColor: '#FFFFFF', 
    width: '100%', 
    maxWidth: 500, 
    padding: 24, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    marginTop: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tituloComprobante: { color: '#0F172A', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtituloComprobante: { color: '#64748B', fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  
  receiptContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 24
  },
  receiptHeader: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  fechaText: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4 },
  
  divider: { height: 1, backgroundColor: '#CBD5E1', marginVertical: 16, borderStyle: 'dashed' },
  
  seccionDetalle: { marginBottom: 4 },
  subseccionTitulo: { color: '#334155', fontSize: 13, fontWeight: 'bold', marginBottom: 12 },
  labelInfo: { color: '#64748B', fontSize: 13, marginBottom: 6 },
  valorInfo: { color: '#0F172A', fontWeight: 'bold' },
  
  itemFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 6 },
  itemNombre: { color: '#0F172A', fontSize: 13, fontWeight: '500' },
  itemObs: { color: '#64748B', fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  itemPrecio: { color: '#0F172A', fontSize: 14, fontWeight: 'bold' },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#334155', fontSize: 15, fontWeight: 'bold' },
  totalAmount: { color: '#2563EB', fontSize: 20, fontWeight: 'bold' },
  
  btnPrint: { 
    width: '100%',
    backgroundColor: '#2563EB', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 14, 
    borderRadius: 10, 
    marginBottom: 12,
    shadowColor: '#2563EB',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2 
  },
  btnPrintText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
  
  btnVolver: { 
    width: '100%',
    backgroundColor: '#F1F5F9', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  btnVolverText: { color: '#334155', fontSize: 14, fontWeight: 'bold' },
});