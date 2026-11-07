import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="recepcionista" />
      <Stack.Screen name="tecnico" />
      <Stack.Screen name="cliente" />
    </Stack>
  );
}