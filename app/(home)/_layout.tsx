// /app/(home)/_layout.tsx
import { Stack } from 'expo-router'

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
      }}  
    >
      <Stack.Screen name="index" options={{ title: 'Benvenuto' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Registrati' }} />
    </Stack>
  )
}
