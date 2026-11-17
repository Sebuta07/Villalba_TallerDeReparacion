import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Print from 'expo-print';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearCart, getCartItems, removeFromCart, updateQuantity } from '../../store/cartStore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.211/api_app';
const API_CARRITO = `${API_BASE}/cliente/carrito.php`;

interface FormaPago {
  formas_pago_id: number;
  forma: string;
}

export default function CarritoScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : null;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);

  // Métodos de pago (sin efectivo) + Mercado Pago QR
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
  const [formaPagoId, setFormaPagoId] = useState<number | null>(null);
  const [generandoQr, setGenerandoQr] = useState(false);
  const [urlQrMp, setUrlQrMp] = useState<string | null>(null);

  // Modalidad de entrega y formulario
  const [tipoEntrega, setTipoEntrega] = useState<'sucursal' | 'envio'>('sucursal');
  const [calle, setCalle] = useState('');
  const [manzana, setManzana] = useState('');
  const [casa, setCasa] = useState('');
  const [barrio, setBarrio] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Estados para el Modal del Mapa Interactivo
  const [modalMapaVisible, setModalMapaVisible] = useState(false);
  const [regionMapa, setRegionMapa] = useState({
    latitude: -26.1849,
    longitude: -58.1731,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [coordenadasPin, setCoordenadasPin] = useState({
    latitude: -26.1849,
    longitude: -58.1731,
  });

  // Modal de Comprobante
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
    cargarFormasPago();
  }, [usuarioId]);

  const cargarFormasPago = async () => {
    try {
      const res = await fetch(API_CARRITO);
      const json = await res.json();
      const lista: FormaPago[] = (json.formas_pago || []).filter(
        (fp: FormaPago) => !fp.forma.toLowerCase().includes('efectivo')
      );

      if (lista.length > 0) {
        setFormasPago(lista);
        setFormaPagoId(Number(lista[0].formas_pago_id));
      } else {
        // Respaldo si aún no hay filas cargadas en BD
        const fallback = [
          { formas_pago_id: 2, forma: 'Mercado Pago' },
          { formas_pago_id: 3, forma: 'Transferencia Bancaria' },
        ];
        setFormasPago(fallback);
        setFormaPagoId(2);
      }
    } catch {
      const fallback = [
        { formas_pago_id: 2, forma: 'Mercado Pago' },
        { formas_pago_id: 3, forma: 'Transferencia Bancaria' },
      ];
      setFormasPago(fallback);
      setFormaPagoId(2);
    }
  };

  const formaPagoSeleccionada = formasPago.find(
    (f) => Number(f.formas_pago_id) === Number(formaPagoId)
  );
  const esMercadoPago = formaPagoSeleccionada?.forma.toLowerCase().includes('mercado');
  const esTransferencia = formaPagoSeleccionada?.forma.toLowerCase().includes('transfer');

  const modificarCantidad = (id: number, delta: number) => {
    updateQuantity(id, delta);
    setItems([...getCartItems()]);
    setUrlQrMp(null); // Si cambia el total, invalida el QR anterior
  };

  const eliminarProducto = (id: number) => {
    removeFromCart(id);
    setItems([...getCartItems()]);
    setUrlQrMp(null);
  };

  const calcularTotal = () => {
    return items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  };

  // Generar código QR de Mercado Pago con la API de backend
  const generarQrMercadoPago = async () => {
    const total = calcularTotal();
    if (total <= 0) {
      Alert.alert('Atención', 'El carrito está vacío.');
      return;
    }

    try {
      setGenerandoQr(true);
      const res = await fetch(`${API_CARRITO}?accion=crear_preferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioId,
          monto: total
        })
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        Alert.alert('Error', 'Respuesta inválida del servidor: ' + text);
        return;
      }

      if (json.success && json.init_point) {
        setUrlQrMp(json.init_point);
      } else {
        Alert.alert('Error Mercado Pago', json.message || 'No se pudo generar el QR.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con Mercado Pago.');
    } finally {
      setGenerandoQr(false);
    }
  };

  // 1. OBTENER UBICACIÓN ACTUAL GPS AUTOMÁTICA
  const obtenerUbicacionGPS = async () => {
    try {
      setBuscandoUbicacion(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requieren permisos de ubicación.');
        setBuscandoUbicacion(false);
        return;
      }

      const ubicacion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = ubicacion.coords;

      setRegionMapa({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setCoordenadasPin({ latitude, longitude });

      await realizarGeocodificacionInversa(latitude, longitude);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación GPS.');
    } finally {
      setBuscandoUbicacion(false);
    }
  };

  // 2. GEOCODIFICACIÓN INVERSA
  const realizarGeocodificacionInversa = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
        headers: { 'User-Agent': 'FenixLabApp/1.0' }
      });
      const data = await response.json();

      if (data && data.address) {
        const dir = data.address;
        setCalle(dir.road || dir.pedestrian || dir.suburb || '');
        setBarrio(dir.neighbourhood || dir.city_district || dir.town || dir.city || '');
        if (dir.house_number) {
          setCasa(dir.house_number);
        }
        setObservaciones(`GPS Coordenadas: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
      }
    } catch (e) {
      console.log('Error geocodificación:', e);
    }
  };

  // 3. CONFIRMAR UBICACIÓN SELECCIONADA DESDE EL MAPA
  const confirmarUbicacionMapa = async () => {
    setModalMapaVisible(false);
    setBuscandoUbicacion(true);
    await realizarGeocodificacionInversa(coordenadasPin.latitude, coordenadasPin.longitude);
    setBuscandoUbicacion(false);
    Alert.alert('¡Ubicación establecida!', 'Se han autocompletado los datos con el mapa.');
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
    if (!formaPagoId) {
      Alert.alert('Atención', 'Selecciona un método de pago.');
      return;
    }
    if (tipoEntrega === 'envio' && (!calle.trim() || !barrio.trim() || !manzana.trim() || !casa.trim())) {
      Alert.alert('Atención', 'Por favor completa calle, manzana, casa y barrio para el envío.');
      return;
    }

    Alert.alert(
      'Confirmar Compra',
      `¿Confirmas tu compra por $${calcularTotal().toLocaleString('es-AR')} con ${formaPagoSeleccionada?.forma || 'pago digital'}?`,
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
      formData.append('forma_pago_id', String(formaPagoId));
      formData.append('tipo_entrega', tipoEntrega);
      formData.append('items', JSON.stringify(items));

      if (tipoEntrega === 'envio') {
        formData.append('calle', calle.trim());
        formData.append('manzana', manzana.trim());
        formData.append('casa', casa.trim());
        formData.append('barrio', barrio.trim());
        formData.append('observaciones', observaciones.trim());
      }

      const response = await fetch(API_CARRITO, {
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
          metodo_pago: formaPagoSeleccionada?.forma || 'Pago Digital',
          itemsComprados: [...items]
        });
        clearCart();
        setItems([]);
        setUrlQrMp(null);
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
            <tr><td><strong>Modalidad:</strong> ${datosComprobante.tipo_entrega === 'sucursal' ? 'Retiro en Sucursal' : 'Envío a Domicilio'}</td><td style="text-align:right;"><strong>Pago:</strong> ${datosComprobante.metodo_pago}</td></tr>
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

            {/* SECCIÓN MODALIDAD DE ENTREGA */}
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
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <TouchableOpacity
                      style={[styles.mapButton, { flex: 1 }]}
                      onPress={obtenerUbicacionGPS}
                      disabled={buscandoUbicacion}
                    >
                      {buscandoUbicacion ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <>
                          <Ionicons name="locate" size={16} color="#FFF" />
                          <Text style={styles.mapButtonText}>GPS Actual</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.mapButton, { flex: 1, backgroundColor: '#1D4ED8', borderColor: '#2563EB' }]}
                      onPress={() => setModalMapaVisible(true)}
                    >
                      <Ionicons name="map-outline" size={16} color="#FFF" />
                      <Text style={styles.mapButtonText}>Elegir en Mapa</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>Calle *</Text>
                  <TextInput style={styles.input} placeholder="Ej: Las Orquídeas" placeholderTextColor="#64748B" value={calle} onChangeText={setCalle} />

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Manzana *</Text>
                      <TextInput style={styles.input} placeholder="Ej: 48" placeholderTextColor="#64748B" value={manzana} onChangeText={setManzana} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Casa *</Text>
                      <TextInput style={styles.input} placeholder="Ej: 7" placeholderTextColor="#64748B" value={casa} onChangeText={setCasa} />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Barrio *</Text>
                  <TextInput style={styles.input} placeholder="Ej: Eva Perón" placeholderTextColor="#64748B" value={barrio} onChangeText={setBarrio} />

                  <Text style={styles.inputLabel}>Indicaciones / Observaciones</Text>
                  <TextInput style={styles.input} placeholder="Ej: Portón azul, calle de tierra..." placeholderTextColor="#64748B" value={observaciones} onChangeText={setObservaciones} />
                </View>
              )}
            </View>

            {/* SECCIÓN MÉTODO DE PAGO (SIN EFECTIVO + QR MERCADO PAGO) */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Método de Pago Online</Text>
              <Text style={styles.paymentSubText}>Selecciona cómo deseas abonar tu compra desde la app:</Text>

              <View style={styles.paymentGrid}>
                {formasPago.map((fp) => {
                  const activa = Number(formaPagoId) === Number(fp.formas_pago_id);
                  const nombreLower = fp.forma.toLowerCase();
                  let icono: any = 'card-outline';
                  if (nombreLower.includes('mercado')) icono = 'qr-code-outline';
                  else if (nombreLower.includes('transfer')) icono = 'swap-horizontal-outline';

                  return (
                    <TouchableOpacity
                      key={fp.formas_pago_id}
                      style={[styles.paymentChip, activa && styles.paymentChipActive]}
                      onPress={() => {
                        setFormaPagoId(Number(fp.formas_pago_id));
                        if (!nombreLower.includes('mercado')) {
                          setUrlQrMp(null);
                        }
                      }}
                    >
                      <Ionicons name={icono} size={18} color={activa ? '#FFF' : '#38BDF8'} />
                      <Text style={[styles.paymentChipText, activa && styles.paymentChipTextActive]}>
                        {fp.forma}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* PANEL MERCADO PAGO QR */}
              {esMercadoPago && (
                <View style={styles.mpBox}>
                  {!urlQrMp ? (
                    <TouchableOpacity
                      style={styles.btnMercadoPago}
                      onPress={generarQrMercadoPago}
                      disabled={generandoQr}
                    >
                      {generandoQr ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <>
                          <Ionicons name="qr-code-outline" size={18} color="#FFF" />
                          <Text style={styles.btnMercadoPagoText}>GENERAR QR DE MERCADO PAGO</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qrContainer}>
                      <Text style={styles.qrTitle}>Escaneá el QR con Mercado Pago para abonar ${calcularTotal().toLocaleString('es-AR')}</Text>
                      <Image
                        source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(urlQrMp)}` }}
                        style={styles.qrImage}
                      />

                      <TouchableOpacity
                        style={styles.openMpAppBtn}
                        onPress={() => Linking.openURL(urlQrMp)}
                      >
                        <Ionicons name="open-outline" size={16} color="#FFF" />
                        <Text style={styles.openMpAppText}>Abrir enlace en App Mercado Pago</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={generarQrMercadoPago} style={{ marginTop: 8 }}>
                        <Text style={styles.regenQrText}>Regenerar código QR</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* PANEL TRANSFERENCIA BANCARIA */}
              {esTransferencia && (
                <View style={styles.transferBox}>
                  <Text style={styles.transferTitle}>Datos para Transferencia:</Text>
                  <Text style={styles.transferRow}>• Alias: <Text style={styles.transferBold}>FENIX.LAB.FORMOSA</Text></Text>
                  <Text style={styles.transferRow}>• Titular: <Text style={styles.transferBold}>Fénix Lab Tech Shop</Text></Text>
                  <Text style={styles.transferHint}>Realiza la transferencia por ${calcularTotal().toLocaleString('es-AR')} y luego presiona "Finalizar Compra".</Text>
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

      {/* MODAL DEL MAPA INTERACTIVO */}
      <Modal visible={modalMapaVisible} animationType="slide" transparent={false} onRequestClose={() => setModalMapaVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#071026' }}>
          <View style={styles.headerMapModal}>
            <Text style={styles.title}>Selecciona tu Ubicación</Text>
            <TouchableOpacity onPress={() => setModalMapaVisible(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, position: 'relative' }}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={{ width: '100%', height: '100%' }}
              initialRegion={regionMapa}
              onRegionChangeComplete={(reg) => {
                setCoordenadasPin({ latitude: reg.latitude, longitude: reg.longitude });
              }}
            >
              <Marker
                coordinate={coordenadasPin}
                title="Punto de Entrega"
                description="Mueve el mapa para centrar el pin aquí"
              />
            </MapView>

            <View style={styles.markerFixed} pointerEvents="none">
              <Ionicons name="location" size={36} color="#EF4444" />
            </View>
          </View>

          <View style={styles.mapFooter}>
            <Text style={styles.mapHelperText}>Mueve el mapa para ubicar el marcador exactamente en tu domicilio.</Text>
            <TouchableOpacity style={styles.confirmMapBtn} onPress={confirmarUbicacionMapa}>
              <Text style={styles.confirmMapBtnText}>CONFIRMAR ESTA UBICACIÓN</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL BOTTOM SHEET DESLIZABLE DEL COMPROBANTE */}
      <Modal visible={modalComprobanteVisible} animationType="slide" transparent={true} onRequestClose={() => setModalComprobanteVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetDragHandle} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" style={{ alignSelf: 'center', marginBottom: 6 }} />
              <Text style={styles.sheetTitle}>¡Compra Confirmada!</Text>
              <Text style={styles.sheetSub}>Tu comprobante ha sido generado exitosamente</Text>

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
                <Text style={styles.ticketInfo}>
                  <Text style={styles.ticketInfoBold}>Método de Pago:</Text> {datosComprobante?.metodo_pago}
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
  mapButton: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: '#10B981' },
  mapButtonText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  inputLabel: { color: '#CBD5E1', fontSize: 11, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#0D1E42', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: '#FFF', fontSize: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },

  // Estilos Métodos de Pago y QR Mercado Pago
  paymentSubText: { color: '#94A3B8', fontSize: 11, marginBottom: 10 },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paymentChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0D1E42', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)' },
  paymentChipActive: { backgroundColor: '#2563EB', borderColor: '#38BDF8' },
  paymentChipText: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  paymentChipTextActive: { color: '#FFFFFF' },
  mpBox: { marginTop: 12, backgroundColor: '#0D1E42', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(0, 158, 227, 0.4)' },
  btnMercadoPago: { backgroundColor: '#009EE3', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10 },
  btnMercadoPagoText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  qrContainer: { alignItems: 'center', paddingVertical: 6 },
  qrTitle: { color: '#38BDF8', fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  qrImage: { width: 200, height: 200, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 8 },
  openMpAppBtn: { marginTop: 12, backgroundColor: '#009EE3', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  openMpAppText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  regenQrText: { color: '#94A3B8', fontSize: 11, textDecorationLine: 'underline' },
  transferBox: { marginTop: 12, backgroundColor: '#0D1E42', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)' },
  transferTitle: { color: '#38BDF8', fontSize: 12, fontWeight: '800', marginBottom: 6 },
  transferRow: { color: '#CBD5E1', fontSize: 12, marginBottom: 3 },
  transferBold: { color: '#FFFFFF', fontWeight: '800' },
  transferHint: { color: '#94A3B8', fontSize: 11, marginTop: 6, fontStyle: 'italic' },

  // Estilos del Modal de Mapa
  headerMapModal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#071026', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  markerFixed: { position: 'absolute', top: '50%', left: '50%', marginLeft: -18, marginTop: -36, alignItems: 'center', justifyContent: 'center' },
  mapFooter: { padding: 16, backgroundColor: '#13161F', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mapHelperText: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginBottom: 10 },
  confirmMapBtn: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  confirmMapBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

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