// app/modal/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ModalLayout() {
  return (
     <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <Stack
        screenOptions={{
          presentation: 'modal',       // Modal stile iOS
          animation: 'fade_from_bottom', // Animazione per Android
          headerShown: true,
        }}
      />
    </SafeAreaView>
  );
}
