import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearCart, getCartItems, removeFromCart, updateQuantity } from '../../store/cartStore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';

export default function CarritoScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : null;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modalidad de entrega y formulario
  const [tipoEntrega, setTipoEntrega] = useState<'sucursal' | 'envio'>('sucursal');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [barrio, setBarrio] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Modal interactivo deslizable de comprobante
  const [modalComprobanteVisible, setModalComprobanteVisible] = useState(false);
  const [datosComprobante, setDatosComprobante] = useState<any>(null);
  const [descargandoPDF, setDescargandoPDF] = useState(false);

  useEffect(() => {
    if (!usuarioId) {
      Alert.alert('Sesión Requerida', 'No se detectó un usuario activo.', [
        { text: 'Volver', onPress: () => router.back() }
      ]);
      return;
    }
    setItems([...getCartItems()]);
  }, [usuarioId]);

  const modificarCantidad = (id: number, delta: number) => {
    updateQuantity(id, delta);
    setItems([...getCartItems()]);
  };

  const eliminarProducto = (id: number) => {
    removeFromCart(id);
    setItems([...getCartItems()]);
  };

  const calcularTotal = () => {
    return items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  };

  const procesarCompra = () => {
    if (!usuarioId) {
      Alert.alert('Error', 'No se ha detectado el usuario logueado.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Atención', 'El carrito está vacío.');
      return;
    }

    if (tipoEntrega === 'envio' && (!calle.trim() || !barrio.trim())) {
      Alert.alert('Atención', 'Completa la calle y el barrio para realizar el envío.');
      return;
    }

    Alert.alert(
      'Confirmar Compra',
      `¿Deseas confirmar tu compra por $${calcularTotal().toLocaleString('es-AR')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, Confirmar', onPress: () => enviarPedidoServidor() }
      ]
    );
  };

  const enviarPedidoServidor = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('usuario_id', String(usuarioId));
      formData.append('forma_pago_id', '2');
      formData.append('tipo_entrega', tipoEntrega);
      formData.append('items', JSON.stringify(items));

      if (tipoEntrega === 'envio') {
        formData.append('calle', calle.trim());
        formData.append('numero', numero.trim());
        formData.append('barrio', barrio.trim());
        formData.append('observaciones', observaciones.trim());
      }

      const response = await fetch(`${API_BASE}/cliente/carrito.php`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (json.success) {
        setDatosComprobante({
          venta_id: json.venta_id,
          codigo: json.codigo_comprobante,
          total: json.total,
          fecha: new Date().toLocaleDateString('es-AR'),
          hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          tipo_entrega: json.tipo_entrega,
          itemsComprados: [...items]
        });
        clearCart();
        setItems([]);
        setModalComprobanteVisible(true);
      } else {
        Alert.alert('Error', json.error || 'No se pudo procesar la compra.');
      }
    } catch (e) {
      Alert.alert('Error', 'Falla de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // GENERAR Y MOSTRAR COMPROBANTE PDF USANDO Print.printAsync (Método Estilo Admin)
  const generarPDFComprobante = async () => {
    if (!datosComprobante) return;
    setDescargandoPDF(true);

    const filasHtml = datosComprobante.itemsComprados.map((i: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #333;">${i.nombre}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center; color: #333;">${i.cantidad}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333;">$${Number(i.precio).toLocaleString('es-AR')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333;">$${(i.precio * i.cantidad).toLocaleString('es-AR')}</td>
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
            <div class="sub">Comprobante Digital de Compra</div>
          </div>

          <div class="code-container">
            <div class="code-title">CÓDIGO DE COMPROBANTE / RETIRO</div>
            <div class="code-value">${datosComprobante.codigo}</div>
          </div>

          <table class="meta-table">
            <tr><td><strong>Orden de Venta:</strong> #${datosComprobante.venta_id}</td><td style="text-align:right;"><strong>Fecha:</strong> ${datosComprobante.fecha} ${datosComprobante.hora}</td></tr>
            <tr><td><strong>Modalidad:</strong> ${datosComprobante.tipo_entrega === 'sucursal' ? 'Retiro en Sucursal' : 'Envío a Domicilio'}</td><td style="text-align:right;"><strong>Estado:</strong> Registrado / Pendiente</td></tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align:center;">Cant.</th>
                <th style="text-align:right;">Precio</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${filasHtml}
            </tbody>
          </table>

          <div class="total-box">
            TOTAL ABONADO: $${Number(datosComprobante.total).toLocaleString('es-AR')}
          </div>

          <div class="footer">
            Gracias por tu compra en Fénix Lab • Conserve este recibo para retiro o reclamos.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await Print.printAsync({ html: htmlContent });
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar o imprimir el comprobante PDF.');
    } finally {
      setDescargandoPDF(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#38BDF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Carrito de Compras</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={56} color="#64748B" />
            <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
            <Text style={styles.emptySub}>Regresa al catálogo para agregar productos</Text>
          </View>
        ) : (
          <>
            {items.map((item) => (
              <View key={item.id} style={styles.card}>
                <Image source={{ uri: item.imagen }} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.nombre}</Text>
                  <Text style={styles.cardPrice}>${item.precio.toLocaleString('es-AR')}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => modificarCantidad(item.id, -1)}>
                        <Ionicons name="remove" size={14} color="#38BDF8" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.cantidad}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => modificarCantidad(item.id, 1)}>
                        <Ionicons name="add" size={14} color="#38BDF8" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => eliminarProducto(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Modalidad de Entrega</Text>
              
              <View style={styles.deliveryRow}>
                <TouchableOpacity
                  style={[styles.deliveryBtn, tipoEntrega === 'sucursal' && styles.deliveryBtnActive]}
                  onPress={() => setTipoEntrega('sucursal')}
                >
                  <Ionicons name="storefront-outline" size={16} color={tipoEntrega === 'sucursal' ? '#FFF' : '#94A3B8'} />
                  <Text style={[styles.deliveryText, tipoEntrega === 'sucursal' && styles.deliveryTextActive]}>Retiro en Sucursal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deliveryBtn, tipoEntrega === 'envio' && styles.deliveryBtnActive]}
                  onPress={() => setTipoEntrega('envio')}
                >
                  <Ionicons name="car-outline" size={16} color={tipoEntrega === 'envio' ? '#FFF' : '#94A3B8'} />
                  <Text style={[styles.deliveryText, tipoEntrega === 'envio' && styles.deliveryTextActive]}>Envío a Domicilio</Text>
                </TouchableOpacity>
              </View>

              {tipoEntrega === 'envio' && (
                <View style={styles.addressForm}>
                  <Text style={styles.inputLabel}>Calle *</Text>
                  <TextInput style={styles.input} placeholder="Ej: Av. Gutnisky" placeholderTextColor="#64748B" value={calle} onChangeText={setCalle} />

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Número</Text>
                      <TextInput style={styles.input} placeholder="Ej: 2450" placeholderTextColor="#64748B" value={numero} onChangeText={setNumero} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Barrio *</Text>
                      <TextInput style={styles.input} placeholder="Ej: Centro" placeholderTextColor="#64748B" value={barrio} onChangeText={setBarrio} />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Indicaciones</Text>
                  <TextInput style={styles.input} placeholder="Portón azul, etc." placeholderTextColor="#64748B" value={observaciones} onChangeText={setObservaciones} />
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.footerContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a Pagar:</Text>
            <Text style={styles.totalValue}>${calcularTotal().toLocaleString('es-AR')}</Text>
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={procesarCompra} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.checkoutBtnText}>FINALIZAR COMPRA</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL BOTTOM SHEET DESLIZABLE DEL COMPROBANTE */}
      <Modal visible={modalComprobanteVisible} animationType="slide" transparent={true} onRequestClose={() => setModalComprobanteVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            
            <View style={styles.sheetDragHandle} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" style={{ alignSelf: 'center', marginBottom: 6 }} />
              <Text style={styles.sheetTitle}>¡Compra Confirmada!</Text>
              <Text style={styles.sheetSub}>Tu comprobante ha sido generado exitosamente</Text>

              {/* TICKET VISUAL DEL COMPROBANTE */}
              <View style={styles.ticketBox}>
                <Text style={styles.ticketLabel}>CÓDIGO DE RETIRO / COMPROBANTE</Text>
                <Text style={styles.ticketCode}>{datosComprobante?.codigo}</Text>

                <View style={styles.divider} />

                <Text style={styles.ticketInfo}>
                  <Text style={styles.ticketInfoBold}>Venta Nº:</Text> #{datosComprobante?.venta_id}
                </Text>
                <Text style={styles.ticketInfo}>
                  <Text style={styles.ticketInfoBold}>Fecha:</Text> {datosComprobante?.fecha} {datosComprobante?.hora}
                </Text>
                <Text style={styles.ticketInfo}>
                  <Text style={styles.ticketInfoBold}>Modalidad:</Text> {datosComprobante?.tipo_entrega === 'sucursal' ? 'Retiro en Sucursal' : 'Envío a Domicilio'}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.itemsHeaderTitle}>Desglose de Ítems:</Text>
                {datosComprobante?.itemsComprados?.map((prod: any, idx: number) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={1}>• {prod.nombre} (x{prod.cantidad})</Text>
                    <Text style={styles.itemSub}>${(prod.precio * prod.cantidad).toLocaleString('es-AR')}</Text>
                  </View>
                ))}

                <View style={styles.divider} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>Total Abonado:</Text>
                  <Text style={{ color: '#10B981', fontWeight: '800', fontSize: 16 }}>${Number(datosComprobante?.total || 0).toLocaleString('es-AR')}</Text>
                </View>
              </View>

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
                onPress={() => {
                  setModalComprobanteVisible(false);
                  router.replace({ pathname: '/cliente/listado_productos', params: { usuarioId } });
                }}
              >
                <Text style={styles.closeSheetText}>VOLVER AL CATÁLOGO</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { backgroundColor: '#0D1E42', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: '#13161F', borderRadius: 14, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  cardImage: { width: 90, height: 90 },
  cardBody: { flex: 1, padding: 10 },
  cardTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  cardPrice: { color: '#10B981', fontSize: 14, fontWeight: '800', marginBottom: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D1E42', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  qtyBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  qtyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', paddingHorizontal: 6 },
  sectionCard: { backgroundColor: '#13161F', borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  deliveryRow: { flexDirection: 'row', gap: 10 },
  deliveryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0D1E42', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  deliveryBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  deliveryText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  deliveryTextActive: { color: '#FFFFFF' },
  addressForm: { marginTop: 12 },
  inputLabel: { color: '#CBD5E1', fontSize: 11, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#0D1E42', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: '#FFF', fontSize: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySub: { color: '#64748B', fontSize: 12, marginTop: 4 },
  footerContainer: { padding: 16, backgroundColor: '#13161F', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  totalValue: { color: '#10B981', fontSize: 20, fontWeight: '800' },
  checkoutBtn: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.85)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#13161F', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  sheetDragHandle: { width: 40, height: 4, backgroundColor: '#64748B', borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  sheetSub: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 2, marginBottom: 16 },
  ticketBox: { backgroundColor: '#0D1E42', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)', marginBottom: 16 },
  ticketLabel: { color: '#64748B', fontSize: 9, fontWeight: '800', textAlign: 'center' },
  ticketCode: { color: '#F59E0B', fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: 2, marginTop: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginVertical: 10 },
  ticketInfo: { color: '#CBD5E1', fontSize: 12, marginBottom: 4 },
  ticketInfoBold: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  itemsHeaderTitle: { color: '#38BDF8', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { color: '#FFFFFF', fontSize: 12, flex: 1, marginRight: 8 },
  itemSub: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  pdfBtn: { backgroundColor: '#2563EB', flexDirection: 'row', gap: 8, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  pdfBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  closeSheetBtn: { backgroundColor: '#0D1E42', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  closeSheetText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' }
});