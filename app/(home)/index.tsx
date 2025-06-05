// app/(home)/index.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeIndex() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center px-6 bg-white dark:bg-gray-900">
      <Text className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100 text-center">
        Benvenuto su la mia App!
      </Text>
      <Text className="text-base mb-8 text-gray-600 dark:text-gray-300 text-center">
        Gestisci le tue cose con semplicità.
      </Text>

      <View className="space-y-4">
        <Pressable
          className="py-3 rounded bg-blue-600"
          onPress={() => router.push('/(home)/login')}
        >
          <Text className="text-center text-white font-semibold">
            Login
          </Text>
        </Pressable>

        <Pressable
          className="py-3 rounded bg-green-600"
          onPress={() => router.push('/(home)/signup')}
        >
          <Text className="text-center text-white font-semibold">
            Registrati
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
