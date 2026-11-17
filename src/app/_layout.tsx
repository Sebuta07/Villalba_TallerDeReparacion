import { Stack } from 'expo-router';
import { BiometricLock } from '../components/BiometricLock';

export default function RootLayout() {
  return (
    <BiometricLock>
      <Stack screenOptions={{ headerShown: false }} />
    </BiometricLock>
  );
}