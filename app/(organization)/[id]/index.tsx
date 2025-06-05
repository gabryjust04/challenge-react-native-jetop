// app/(organization)/[id]/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '~/lib/supabase';
import { useUser } from '~/lib/useUser';

type Org = {
  id: string;
  name: string;
  description: string | null;
};

export default function OrgIndex() {
  const { user } = useUser();
  const router = useRouter();
  const { id: orgId } = useLocalSearchParams<{ id: string }>();

  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data, error } = await supabase
        .from('organization')
        .select('id, name, description')
        .eq('id', orgId)
        .single();

      if (error || !data) {
        // gestione errore, es. organizzazione non trovata
        router.replace('/');
      } else {
        setOrg(data);
      }
      setLoading(false);
    })();
  }, [user, orgId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 px-6 bg-white dark:bg-gray-900">
      <Text className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        {org?.name}
      </Text>
      {org?.description && (
        <Text className="text-gray-700 dark:text-gray-300 mb-6">
          {org.description}
        </Text>
      )}

      {/* Link a lista eventi */}
      <Pressable
        className="py-3 rounded bg-blue-600 mb-4"
        onPress={() => router.push(`/${orgId}/events`)}
      >
        <Text className="text-center text-white font-semibold">
          Eventi organizzazione
        </Text>
      </Pressable>

      {/* Link a form di creazione evento */}
      <Pressable
        className="py-3 rounded bg-green-600"
        onPress={() => router.push(`/${orgId}/add-event`)}
      >
        <Text className="text-center text-white font-semibold">
          Aggiungi evento
        </Text>
      </Pressable>
    </View>
  );
}
