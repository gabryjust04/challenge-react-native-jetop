import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '~/lib/supabase';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Errore di accesso', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white dark:bg-gray-900">
      <Text className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        Accedi
      </Text>

      <Text className="mb-1 text-gray-700 dark:text-gray-300">Email</Text>
      <TextInput
        className="mb-4 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder="email@example.com"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />

      <Text className="mb-1 text-gray-700 dark:text-gray-300">Password</Text>
      <TextInput
        className="mb-6 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder="••••••••"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <Pressable
        className={`py-3 rounded ${
          loading ? 'bg-gray-400' : 'bg-blue-600'
        }`}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-semibold">
            Login
          </Text>
        )}
      </Pressable>
    </View>
  );
}
