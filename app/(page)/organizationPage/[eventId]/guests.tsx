// app/(page)/organizationPage/[eventId]/guests.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '~/lib/supabase';

type Guest = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export default function Guests() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ─────────────── fetch prenotati ─────────────── */
  const fetchGuests = useCallback(async () => {
    if (!eventId) return;

    const { data, error } = await supabase
      .from('booked_event_users')
      .select()
      .eq('event_id', eventId);

    if (error) {
      console.error(error.message);
      setGuests([]);
    } else {
      console.log('Fetched guests:', );
      // data è array di oggetti con chiave profiles
      const mapped = (data ?? []).map((row: any) => ({
         id: row.id,
         username: row.email ?? null,
         avatar_url: row.profiles?.avatar_url ?? null,
      }));
      console.log('Mapped guests:', mapped);
      setGuests(mapped);
    }
  }, [eventId]);

  useEffect(() => {
    (async () => {
      await fetchGuests();
      setLoading(false);
    })();
  }, [fetchGuests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGuests();
    setRefreshing(false);
  }, [fetchGuests]);

  /* ─────────────── UI states ─────────────── */
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (guests.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Text className="text-gray-700 dark:text-gray-300">
          Nessun partecipante registrato.
        </Text>
      </View>
    );
  }

  /* ─────────────── render item ─────────────── */
  const renderItem = ({ item, index }: { item: Guest; index: number }) => (
    <View className="flex-row items-center mb-4 p-3 rounded bg-gray-100 dark:bg-gray-800">
      {/* Avatar */}
      <Image
        source={
          item.avatar_url
            ? { uri: item.avatar_url }
            : require('~/assets/avatar-placeholder.png')
        }
        className="w-12 h-12 rounded-full mr-4 bg-gray-300"
      />
      {/* Nome + posizione */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">
          {item.username || 'Utente sconosciuto'}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          #{index + 1}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      className="flex-1 px-4 bg-white dark:bg-gray-900"
      data={guests}
      keyExtractor={(g) => g.id}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingVertical: 12 }}
    />
  );
}
