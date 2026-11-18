import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const ventaId = params.ventaId || 'N/D';
  const empleadoId = params.empleadoId || 'N/D';
  const total = params.total || '0.00';
  const fecha = params.fecha || new Date().toLocaleString();
  
  const carrito = params.carrito ? JSON.parse(params.carrito as string) : [];

  const imprimirTicket = async () => {
    try {
      // HTML Blanco y Negro con letra Courier para impresión térmica 58mm/80mm
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
              <p>Soluciones Tecnológicas</p>
              <p>Ticket N°: ${ventaId}</p>
              <p>Fecha: ${fecha}</p>
              <p>Atendido por ID: ${empleadoId}</p>
            </div>
            
            <div class="line"></div>
            
            <table>
              <thead>
                <tr>
                  <th>Cant / Producto</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${carrito.map((item: any) => `
                  <tr>
                    <td>${item.cantidad}x ${item.nombre}<br/><small style="color: #555;">$${item.precio_venta} c/u</small></td>
                    <td style="text-align: right; vertical-align: top;">$${(Number(item.precio_venta) * item.cantidad).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="line"></div>
            
            <div class="total-container">
              <p class="total">TOTAL: $${Number(total).toFixed(2)}</p>
            </div>
            
            <div class="line"></div>
            
            <div class="footer">
              <p>¡Gracias por su compra!</p>
              <p>Conserve este ticket para la garantía.</p>
            </div>
          </body>
        </html>
      `;

      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo iniciar la impresión.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.ticketCard}>
        <Ionicons name="checkmark-circle" size={56} color="#10B981" style={{ alignSelf: 'center', marginBottom: 16 }} />
        <Text style={styles.title}>¡Venta Exitosa!</Text>
        <Text style={styles.subTitle}>Se ha generado el comprobante de pago</Text>
        
        <View style={styles.receiptContainer}>
          <Text style={styles.receiptHeader}>TICKET #{ventaId}</Text>
          <Text style={styles.fechaText}>{fecha}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Detalle de la Operación</Text>
          {carrito.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.itemText}>{item.cantidad}x {item.nombre}</Text>
                {item.observacionesItem ? <Text style={styles.obsText}>Obs: {item.observacionesItem}</Text> : null}
              </View>
              <Text style={styles.itemPrecio}>${(Number(item.precio_venta) * item.cantidad).toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Facturado:</Text>
            <Text style={styles.totalValue}>${Number(total).toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnPrint} onPress={imprimirTicket}>
          <Ionicons name="print-outline" size={20} color="#FFFFFF" />
          <Text style={styles.btnPrintText}> Imprimir Ticket Térmico</Text>
        </TouchableOpacity>

        {/* El botón de volver te envía de vuelta al Index limpio que hicimos antes */}
        <TouchableOpacity style={styles.btnVolver} onPress={() => router.replace('/recepcionista/productos')}>
          <Text style={styles.btnVolverText}>Ir al Panel Principal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  ticketCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginTop: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  subTitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  
  receiptContainer: {
    width: '100%',
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
  
  sectionHeader: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  itemText: { color: '#0F172A', fontSize: 13, fontWeight: '500' },
  obsText: { color: '#64748B', fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  itemPrecio: { color: '#0F172A', fontSize: 14, fontWeight: 'bold' },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, color: '#334155', fontWeight: 'bold' },
  totalValue: { fontSize: 20, color: '#2563EB', fontWeight: 'bold' },
  
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