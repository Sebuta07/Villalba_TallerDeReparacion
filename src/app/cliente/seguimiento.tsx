import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = `${process.env.EXPO_PUBLIC_API_URL}/cliente/estado_dispositivo.php`;

const METODOS_DIGITALES_EXTRA = [
  { id: 'mp', nombre: 'Mercado Pago' },
  { id: 'binance', nombre: 'Binance Pay' },
  { id: 'debito', nombre: 'Tarjeta de Débito' },
  { id: 'credito', nombre: 'Tarjeta de Crédito' },
  { id: 'transferencia', nombre: 'Transferencia Bancaria' },
];

export default function SeguimientoDispositivoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const usuarioId = params.usuarioId ? Number(params.usuarioId) : null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [metodosPagoBD, setMetodosPagoBD] = useState<any[]>(METODOS_DIGITALES_EXTRA);

  // Chat
  const [chatVisible, setChatVisible] = useState(false);
  const [ordenActiva, setOrdenActiva] = useState<any>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Pagos
  const [ordenSeleccionadaPago, setOrdenSeleccionadaPago] = useState<number | null>(null);
  const [montoIngresado, setMontoIngresado] = useState('');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('Mercado Pago');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);

  // QR Mercado Pago
  const [generandoQr, setGenerandoQr] = useState(false);
  const [urlQrMp, setUrlQrMp] = useState<string | null>(null);

  // Datos de Tarjeta (Débito / Crédito)
  const [numTarjeta, setNumTarjeta] = useState('');
  const [titularTarjeta, setTitularTarjeta] = useState('');
  const [vencimientoTarjeta, setVencimientoTarjeta] = useState('');
  const [cvvTarjeta, setCvvTarjeta] = useState('');

  useEffect(() => {
    if (usuarioId) {
      fetchOrdenes();
    } else {
      setLoading(false);
    }
  }, [usuarioId]);

  const fetchOrdenes = async () => {
    if (!usuarioId) return;
    try {
      const res = await fetch(`${API_BASE}?usuario_id=${usuarioId}`);
      const json = await res.json();

      if (json.estado === 'success') {
        const listaOrdenes = json.ordenes || [];
        setOrdenes(listaOrdenes);

        if (ordenActiva) {
          const actualizada = listaOrdenes.find((o: any) => o.orden_id === ordenActiva.orden_id);
          if (actualizada) setOrdenActiva(actualizada);
        }

        const desdeBD = (json.metodos_pago || []).filter(
          (m: any) => !String(m.nombre || '').toLowerCase().includes('efectivo')
        );
        const combinados = [...desdeBD];
        METODOS_DIGITALES_EXTRA.forEach((extra) => {
          const yaExiste = combinados.some(
            (c) => String(c.nombre || '').toLowerCase() === extra.nombre.toLowerCase()
          );
          if (!yaExiste) combinados.push(extra);
        });

        setMetodosPagoBD(combinados);
        if (combinados.length > 0 && !metodoSeleccionado) {
          setMetodoSeleccionado(combinados[0].nombre);
        }
      }
    } catch (e) {
      console.error('Error al obtener seguimiento:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (!usuarioId) return;
    setRefreshing(true);
    fetchOrdenes();
  };

  const abrirChat = (orden: any) => {
    setOrdenActiva(orden);
    setChatVisible(true);
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !ordenActiva) return;

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('reparacion_orden_id', String(ordenActiva.orden_id));
      formData.append('mensaje', nuevoMensaje.trim());

      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setNuevoMensaje('');
        fetchOrdenes();
      }
    } catch (e) {
      console.error('Error al enviar mensaje:', e);
    } finally {
      setEnviando(false);
    }
  };

  const generarQrMercadoPago = async (orden: any) => {
    const montoNum = parseFloat(montoIngresado);
    const saldoPendiente = Math.max(Number(orden.total || 0) - Number(orden.pagado || 0), 0);

    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Atención', 'Ingresa un monto válido mayor a $0 para generar el QR.');
      return;
    }
    if (saldoPendiente > 0 && montoNum > saldoPendiente) {
      Alert.alert('Atención', `El monto ingresado supera el saldo pendiente ($${saldoPendiente.toLocaleString('es-AR')}).`);
      return;
    }

    setGenerandoQr(true);
    try {
      const res = await fetch(`${API_BASE}?accion=crear_preferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reparacion_orden_id: orden.orden_id,
          monto: montoNum,
        }),
      });

      const textResponse = await res.text();
      let json;
      try {
        json = JSON.parse(textResponse);
      } catch {
        Alert.alert('Error', 'Respuesta no válida del servidor: ' + textResponse);
        return;
      }

      if (json.success && json.init_point) {
        setUrlQrMp(json.init_point);
      } else {
        Alert.alert('Error Mercado Pago', json.message || 'No se pudo generar el QR.');
      }
    } catch {
      Alert.alert('Error', 'Fallo al conectar con la API de Mercado Pago.');
    } finally {
      setGenerandoQr(false);
    }
  };

  const enviarPagoPersonalizado = async (orden: any) => {
    const montoNum = parseFloat(montoIngresado);
    const saldoPendiente = Number(orden.total) - Number(orden.pagado || 0);

    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Atención', 'Por favor ingresa una cantidad válida de dinero.');
      return;
    }

    if (montoNum > saldoPendiente) {
      Alert.alert('Atención', `El monto ingresado supera el saldo pendiente ($${saldoPendiente.toLocaleString('es-AR')}).`);
      return;
    }

    const metodoLower = (metodoSeleccionado || '').toLowerCase();
    if (
      (metodoLower.includes('débito') ||
        metodoLower.includes('debito') ||
        metodoLower.includes('crédito') ||
        metodoLower.includes('credito')) &&
      numTarjeta.trim().length < 12
    ) {
      Alert.alert('Datos incompletos', 'Por favor completa los datos de la tarjeta.');
      return;
    }

    let refFinal = referenciaPago.trim();
    if (!refFinal && numTarjeta.trim().length >= 4) {
      refFinal = `Tarjeta terminada en ${numTarjeta.trim().slice(-4)}`;
    }

    setProcesandoPago(true);
    try {
      const formData = new FormData();
      formData.append('accion', 'pagar');
      formData.append('reparacion_orden_id', String(orden.orden_id));
      formData.append('monto', String(montoNum));
      formData.append('metodo_pago', metodoSeleccionado || 'Mercado Pago');
      formData.append('referencia', refFinal);

      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        Alert.alert('¡Éxito!', json.mensaje);
        setMontoIngresado('');
        setReferenciaPago('');
        setUrlQrMp(null);
        setNumTarjeta('');
        setTitularTarjeta('');
        setVencimientoTarjeta('');
        setCvvTarjeta('');
        setOrdenSeleccionadaPago(null);
        fetchOrdenes();
      } else {
        Alert.alert('Error', json.error || 'No se pudo procesar el pago.');
      }
    } catch (e) {
      console.error('Error en pago:', e);
      Alert.alert('Error', 'Falla de conexión con el servidor.');
    } finally {
      setProcesandoPago(false);
    }
  };

  const getBadgeColor = (estado: string) => {
    const e = estado?.toLowerCase() || '';
    if (e.includes('pendiente')) return '#F59E0B';
    if (e.includes('proceso')) return '#38BDF8';
    if (e.includes('finalizado')) return '#10B981';
    if (e.includes('entregado')) return '#6366F1';
    if (e.includes('cancelado')) return '#EF4444';
    return '#64748B';
  };

  const getIconoMetodo = (nombre: string): any => {
    const n = nombre.toLowerCase();
    if (n.includes('mercado')) return 'qr-code-outline';
    if (n.includes('binance')) return 'logo-bitcoin';
    if (n.includes('débito') || n.includes('debito') || n.includes('crédito') || n.includes('credito')) return 'card-outline';
    if (n.includes('transfer')) return 'swap-horizontal-outline';
    return 'wallet-outline';
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loaderText}>Consultando estado de tus equipos...</Text>
      </View>
    );
  }

  if (!usuarioId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#38BDF8" />
          </TouchableOpacity>
          <Text style={styles.title}>Estado del Dispositivo</Text>
          <View style={{ width: 36 }} />
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#38BDF8" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Estado del Dispositivo</Text>
          <Text style={styles.subtitle}>Seguimiento de órdenes en taller</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={ordenes}
        keyExtractor={(item) => item.orden_id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="phone-portrait-outline" size={48} color="#64748B" />
            <Text style={styles.emptyTitle}>No tienes equipos en reparación</Text>
            <Text style={styles.emptySub}>Solicita un turno desde el listado de servicios</Text>
          </View>
        }
        renderItem={({ item }) => {
          const total = Number(item.total || 0);
          const pagado = Number(item.pagado || 0);
          const saldoPendiente = Math.max(total - pagado, 0);
          const señaBD = Number(item.monto_seña || 0);
          const senaPendiente = Math.max(señaBD - pagado, 0);
          const panelPagoAbierto = ordenSeleccionadaPago === item.orden_id;
          const metodoLower = (metodoSeleccionado || '').toLowerCase();

          // Detectar si está cancelado o entregado (por nombre o por estados_or_id 4, 5, 6)
          const estadoLower = (item.estado_orden || '').toLowerCase();
          const estadoId = Number(item.estados_or_id || 0);
          const esCancelado = estadoId === 4 || estadoLower.includes('cancelad');
          const esEntregado = estadoId === 5 || estadoId === 6 || estadoLower.includes('entregad');
          const pagoBloqueado = esCancelado || esEntregado;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.ordenIdText}>Orden #{item.orden_id}</Text>
                  <Text style={styles.fechaText}>{item.fecha_registro}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getBadgeColor(item.estado_orden) + '22', borderColor: getBadgeColor(item.estado_orden) }]}>
                  <Text style={[styles.badgeText, { color: getBadgeColor(item.estado_orden) }]}>
                    {item.estado_orden.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* CÓDIGO DE SEGURIDAD */}
              <View style={styles.securityBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="shield-checkmark" size={16} color="#F59E0B" />
                  <Text style={styles.securityLabel}>Código de Seguridad:</Text>
                </View>
                <Text style={styles.securityValue}>{item.codigo_seguridad || '----'}</Text>
              </View>

              {/* CHAT CON EL TÉCNICO */}
              <TouchableOpacity style={styles.chatOpenBtn} onPress={() => abrirChat(item)}>
                <Ionicons name="chatbubbles-outline" size={16} color="#38BDF8" />
                <Text style={styles.chatOpenBtnText}>
                  Chat con el Técnico {item.notas?.length > 0 ? `(${item.notas.length})` : ''}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#38BDF8" />
              </TouchableOpacity>

              <View style={styles.sectionBox}>
                <Text style={styles.deviceTitle}>
                  {item.marca_nombre || 'Genérico'} {item.modelo_nombre || item.categoria_nombre || 'Dispositivo'}
                </Text>
                <Text style={styles.serviceName}>{item.servicio_nombre}</Text>
                <Text style={styles.diagnostico}>Falla: {item.diagnostico_cliente}</Text>

                {item.numero_serie ? (
                  <Text style={styles.serialText}>Nro Serie: {item.numero_serie}</Text>
                ) : null}
              </View>

              {/* BLOQUE DE TOTAL, SEÑA A PAGAR Y SALDO PENDIENTE */}
              <View style={styles.infoRow}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>TOTAL</Text>
                  <Text style={styles.priceValue}>${total.toLocaleString('es-AR')}</Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>SEÑA A PAGAR</Text>
                  <Text style={[styles.priceValue, { color: pagoBloqueado ? '#64748B' : (senaPendiente > 0 ? '#38BDF8' : '#10B981') }]}>
                    ${senaPendiente > 0 ? senaPendiente.toLocaleString('es-AR') : señaBD.toLocaleString('es-AR')}
                  </Text>
                  {señaBD > 0 && senaPendiente === 0 && !pagoBloqueado ? (
                    <Text style={styles.paidMiniTag}>Cubierta</Text>
                  ) : null}
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>SALDO PENDIENTE</Text>
                  <Text style={[styles.priceValue, { color: pagoBloqueado ? '#64748B' : (saldoPendiente > 0 ? '#F59E0B' : '#10B981') }]}>
                    ${saldoPendiente.toLocaleString('es-AR')}
                  </Text>
                </View>
              </View>

              {pagado > 0 && (
                <Text style={styles.abonadoSummary}>
                  Abonado hasta el momento: <Text style={{ color: '#10B981', fontWeight: '800' }}>${pagado.toLocaleString('es-AR')}</Text>
                </Text>
              )}

              {/* SECCIÓN DE PAGO (BLOQUEADA SI ESTÁ CANCELADO O ENTREGADO) */}
              <View style={styles.paymentContainer}>
                {esCancelado ? (
                  <View style={styles.statusBadgeCanceled}>
                    <Ionicons name="close-circle" size={16} color="#EF4444" />
                    <Text style={styles.statusTextCanceled}>Orden Cancelada — Pagos deshabilitados</Text>
                  </View>
                ) : esEntregado ? (
                  <View style={styles.statusBadgeDelivered}>
                    <Ionicons name="checkmark-done-circle" size={16} color="#818CF8" />
                    <Text style={styles.statusTextDelivered}>Equipo Entregado — Orden cerrada</Text>
                  </View>
                ) : pagado < total ? (
                  <>
                    {!panelPagoAbierto ? (
                      <TouchableOpacity
                        style={styles.openPayPanelBtn}
                        onPress={() => {
                          setOrdenSeleccionadaPago(item.orden_id);
                          setUrlQrMp(null);
                          setReferenciaPago('');
                          if (senaPendiente > 0) {
                            setMontoIngresado(String(senaPendiente));
                          } else {
                            setMontoIngresado(String(saldoPendiente));
                          }
                        }}
                      >
                        <Ionicons name="card-outline" size={16} color="#FFF" />
                        <Text style={styles.openPayPanelText}>
                          {senaPendiente > 0
                            ? `Pagar Seña ($${senaPendiente.toLocaleString('es-AR')}) o Saldo`
                            : 'Realizar un Pago / Abonar'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.payFormBox}>
                        <View style={styles.payFormHeader}>
                          <Text style={styles.payFormTitle}>Pago Online</Text>
                          <TouchableOpacity
                            onPress={() => {
                              setOrdenSeleccionadaPago(null);
                              setUrlQrMp(null);
                            }}
                          >
                            <Ionicons name="close-circle" size={20} color="#94A3B8" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.quickBtnsRow}>
                          {senaPendiente > 0 && (
                            <TouchableOpacity
                              style={styles.senaHintBtn}
                              onPress={() => {
                                setMontoIngresado(String(senaPendiente));
                                setUrlQrMp(null);
                              }}
                            >
                              <Text style={styles.senaHintText}>
                                Seña: ${senaPendiente.toLocaleString('es-AR')}
                              </Text>
                            </TouchableOpacity>
                          )}

                          {saldoPendiente > 0 && (
                            <TouchableOpacity
                              style={styles.senaHintBtn}
                              onPress={() => {
                                setMontoIngresado(String(saldoPendiente));
                                setUrlQrMp(null);
                              }}
                            >
                              <Text style={styles.senaHintText}>
                                Saldo Total: ${saldoPendiente.toLocaleString('es-AR')}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <Text style={styles.inputLabel}>Selecciona método de pago:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodsRow}>
                          {metodosPagoBD.map((metodo) => {
                            const activo = metodoSeleccionado === metodo.nombre;
                            return (
                              <TouchableOpacity
                                key={String(metodo.id)}
                                style={[styles.methodChip, activo && styles.methodChipActive]}
                                onPress={() => {
                                  setMetodoSeleccionado(metodo.nombre);
                                  if (!metodo.nombre.toLowerCase().includes('mercado')) {
                                    setUrlQrMp(null);
                                  }
                                }}
                              >
                                <Ionicons
                                  name={getIconoMetodo(metodo.nombre)}
                                  size={14}
                                  color={activo ? '#FFF' : '#38BDF8'}
                                />
                                <Text style={[styles.methodChipText, activo && styles.methodChipTextActive]}>
                                  {metodo.nombre}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>

                        <Text style={styles.inputLabel}>Cantidad a pagar ($ ARS):</Text>
                        <TextInput
                          style={styles.montoInput}
                          placeholder="Ej: 15000"
                          placeholderTextColor="#64748B"
                          keyboardType="numeric"
                          value={montoIngresado}
                          onChangeText={(txt) => {
                            setMontoIngresado(txt);
                            setUrlQrMp(null);
                          }}
                        />

                        {metodoLower.includes('mercado') && (
                          <View style={styles.gatewayBox}>
                            {!urlQrMp ? (
                              <TouchableOpacity
                                style={styles.btnMp}
                                onPress={() => generarQrMercadoPago(item)}
                                disabled={generandoQr}
                              >
                                {generandoQr ? (
                                  <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                  <>
                                    <Ionicons name="qr-code-outline" size={16} color="#FFF" />
                                    <Text style={styles.btnMpText}>Generar QR de Mercado Pago</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            ) : (
                              <View style={{ alignItems: 'center' }}>
                                <Text style={styles.gatewayTitle}>Escaneá el QR con Mercado Pago:</Text>
                                <Image
                                  source={{
                                    uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(urlQrMp)}`,
                                  }}
                                  style={styles.qrImage}
                                />
                                <TouchableOpacity
                                  style={[styles.btnMp, { marginTop: 10, width: '100%' }]}
                                  onPress={() => Linking.openURL(urlQrMp)}
                                >
                                  <Ionicons name="open-outline" size={15} color="#FFF" />
                                  <Text style={styles.btnMpText}>Abrir en App Mercado Pago</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        )}

                        {metodoLower.includes('binance') && (
                          <View style={[styles.gatewayBox, { borderColor: '#F3BA2F' }]}>
                            <Text style={[styles.gatewayTitle, { color: '#F3BA2F' }]}>Binance Pay (USDT)</Text>
                            <Text style={styles.gatewayText}>• Pay ID: <Text style={styles.gatewayBold}>849201944</Text></Text>
                            <Text style={styles.gatewayText}>• Red: <Text style={styles.gatewayBold}>BEP20 (BNB Smart Chain)</Text></Text>
                          </View>
                        )}

                        {(metodoLower.includes('débito') ||
                          metodoLower.includes('debito') ||
                          metodoLower.includes('crédito') ||
                          metodoLower.includes('credito')) && (
                          <View style={styles.gatewayBox}>
                            <Text style={styles.gatewayTitle}>Datos de {metodoSeleccionado}</Text>
                            <TextInput
                              style={[styles.montoInput, { marginTop: 6, marginBottom: 6 }]}
                              placeholder="Número de tarjeta"
                              placeholderTextColor="#64748B"
                              keyboardType="numeric"
                              maxLength={19}
                              value={numTarjeta}
                              onChangeText={setNumTarjeta}
                            />
                            <TextInput
                              style={[styles.montoInput, { marginBottom: 6 }]}
                              placeholder="Nombre y apellido del titular"
                              placeholderTextColor="#64748B"
                              value={titularTarjeta}
                              onChangeText={setTitularTarjeta}
                            />
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <TextInput
                                style={[styles.montoInput, { flex: 1, marginBottom: 0 }]}
                                placeholder="MM/AA"
                                placeholderTextColor="#64748B"
                                maxLength={5}
                                value={vencimientoTarjeta}
                                onChangeText={setVencimientoTarjeta}
                              />
                              <TextInput
                                style={[styles.montoInput, { flex: 1, marginBottom: 0 }]}
                                placeholder="CVV"
                                placeholderTextColor="#64748B"
                                keyboardType="numeric"
                                secureTextEntry
                                maxLength={4}
                                value={cvvTarjeta}
                                onChangeText={setCvvTarjeta}
                              />
                            </View>
                          </View>
                        )}

                        {metodoLower.includes('transfer') && (
                          <View style={styles.gatewayBox}>
                            <Text style={styles.gatewayTitle}>Datos para Transferencia</Text>
                            <Text style={styles.gatewayText}>• Alias: <Text style={styles.gatewayBold}>FENIX.LAB.FORMOSA</Text></Text>
                            <Text style={styles.gatewayText}>• Titular: <Text style={styles.gatewayBold}>Fénix Lab Tech</Text></Text>
                          </View>
                        )}

                        <Text style={styles.inputLabel}>Nro. Comprobante / Referencia (Opcional):</Text>
                        <TextInput
                          style={styles.montoInput}
                          placeholder="Ej: #12345678 / TXID..."
                          placeholderTextColor="#64748B"
                          value={referenciaPago}
                          onChangeText={setReferenciaPago}
                        />

                        <TouchableOpacity
                          style={styles.confirmPayBtn}
                          onPress={() => enviarPagoPersonalizado(item)}
                          disabled={procesandoPago}
                        >
                          {procesandoPago ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <Text style={styles.confirmPayText}>
                              Confirmar y Pagar ${Number(montoIngresado || 0).toLocaleString('es-AR')}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.statusBadgeSuccess}>
                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={styles.statusTextSuccess}>¡Reparación Pagada por Completo!</Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* MODAL DE CHAT CON EL TÉCNICO */}
      <Modal visible={chatVisible} animationType="slide" transparent={true} onRequestClose={() => setChatVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Soporte Técnico</Text>
                <Text style={styles.modalSub}>Orden #{ordenActiva?.orden_id} - {ordenActiva?.modelo_nombre || 'Dispositivo'}</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setChatVisible(false)}>
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatScroll} contentContainerStyle={{ padding: 12 }}>
              {ordenActiva?.notas && ordenActiva.notas.length > 0 ? (
                ordenActiva.notas.map((nota: any, idx: number) => {
                  const esCliente = nota.remitente === 'cliente';
                  return (
                    <View key={idx} style={[styles.bubbleContainer, esCliente ? styles.bubbleCliente : styles.bubbleTecnico]}>
                      <Text style={styles.bubbleRemitente}>{esCliente ? 'Tú' : 'Técnico'}</Text>
                      <Text style={styles.bubbleText}>{nota.mensaje}</Text>
                      <Text style={styles.bubbleDate}>{nota.fecha}</Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyChat}>
                  <Ionicons name="chatbubble-outline" size={32} color="#64748B" />
                  <Text style={styles.emptyChatText}>No hay mensajes aún. ¡Escribe al técnico!</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Escribe un mensaje al técnico..."
                placeholderTextColor="#64748B"
                value={nuevoMensaje}
                onChangeText={setNuevoMensaje}
                multiline
              />
              <TouchableOpacity style={styles.sendBtn} onPress={enviarMensaje} disabled={enviando}>
                {enviando ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={16} color="#FFF" />}
              </TouchableOpacity>
            </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { backgroundColor: '#0D1E42', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 2, textAlign: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#13161F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  ordenIdText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  fechaText: { color: '#64748B', fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '800' },

  securityBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D1E42',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  securityLabel: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  securityValue: { color: '#F59E0B', fontSize: 15, fontWeight: '800', letterSpacing: 2 },

  chatOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1E42',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    gap: 8,
  },
  chatOpenBtnText: { color: '#38BDF8', fontSize: 12, fontWeight: '700', flex: 1 },
  sectionBox: { backgroundColor: '#0D1E42', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.15)' },
  deviceTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  serviceName: { color: '#38BDF8', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  diagnostico: { color: '#CBD5E1', fontSize: 12, marginBottom: 4 },
  serialText: { color: '#64748B', fontSize: 11 },

  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  infoBox: { flex: 1, backgroundColor: '#0D1E42', padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.15)' },
  infoLabel: { color: '#64748B', fontSize: 8.5, fontWeight: '800', marginBottom: 3, textAlign: 'center' },
  priceValue: { color: '#10B981', fontSize: 13, fontWeight: '800' },
  paidMiniTag: { color: '#10B981', fontSize: 9, fontWeight: '700', marginTop: 2 },
  abonadoSummary: { color: '#94A3B8', fontSize: 11, textAlign: 'right', marginBottom: 8 },

  paymentContainer: { marginTop: 4 },
  openPayPanelBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6
  },
  openPayPanelText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  payFormBox: {
    backgroundColor: '#0D1E42',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)'
  },
  payFormHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  payFormTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  quickBtnsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  senaHintBtn: { flex: 1, backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: 7, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  senaHintText: { color: '#38BDF8', fontSize: 11, fontWeight: '700' },
  inputLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginBottom: 4, marginTop: 4 },
  methodsRow: { flexDirection: 'row', marginBottom: 8 },
  methodChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#13161F', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, marginRight: 6, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  methodChipActive: { backgroundColor: '#2563EB', borderColor: '#38BDF8' },
  methodChipText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  methodChipTextActive: { color: '#FFF', fontWeight: '700' },
  montoInput: { backgroundColor: '#13161F', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: '#FFF', fontSize: 13, marginBottom: 10 },

  gatewayBox: { backgroundColor: '#13161F', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0, 158, 227, 0.45)' },
  gatewayTitle: { color: '#38BDF8', fontSize: 12, fontWeight: '800', marginBottom: 6 },
  gatewayText: { color: '#CBD5E1', fontSize: 11, marginBottom: 2 },
  gatewayBold: { color: '#FFFFFF', fontWeight: '800' },
  btnMp: { backgroundColor: '#009EE3', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  btnMpText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  qrImage: { width: 190, height: 190, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 8, marginTop: 6 },

  confirmPayBtn: { backgroundColor: '#10B981', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  confirmPayText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  statusBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  statusTextSuccess: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  statusBadgeCanceled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)'
  },
  statusTextCanceled: { color: '#EF4444', fontSize: 11, fontWeight: '700' },
  statusBadgeDelivered: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)'
  },
  statusTextDelivered: { color: '#818CF8', fontSize: 11, fontWeight: '700' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  emptySub: { color: '#64748B', fontSize: 12, marginTop: 4, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 16, 38, 0.9)', justifyContent: 'flex-end' },
  modalContent: { height: '80%', backgroundColor: '#13161F', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  modalSub: { color: '#38BDF8', fontSize: 11, marginTop: 2 },
  closeBtn: { backgroundColor: '#0D1E42', padding: 6, borderRadius: 8 },
  chatScroll: { flex: 1 },
  bubbleContainer: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 10 },
  bubbleCliente: { alignSelf: 'flex-end', backgroundColor: '#2563EB' },
  bubbleTecnico: { alignSelf: 'flex-start', backgroundColor: '#0D1E42', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  bubbleRemitente: { fontSize: 9, fontWeight: '800', color: '#94A3B8', marginBottom: 2 },
  bubbleText: { color: '#FFFFFF', fontSize: 13 },
  bubbleDate: { fontSize: 9, color: '#94A3B8', alignSelf: 'flex-end', marginTop: 4 },
  emptyChat: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyChatText: { color: '#64748B', fontSize: 12, marginTop: 8 },
  chatInputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: '#071026', alignItems: 'center', gap: 8 },
  chatInput: { flex: 1, backgroundColor: '#0D1E42', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, color: '#FFF', fontSize: 13, maxHeight: 90 },
  sendBtn: { backgroundColor: '#2563EB', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }
});