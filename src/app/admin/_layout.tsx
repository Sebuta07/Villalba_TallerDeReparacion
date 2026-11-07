import { Slot, usePathname, useRouter } from 'expo-router';
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

export default function AdminLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();

  const opcionesMenu = [
    { label: 'Menú Principal', route: '/admin' },
    { label: 'Categorías de Productos', route: '/admin/categoria_productos' },
    { label: 'Categoría de Servicios', route: '/admin/categoria_servicios' },
    { label: 'Categorias de Equipos', route: '/admin/categorias_equipo' },
    { label: 'Codigo de País', route: '/admin/codigo_pais' },
    { label: 'Codigo Postal', route: '/admin/codigo_postal' },
    { label: 'Codigos de Productos', route: '/admin/codigo_productos' },
    { label: 'Dirección', route: '/admin/direccion' },
    { label: 'Estado de Ordenes', route: '/admin/estados_or' },
    { label: 'Marcas de Productos', route: '/admin/marca' },
    { label: 'Marcas de Equipos', route: '/admin/marcas_equipos' },
    { label: 'Marcas de Proveedores', route: '/admin/marcas_proveedor' },
    { label: 'Modelos de Equipos', route: '/admin/modelo_equipos' },
    { label: 'Modelos de Proveedores', route: '/admin/modelo_proveedor' },
    { label: 'Modelos de Productos', route: '/admin/modelo' },
    { label: 'Paises', route: '/admin/paises' },
    { label: 'Pedidos de Sucursales', route: '/admin/pedidos_sucursales' },
    { label: 'Productos', route: '/admin/producto' },
    { label: 'Provincias', route: '/admin/provincias' },
    { label: 'Servicios', route: '/admin/servicios' },
    { label: 'Telefonos', route: '/admin/telefonos' },
    { label: 'Tipos de Comprobantes', route: '/admin/tipo_comprobante' },
    { label: 'Tipos de Proveedores', route: '/admin/tipo_proveedor' },
    { label: 'Usuarios', route: '/admin/usuarios' },
  ];

  const navegarA = (ruta: string) => {
    setMenuVisible(false);
    router.push(ruta as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={styles.hamburgerText}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Panel Administración</Text>

        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.logoutIcon}>🚪</Text>
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
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menú Admin</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
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
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  topBar: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 4,
  },
  hamburgerBtn: { padding: 4 },
  hamburgerText: { color: '#2563EB', fontSize: 26, fontWeight: 'bold' },
  topBarTitle: { color: '#0F172A', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
  logoutIcon: { fontSize: 20 },
  content: { flex: 1, backgroundColor: '#F4F6FA' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 16, 38, 0.55)',
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerContainer: {
    width: '78%',
    backgroundColor: '#FFFFFF',
    height: '100%',
    padding: 20,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    zIndex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  drawerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  closeBtn: { fontSize: 20, color: '#2563EB', fontWeight: 'bold' },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  menuItemActive: { backgroundColor: '#E8F0FE' },
  menuItemText: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  menuItemTextActive: { color: '#2563EB', fontWeight: 'bold' },
  drawerLogout: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  drawerLogoutText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});