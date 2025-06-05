import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '~/lib/supabase';
import { useUser } from '~/lib/useUser';

/* ───────────── Types ───────────── */
type EventRow = {
  id: string;
  name: string;
  description: string | null;
  total_seats: number;
  event_date: string;   // ISO
  seats_taken: number;  // view
  lat: number | null;
  lng: number | null;
};

type Coord = { latitude: number; longitude: number };

/* ───────────── Haversine ───────────── */
const haversineKm = (p1: Coord, p2: Coord) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(p2.latitude - p1.latitude);
  const dLon = toRad(p2.longitude - p1.longitude);
  const lat1 = toRad(p1.latitude);
  const lat2 = toRad(p2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function Events() {
  const { user } = useUser();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);
  const [myPos, setMyPos] = useState<Coord | null>(null);

  /* ───────────── 1. Ottieni posizione utente ───────────── */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permesso localizzazione negato');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setMyPos({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  /* ───────────── 2. Carica eventi ───────────── */
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('event_with_seats')
        .select('id, name, description, total_seats, event_date, seats_taken, lat, lng')
        .order('event_date', { ascending: true });

      if (!error && data) setEvents(data as EventRow[]);
      else console.error(error?.message);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  /* ───────────── 3. Prenotazione ───────────── */
  const handleBook = async (eventId: string) => {
    if (!user) return;

    setBooking(eventId);
    const { error } = await supabase
      .from('booked_event')
      .insert({ user_id: user.id, event_id: eventId });

    if (error && error.code === '23505') {
      Alert.alert('Già prenotato', 'Sei già registrato a questo evento.');
    } else if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert('Prenotazione riuscita');
      setEvents(prev =>
        prev.map(ev =>
          ev.id === eventId ? { ...ev, seats_taken: ev.seats_taken + 1 } : ev,
        ),
      );
    }
    setBooking(null);
  };

  /* ───────────── 4. UI loading ───────────── */
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ───────────── 5. Render item ───────────── */
  const renderItem = ({ item }: { item: EventRow }) => {
    const seatsLeft = item.total_seats - item.seats_taken;
    const full = seatsLeft <= 0;

    const distance =
      myPos && item.lat != null && item.lng != null
        ? haversineKm(myPos, { latitude: item.lat, longitude: item.lng })
            .toFixed(1) + ' km'
        : '—';

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
        <Text className="text-sm mt-1 text-gray-600 dark:text-gray-400">
          Distanza: {distance}
        </Text>
        <Text
          className={`text-sm mt-1 ${
            full ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Posti rimasti: {seatsLeft}
        </Text>

        <Pressable
          className={`mt-3 py-2 rounded ${
            full || booking === item.id ? 'bg-gray-400' : 'bg-blue-600'
          }`}
          onPress={() => handleBook(item.id)}
          disabled={full || !!booking}
        >
          {booking === item.id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white font-semibold">
              {full ? 'Completo' : 'Prenota'}
            </Text>
          )}
        </Pressable>
      </View>
    );
  };

  /* ───────────── 6. Lista ───────────── */
  return (
    <FlatList
      className="flex-1 px-4 bg-white dark:bg-gray-900"
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingVertical: 12 }}
    />
  );
}
