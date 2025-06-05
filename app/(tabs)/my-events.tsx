// app/(tabs)/my-events.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { supabase } from '~/lib/supabase';
import { useUser } from '~/lib/useUser';
import { useRouter } from 'expo-router';

type Row = {
  booking_id: string;
  event: {
    id: string;
    name: string;
    description: string | null;
    event_date: string;
  };
};

export default function MyEvents() {
  const { user } = useUser();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Carica le prenotazioni
  const fetchBookings = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('booked_event')
      .select('id, event(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error.message);
    } else {
      setRows(
        (data ?? []).map((r: any) => ({
          booking_id: r.id,
          event: r.event,
        }))
      );
    }
  }, [user]);

  // Caricamento iniziale
  useEffect(() => {
    (async () => {
      await fetchBookings();
      setLoading(false);
    })();
  }, [fetchBookings]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [fetchBookings]);

  // Conferma e delete
  const confirmCancel = (booking_id: string) => {
    Alert.alert(
      'Annulla prenotazione',
      'Sei sicuro di voler annullare questa prenotazione?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sì',
          style: 'destructive',
          onPress: () => handleCancel(booking_id),
        },
      ]
    );
  };

  const handleCancel = async (booking_id: string) => {
    setDeletingId(booking_id);
    const { error } = await supabase
      .from('booked_event')
      .delete()
      .eq('id', booking_id);

    setDeletingId(null);
    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      // Tolgo la riga localmente
      setRows((prev) =>
        prev.filter((r) => r.booking_id !== booking_id)
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Text className="text-gray-700 dark:text-gray-300">
          Nessuna prenotazione finora.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 px-4 bg-white dark:bg-gray-900"
      data={rows}
      keyExtractor={(item) => item.booking_id}
      renderItem={({ item }) => {
        const { booking_id, event } = item;
        return (
          <View className="mb-4 bg-gray-100 dark:bg-gray-800 rounded">
            {/* Riquadro tappabile per andare ai dettagli dell'evento */}
            <Pressable
              onPress={() => router.push(`/(page)/${event.id}`)}
              className="p-4"
            >
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">
                {event.name}
              </Text>
              {event.description && (
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  {event.description}
                </Text>
              )}
              <Text className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                Data: {new Date(event.event_date).toLocaleDateString()}
              </Text>
            </Pressable>

            {/* Bottone Annulla prenotazione */}
            <View className="px-4 pb-4">
              <Pressable
                className={`mt-3 py-2 rounded ${
                  deletingId === booking_id
                    ? 'bg-gray-400'
                    : 'bg-red-600'
                }`}
                onPress={() => confirmCancel(booking_id)}
                disabled={!!deletingId}
              >
                {deletingId === booking_id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center text-white font-semibold">
                    Annulla prenotazione
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        );
      }}
      contentContainerStyle={{ paddingVertical: 12 }}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
