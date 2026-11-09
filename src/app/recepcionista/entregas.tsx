
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

// ==========================================
// INTERFAZ DE DATOS
// ==========================================

interface ReparacionOrden {
  reparacion_orden_id: number;
  diagnostico_cliente: string;
  total: number;
  pagado: number;
  fecha_registro: string;
  equipo_id: number;

  cliente_nombre?: string;
  cliente_apellido?: string;
  servicio_nombre?: string;

  marca_nombre?: string;
  categoria_nombre?: string;

  numero_serie?: string;
  imei?: string;
}

// ==========================================
// CONFIGURACIÓN API
// ==========================================

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? ''
).replace(/\/+$/, '');

const API_URL = `${API_BASE_URL}/recepcionista/entregar.php`;

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function EntregarScreen() {

  const params = useLocalSearchParams<{
    empleadoId?: string;
  }>();

  const currentEmpleadoId = params.empleadoId
    ? Number(params.empleadoId)
    : 1;

  const [ordenes, setOrdenes] = useState<ReparacionOrden[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [ordenSeleccionada, setOrdenSeleccionada] =
    useState<ReparacionOrden | null>(null);

  const [codigoIngresado, setCodigoIngresado] = useState('');

  // ==========================================
  // FORMATEAR DINERO
  // ==========================================

  const formatoPrecio = (precio: number) => {

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(Number(precio) || 0);

  };

  // ==========================================
  // CARGAR ÓRDENES
  // ==========================================

  const cargarOrdenesListas = async (actualizar = false) => {

    if (!API_BASE_URL) {
      Alert.alert(
        'Configuración',
        'Falta configurar EXPO_PUBLIC_API_URL en tu proyecto.'
      );

      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (actualizar) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const resultado = await response.json();

      if (!response.ok || !resultado.success) {
        throw new Error(
          resultado.message || 'No se pudieron cargar las órdenes.'
        );
      }

      setOrdenes(resultado.data || []);

    } catch (error) {

      console.error('Error cargando órdenes:', error);

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'No se pudo conectar con el servidor.'
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };

  useEffect(() => {
    cargarOrdenesListas();
  }, []);

  // ==========================================
  // ABRIR MODAL
  // ==========================================

  const abrirModalEntrega = (orden: ReparacionOrden) => {

    setOrdenSeleccionada(orden);
    setCodigoIngresado('');
    setModalVisible(true);

  };

  // ==========================================
  // CONFIRMAR ENTREGA
  // ==========================================

  const confirmarEntrega = async () => {

    if (!ordenSeleccionada || procesando) return;

    if (!/^[0-9]{6}$/.test(codigoIngresado)) {

      Alert.alert(
        'Código inválido',
        'Ingrese los 6 dígitos del código de seguridad.'
      );

      return;
    }

    setProcesando(true);

    try {

      const response = await fetch(API_URL, {
        method: 'POST',

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          reparacion_orden_id:
            ordenSeleccionada.reparacion_orden_id,

          codigo_seguridad: codigoIngresado,

          empleado_id: currentEmpleadoId,
        }),
      });

      const resultado = await response.json();

      if (!response.ok || !resultado.success) {

        Alert.alert(
          'No se pudo entregar',
          resultado.message || 'Verifique el código ingresado.'
        );

        return;
      }

      setModalVisible(false);
      setCodigoIngresado('');
      setOrdenSeleccionada(null);

      Alert.alert(
        '¡Entrega realizada!',
        resultado.message,
        [
          {
            text: 'Aceptar',
            onPress: () => cargarOrdenesListas(),
          },
        ]
      );

    } catch (error) {

      console.error('Error al entregar:', error);

      Alert.alert(
        'Error de conexión',
        'No se pudo procesar la entrega.'
      );

    } finally {

      setProcesando(false);

    }
  };

  // ==========================================
  // TARJETA DE ORDEN
  // ==========================================

  const renderOrden = ({ item }: { item: ReparacionOrden }) => {

    const estaPagado = Number(item.pagado) === 1;

    return (

      <View style={styles.card}>

        {/* CABECERA */}

        <View style={styles.cardHeader}>

          <View>

            <Text style={styles.orderLabel}>
              ORDEN DE REPARACIÓN
            </Text>

            <Text style={styles.orderNumber}>
              #{item.reparacion_orden_id}
            </Text>

          </View>

          <View style={styles.finalizadoBadge}>

            <View style={styles.dot} />

            <Text style={styles.finalizadoText}>
              Finalizado
            </Text>

          </View>

        </View>

        <View style={styles.separator} />

        {/* CLIENTE */}

        <View style={styles.infoSection}>

          <Text style={styles.sectionTitle}>
            CLIENTE
          </Text>

          <Text style={styles.infoValue}>
            {item.cliente_nombre || 'Sin nombre'}{' '}
            {item.cliente_apellido || ''}
          </Text>

        </View>

        {/* SERVICIO */}

        <View style={styles.infoSection}>

          <Text style={styles.sectionTitle}>
            SERVICIO
          </Text>

          <Text style={styles.infoValue}>
            {item.servicio_nombre || 'Sin servicio registrado'}
          </Text>

        </View>

        {/* EQUIPO */}

        <View style={styles.infoSection}>

          <Text style={styles.sectionTitle}>
            EQUIPO
          </Text>

          <Text style={styles.infoValue}>
            {item.marca_nombre || 'Sin marca'}
            {' · '}
            {item.categoria_nombre || 'Equipo'}
          </Text>

          {item.numero_serie ? (
            <Text style={styles.secondaryText}>
              Serie: {item.numero_serie}
            </Text>
          ) : null}

          {item.imei ? (
            <Text style={styles.secondaryText}>
              IMEI: {item.imei}
            </Text>
          ) : null}

        </View>

        {/* DIAGNÓSTICO */}

        <View style={styles.infoSection}>

          <Text style={styles.sectionTitle}>
            DIAGNÓSTICO DEL CLIENTE
          </Text>

          <Text style={styles.diagnostic}>
            {item.diagnostico_cliente || 'Sin diagnóstico'}
          </Text>

        </View>

        <View style={styles.separator} />

        {/* PRECIO Y PAGO */}

        <View style={styles.paymentContainer}>

          <View>

            <Text style={styles.sectionTitle}>
              TOTAL
            </Text>

            <Text style={styles.totalPrice}>
              {formatoPrecio(item.total)}
            </Text>

          </View>

          <View
            style={[
              styles.paymentBadge,
              estaPagado
                ? styles.paid
                : styles.pending,
            ]}
          >

            <Text
              style={[
                styles.paymentText,
                estaPagado
                  ? styles.paidText
                  : styles.pendingText,
              ]}
            >
              {estaPagado ? '✓ Pagado' : '● Pendiente'}
            </Text>

          </View>

        </View>

        {/* FECHA */}

        <Text style={styles.dateText}>
          Registrado: {item.fecha_registro}
        </Text>

        {/* BOTÓN */}

        <TouchableOpacity
          style={styles.deliverButton}
          activeOpacity={0.85}
          onPress={() => abrirModalEntrega(item)}
        >

          <Text style={styles.deliverButtonText}>
            Confirmar entrega
          </Text>

          <Text style={styles.buttonArrow}>
            →
          </Text>

        </TouchableOpacity>

      </View>

    );
  };

  // ==========================================
  // PANTALLA
  // ==========================================

  return (

    <SafeAreaView style={styles.container}>

      <StatusBar
        backgroundColor="#F5F7FB",   
        barStyle="dark-content"
      />

      {/* HEADER */}

      <View style={styles.header}>

        <View>

          <Text style={styles.headerSmall}>
            GESTIÓN DE SUCURSAL
          </Text>

          <Text style={styles.title}>
            Entregas
          </Text>

          <Text style={styles.subtitle}>
            Órdenes listas para retirar
          </Text>

        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => cargarOrdenesListas(true)}
        >

          <Text style={styles.refreshIcon}>
            ↻
          </Text>

        </TouchableOpacity>

      </View>

      {/* CONTADOR */}

      {!loading && (

        <View style={styles.counterContainer}>

          <View style={styles.counterCard}>

            <Text style={styles.counterNumber}>
              {ordenes.length}
            </Text>

            <Text style={styles.counterLabel}>
              Órdenes pendientes de entrega
            </Text>

          </View>

        </View>

      )}

      {/* LISTADO */}

      {loading ? (

        <View style={styles.centerContainer}>

          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingText}>
            Cargando órdenes...
          </Text>

        </View>

      ) : (

        <FlatList
          data={ordenes}
          keyExtractor={(item) =>
            item.reparacion_orden_id.toString()
          }
          renderItem={renderOrden}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => cargarOrdenesListas(true)}
              colors={['#2563EB']}
            />
          }

          ListEmptyComponent={

            <View style={styles.emptyContainer}>

              <Text style={styles.emptyIcon}>
                ✓
              </Text>

              <Text style={styles.emptyTitle}>
                ¡Todo al día!
              </Text>

              <Text style={styles.emptyText}>
                No hay órdenes finalizadas pendientes de retirar.
              </Text>

            </View>

          }

        />

      )}

      {/* ==================================
          MODAL DE ENTREGA
      ================================== */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!procesando) setModalVisible(false);
        }}
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <View style={styles.modalIconContainer}>

              <Text style={styles.modalIcon}>
                ✓
              </Text>

            </View>

            <Text style={styles.modalTitle}>
              Confirmar entrega
            </Text>

            <Text style={styles.modalSubtitle}>
              Ingrese el código de seguridad que proporciona el cliente.
            </Text>

            <View style={styles.orderModalBadge}>

              <Text style={styles.orderModalText}>
                ORDEN #{ordenSeleccionada?.reparacion_orden_id}
              </Text>

            </View>

            <TextInput
              style={styles.codeInput}
              placeholder="000000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              value={codigoIngresado}
              onChangeText={(text) =>
                setCodigoIngresado(
                  text.replace(/[^0-9]/g, '').slice(0, 6)
                )
              }
              editable={!procesando}
              textAlign="center"
              autoFocus
            />

            <Text style={styles.codeHint}>
              Código de seguridad de 6 dígitos
            </Text>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                procesando && styles.disabledButton,
              ]}
              onPress={confirmarEntrega}
              disabled={procesando}
            >

              {procesando ? (

                <ActivityIndicator color="#FFFFFF" />

              ) : (

                <Text style={styles.confirmButtonText}>
                  Confirmar entrega
                </Text>

              )}

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              disabled={procesando}
            >

              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </SafeAreaView>

  );

}

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerSmall: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 2,
    marginBottom: 6,
  },

  title: {
    fontSize: 29,
    fontWeight: '900',
    color: '#111827',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },

  refreshButton: {
    width: 45,
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  refreshIcon: {
    fontSize: 27,
    color: '#2563EB',
    fontWeight: 'bold',
  },

  counterContainer: {
    paddingHorizontal: 18,
    marginBottom: 8,
  },

  counterCard: {
    backgroundColor: '#EAF1FF',
    padding: 17,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  counterNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#2563EB',
  },

  counterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  listContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 35,
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 18,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#E8EDF5',

    elevation: 3,

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
  },

  orderNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#2563EB',
    marginTop: 4,
  },

  finalizadoBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  dot: {
    width: 7,
    height: 7,
    backgroundColor: '#16A34A',
    borderRadius: 10,
  },

  finalizadoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },

  separator: {
    height: 1,
    backgroundColor: '#EDF1F6',
    marginVertical: 15,
  },

  infoSection: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },

  secondaryText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  diagnostic: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },

  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalPrice: {
    fontSize: 21,
    fontWeight: '900',
    color: '#111827',
    marginTop: 3,
  },

  paymentBadge: {
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  paid: {
    backgroundColor: '#DCFCE7',
  },

  pending: {
    backgroundColor: '#FEE2E2',
  },

  paymentText: {
    fontSize: 11,
    fontWeight: '800',
  },

  paidText: {
    color: '#15803D',
  },

  pendingText: {
    color: '#DC2626',
  },

  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 17,
  },

  deliverButton: {
    height: 49,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    marginTop: 16,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deliverButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#64748B',
    marginTop: 12,
    fontSize: 13,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    minHeight: 300,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    lineHeight: 70,
    textAlign: 'center',
    overflow: 'hidden',
    borderRadius: 35,
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
    fontSize: 38,
    fontWeight: 'bold',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 18,
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },

  // MODAL

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },

  modalContent: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 25,
    alignItems: 'center',
  },

  modalIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EAF1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalIcon: {
    fontSize: 31,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
  },

  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 9,
  },

  orderModalBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 9,
    marginTop: 18,
  },

  orderModalText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  codeInput: {
    width: '100%',
    height: 58,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    marginTop: 20,
    color: '#0F172A',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 12,
  },

  codeHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 9,
    marginBottom: 20,
  },

  confirmButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  cancelButton: {
    padding: 14,
    marginTop: 5,
  },

  cancelButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },

});
