import { Ionicons } from '@expo/vector-icons';
import { Slot, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClienteLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();
  
  // Usamos useGlobalSearchParams para capturar el usuarioId de manera persistente en toda la navegación
  const params = useGlobalSearchParams();
  const currentUsuarioId = params.usuarioId ? Number(params.usuarioId) : null;

  // 10 botones basados estrictamente en el diagrama de casos de uso del Panel de Cliente
  const opcionesMenu = [
    { label: 'Pantalla de Bienvenida', route: '/cliente' },
    { label: 'Listado de Servicios', route: '/cliente/listado_servicios' },
    { label: 'Listado de Productos', route: '/cliente/listado_productos' },
    { label: 'Estado del Dispositivo', route: '/cliente/seguimiento' },
    { label: 'Carrito de Compras', route: '/cliente/carrito' },
    { label: 'Historial de Compras', route: '/cliente/historial_compras' },
    { label: 'Envío de Dispositivo', route: '/cliente/envio_dispositivo' },
    { label: 'Perfil de Usuario', route: '/cliente/perfil' },
    { label: 'Notificaciones', route: '/cliente/notificaciones' },
    { label: 'Ubicación del Taller', route: '/cliente/ubicacion' },
    { label: 'Quiénes Somos', route: '/cliente/quienes_somos' },
  ];

  const navegarA = (ruta: string) => {
    setMenuVisible(false);
    // Propagamos estrictamente el usuarioId actual en cada navegación del menú hamburguesa
    router.push({
      pathname: ruta as any,
      params: { usuarioId: currentUsuarioId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color="#38BDF8" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Fenix Lab - Portal</Text>

        <TouchableOpacity 
          style={styles.logoutBtnIcon}
          onPress={() => router.replace('/')}
        >
          <Ionicons name="log-out-outline" size={22} color="#38BDF8" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Slot />
      </View>

      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Navegación del Taller</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={22} color="#38BDF8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {opcionesMenu.map((item) => {
                const isActive = currentPath === item.route;
                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => navegarA(item.route)}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        isActive && styles.menuItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.drawerLogout}
              onPress={() => {
                setMenuVisible(false);
                router.replace('/');
              }}
            >
              <Text style={styles.drawerLogoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071026' },
  topBar: {
    height: 56,
    backgroundColor: '#0D1E42',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.25)',
    elevation: 4,
  },
  hamburgerBtn: { padding: 4 },
  topBarTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  logoutBtnIcon: { padding: 4, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 8, padding: 6 },
  content: { flex: 1, backgroundColor: '#071026' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 16, 38, 0.8)',
    flexDirection: 'row',
  },
  drawerContainer: {
    width: '82%',
    backgroundColor: '#071026',
    height: '100%',
    padding: 20,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: 'rgba(56, 189, 248, 0.35)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 15,
    marginBottom: 15,
  },
  drawerTitle: { fontSize: 17, fontWeight: '800', color: '#ffffff' },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#0D1E42',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.15)',
  },
  menuItemActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  menuItemText: { fontSize: 13.5, color: '#CBD5E1', fontWeight: '600' },
  menuItemTextActive: { color: '#ffffff', fontWeight: 'bold' },
  drawerLogout: {
    backgroundColor: '#13161F',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  drawerLogoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
});