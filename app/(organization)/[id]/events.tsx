// app/(page)/organizationPage/[id]/events.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '~/lib/supabase';
import { useOrganizationStore } from '~/store/useOrganizationStore';

type OrgEvent = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;    // ISO date string
  total_seats: number;
  seats_taken: number;
};

export default function OrgEvents() {
  const router = useRouter();
  const orgId = useOrganizationStore((state) => state.currentOrgId);

  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!orgId) return;

    const { data, error } = await supabase
      .from('event_with_seats')
      .select('*')
      .eq('organization_id', orgId)
      .order('event_date', { ascending: true });

    if (error) {
      console.error(error.message);
    } else {
      setEvents(data as OrgEvent[]);
    }
  }, [orgId]);

  useEffect(() => {
    (async () => {
      await fetchEvents();
      setLoading(false);
    })();
  }, [fetchEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  if (!orgId) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Text className="text-gray-700 dark:text-gray-300">
          Organizzazione non selezionata.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Text className="text-gray-700 dark:text-gray-300">
          Nessun evento per questa organizzazione.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      className="flex-1 px-4 bg-white dark:bg-gray-900"
      contentContainerStyle={{ paddingVertical: 12 }}
      renderItem={({ item }) => {
        const seatsLeft = item.total_seats - item.seats_taken;
        return (
          <View className="mb-4 p-4 rounded bg-gray-100 dark:bg-gray-800">
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {item.name}
            </Text>
            {item.description && (
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                {item.description}
              </Text>
            )}
            <Text className="text-sm mt-1 text-gray-600 dark:text-gray-400">
              Data: {new Date(item.event_date).toLocaleDateString()}
            </Text>
            <Text
              className={`text-sm mt-1 ${
                seatsLeft > 0
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-red-600'
              }`}
            >
              Posti rimasti: {seatsLeft}
            </Text>

            {/* Pulsante Modifica */}
            <Pressable
              className="mt-3 py-2 rounded bg-yellow-500 mb-4"
              onPress={() => router.push(`/organizationPage/${item.id}/edit`)}
            >
              <Text className="text-center text-white font-semibold">
                Modifica
              </Text>
            </Pressable>
            
        {/* Pulsante Prenotati */}
        <Pressable
          className="flex-1 py-2 rounded bg-blue-600"
          onPress={() => router.push(`/organizationPage/${item.id}/guests`)}
        >
          <Text className="text-center text-white font-semibold">
            Prenotati
          </Text>
        </Pressable>
          </View>
        );
      }}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
