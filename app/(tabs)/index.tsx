// app/(tabs)/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '~/lib/supabase';
import { useRouter } from 'expo-router';

export default function HomeTab() {
  const [email, setEmail] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carica utente e, se esiste, cerca la sua organizzazione
  useEffect(() => {
    (async () => {
      // 1. prendi utente
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      if (user) {
        // 2. controlla in organization_member
        const { data, error } = await supabase
          .from('organization_member')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (!error && data) {
          setOrgId(data.organization_id);
        }
      }

      setLoading(false);
    })();
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace('/(home)');
  }, []);

  const handleDice = useCallback(() => {
    router.push('/dice');
  }, []);

  const handleNickname = useCallback(() => {
    router.push('/nickname');
  }, []);

  const handleGoOrg = useCallback(() => {
    if (orgId) router.push(`/${orgId}`);
  }, [orgId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white dark:bg-gray-900">
      <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Benvenuto!
      </Text>
      <Text className="text-base text-gray-600 dark:text-gray-300 mb-8">
        {email ? `Loggato come ${email}` : 'Utente sconosciuto'}
      </Text>

      <Pressable
        className="py-3 rounded bg-red-600 mb-4"
        onPress={handleLogout}
      >
        <Text className="text-center text-white font-semibold">
          Logout
        </Text>
      </Pressable>

      <Pressable
        className="py-3 rounded bg-blue-600 mb-4"
        onPress={handleDice}
      >
        <Text className="text-center text-white font-semibold">
          Lancia il dado
        </Text>
      </Pressable>

      <Pressable
        className="py-3 rounded bg-blue-600 mb-4"
        onPress={handleNickname}
      >
        <Text className="text-center text-white font-semibold">
          Genera nickname AI
        </Text>
      </Pressable>

      {orgId && (
        <Pressable
          className="py-3 rounded bg-purple-600 mt-4"
          onPress={handleGoOrg}
        >
          <Text className="text-center text-white font-semibold">
            Vai alla tua organizzazione
          </Text>
        </Pressable>
      )}
    </View>
  );
}
