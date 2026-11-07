import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

export default function HistorialComprasScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ventas, setVentas] = useState<any[]>([]);

  // Estados para el Modal deslizable del comprobante
  const [modalVisible, setModalVisible] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);
  const [descargandoPDF, setDescargandoPDF] = useState(false);

  useEffect(() => {
    if (usuarioId) {
      fetchHistorial();
    } else {
      setLoading(false);
    }
  }, [usuarioId]);

  const fetchHistorial = async () => {
    if (!usuarioId) return;
    try {
      const res = await fetch(`${API_BASE}/cliente/historial_compras.php?usuario_id=${usuarioId}`);
      const json = await res.json();
      if (json.estado === 'success') {
        setVentas(json.ventas || []);
      }
    } catch (e) {
      console.error('Error al cargar historial de compras:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (!usuarioId) return;
    setRefreshing(true);
    fetchHistorial();
  };

  const abrirComprobante = (venta: any) => {
    setVentaSeleccionada(venta);
    setModalVisible(true);
  };

  // GENERAR E IMPRIMIR/EXPORTAR PDF USANDO Print.printAsync (Método Estilo Admin)
  const generarPDFComprobante = async () => {
    if (!ventaSeleccionada) return;
    setDescargandoPDF(true);

    const filasHtml = ventaSeleccionada.productos.map((i: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${i.producto_nombre}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center; color: #333;">${i.cantidad}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333;">$${Number(i.precio_venta || 0).toLocaleString('es-AR')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333;">$${Number(i.subtotal).toLocaleString('es-AR')}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Comprobante de Compra - Fénix Lab</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #ffffff; color: #333; padding: 25px; margin: 0; }
          .receipt-box { border: 1px solid #2563EB; border-radius: 12px; padding: 25px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #2563EB; padding-bottom: 15px; margin-bottom: 20px; }
          .title { color: #2563EB; font-size: 22px; font-weight: bold; margin: 0; text-transform: uppercase; }
          .sub { color: #64748B; font-size: 13px; margin-top: 4px; }
          .code-container { background-color: #F1F4F9; border: 1px dashed #2563EB; padding: 12px; text-align: center; border-radius: 8px; margin: 15px 0; }
          .code-title { color: #64748B; font-size: 10px; font-weight: bold; }
          .code-value { color: #2563EB; font-size: 20px; font-weight: bold; letter-spacing: 2px; }
          .meta-table { width: 100%; margin-bottom: 20px; font-size: 13px; color: #333; }
          .meta-table td { padding: 4px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          .items-table th { background-color: #2563EB; color: white; padding: 10px; text-align: left; }
          .total-box { text-align: right; border-top: 2px solid #2563EB; padding-top: 12px; font-size: 16px; font-weight: bold; color: #166534; }
          .footer { text-align: center; font-size: 11px; color: #64748B; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <h1 class="title">FÉNIX LAB - TECH SHOP</h1>
            <div class="sub">Comprobante Historial de Compra</div>
          </div>

          <div class="code-container">
            <div class="code-title">CÓDIGO DE COMPROBANTE / RETIRO</div>
            <div class="code-value">${ventaSeleccionada.codigo_comprobante}</div>
          </div>

          <table class="meta-table">
            <tr><td><strong>Orden de Venta:</strong> #${ventaSeleccionada.venta_id}</td><td style="text-align:right;"><strong>Fecha:</strong> ${ventaSeleccionada.fecha_venta}</td></tr>
            <tr><td><strong>Estado:</strong> Completado / Registrado</td><td style="text-align:right;"><strong>Sucursal:</strong> Casa Central</td></tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align:center;">Cant.</th>
                <th style="text-align:right;">Precio Unit.</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${filasHtml}
            </tbody>
          </table>

          <div class="total-box">
            TOTAL ABONADO: $${Number(ventaSeleccionada.total).toLocaleString('es-AR')}
          </div>

          <div class="footer">
            Gracias por tu preferencia • Fénix Lab Soporte Técnico y Ventas.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await Print.printAsync({ html: htmlContent });
    } catch (e) {
      console.error(e);
    } finally {
      setDescargandoPDF(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loaderText}>Cargando historial de compras...</Text>
      </View>
    );
  }

  if (!usuarioId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Compras y Pedidos</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.emptyTitle}>Sesión no identificada</Text>
          <Text style={styles.emptySub}>Por favor inicia sesión correctamente</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Compras y Pedidos</Text>
        <Text style={styles.subtitle}>Toca una compra para ver su comprobante</Text>
      </View>

      <FlatList
        data={ventas}
        keyExtractor={(item) => item.venta_id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#64748B" />
            <Text style={styles.emptyTitle}>Aún no tienes compras registradas</Text>
            <Text style={styles.emptySub}>Adquiere productos desde el catálogo</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => abrirComprobante(item)}>
            
            {/* CABECERA DE LA VENTA */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.ticketCode}>{item.codigo_comprobante}</Text>
                <Text style={styles.fechaText}>{item.fecha_venta}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>VER TICKET</Text>
              </View>
            </View>

            {/* LISTA DE PRODUCTOS DE ESTA VENTA */}
            <View style={styles.productsBox}>
              {item.productos.map((prod: any, idx: number) => (
                <View key={idx} style={styles.productRow}>
                  <Text style={styles.prodName} numberOfLines={1}>
                    • {prod.producto_nombre} <Text style={styles.prodCant}>x{prod.cantidad}</Text>
                  </Text>
                  <Text style={styles.prodSub}>${Number(prod.subtotal).toLocaleString('es-AR')}</Text>
                </View>
              ))}
            </View>

            {/* TOTAL */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Pagado:</Text>
              <Text style={styles.totalValue}>${Number(item.total).toLocaleString('es-AR')}</Text>
            </View>

          </TouchableOpacity>
        )}
      />

      {/* MODAL BOTTOM SHEET DESLIZABLE PARA EL COMPROBANTE */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            
            <View style={styles.sheetDragHandle} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Ionicons name="receipt-outline" size={42} color="#38BDF8" style={{ alignSelf: 'center', marginBottom: 4 }} />
              <Text style={styles.sheetTitle}>Detalle del Comprobante</Text>
              <Text style={styles.sheetSub}>Comprobante oficial de la transacción</Text>

              {ventaSeleccionada && (
                <View style={styles.ticketBox}>
                  <Text style={styles.ticketLabel}>CÓDIGO DE RETIRO / COMPROBANTE</Text>
                  <Text style={styles.ticketCodeLarge}>{ventaSeleccionada.codigo_comprobante}</Text>

                  <View style={styles.divider} />

                  <Text style={styles.ticketInfo}>
                    <Text style={styles.ticketInfoBold}>Venta Nº:</Text> #{ventaSeleccionada.venta_id}
                  </Text>
                  <Text style={styles.ticketInfo}>
                    <Text style={styles.ticketInfoBold}>Fecha:</Text> {ventaSeleccionada.fecha_venta}
                  </Text>

                  <View style={styles.divider} />

                  <Text style={styles.itemsHeaderTitle}>Productos Adquiridos:</Text>
                  {ventaSeleccionada.productos.map((p: any, idx: number) => (
                    <View key={idx} style={styles.itemRowModal}>
                      <Text style={styles.itemNameModal} numberOfLines={1}>• {p.producto_nombre} (x{p.cantidad})</Text>
                      <Text style={styles.itemSubModal}>${Number(p.subtotal).toLocaleString('es-AR')}</Text>
                    </View>
                  ))}

                  <View style={styles.divider} />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>Total Abonado:</Text>
                    <Text style={{ color: '#10B981', fontWeight: '800', fontSize: 16 }}>${Number(ventaSeleccionada.total).toLocaleString('es-AR')}</Text>
                  </View>
                </View>
              )}

              {/* BOTÓN IMPRIMIR / DESCARGAR PDF */}
              <TouchableOpacity style={styles.pdfBtn} onPress={generarPDFComprobante} disabled={descargandoPDF}>
                {descargandoPDF ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="document-text-outline" size={18} color="#FFF" />
                    <Text style={styles.pdfBtnText}>IMPRIMIR / DESCARGAR COMPROBANTE</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* BOTÓN CERRAR */}
              <TouchableOpacity
                style={styles.closeSheetBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeSheetText}>CERRAR</Text>
              </TouchableOpacity>
            </ScrollView>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#071026' },
  loaderText: { color: '#CBD5E1', marginTop: 10, fontSize: 13, fontWeight: '600' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#13161F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  ticketCode: { color: '#F59E0B', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  fechaText: { color: '#64748B', fontSize: 11, marginTop: 2 },
  badge: { backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: '#38BDF8' },
  badgeText: { color: '#38BDF8', fontSize: 10, fontWeight: '800' },
  productsBox: { backgroundColor: '#0D1E42', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.15)' },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  prodName: { color: '#FFFFFF', fontSize: 13, flex: 1, marginRight: 10 },
  prodCant: { color: '#38BDF8', fontSize: 11, fontWeight: '700' },
  prodSub: { color: '#CBD5E1', fontSize: 13, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)', paddingTop: 10 },
  totalLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  totalValue: { color: '#10B981', fontSize: 16, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptySub: { color: '#64748B', fontSize: 12, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.85)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#13161F', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  sheetDragHandle: { width: 40, height: 4, backgroundColor: '#64748B', borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  sheetSub: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 2, marginBottom: 16 },
  ticketBox: { backgroundColor: '#0D1E42', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)', marginBottom: 16 },
  ticketLabel: { color: '#64748B', fontSize: 9, fontWeight: '800', textAlign: 'center' },
  ticketCodeLarge: { color: '#F59E0B', fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: 2, marginTop: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginVertical: 10 },
  ticketInfo: { color: '#CBD5E1', fontSize: 12, marginBottom: 4 },
  ticketInfoBold: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  itemsHeaderTitle: { color: '#38BDF8', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  itemRowModal: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemNameModal: { color: '#FFFFFF', fontSize: 12, flex: 1, marginRight: 8 },
  itemSubModal: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  pdfBtn: { backgroundColor: '#2563EB', flexDirection: 'row', gap: 8, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  pdfBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  closeSheetBtn: { backgroundColor: '#0D1E42', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  closeSheetText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' }
});