// app/(page)/[eventId]/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '~/lib/supabase';
import { useUser } from '~/lib/useUser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';


type EventInfo = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;          // ISO
  total_seats: number;
  seats_taken: number;         // da view event_with_seats
};

export default function EventDetails() {
  const { user } = useUser();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [booked, setBooked] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [booking, setBooking] = useState(false);

  /* ───────────────── fetch evento + stato prenotazione ───────────────── */
  const fetchData = useCallback(async () => {
    if (!eventId) return;

    // 1) dettagli evento (+ posti occupati) dalla view
    const { data: ev, error: evErr } = await supabase
      .from('event_with_seats')
      .select('*')
      .eq('id', eventId)
      .single<EventInfo>();

    if (evErr || !ev) {
      Alert.alert('Errore', 'Evento non trovato.');
      router.back();
      return;
    }
    setEvent(ev);

    // 2) controllo prenotazione utente (recupero anche l'id della prenotazione)
    if (user) {
      const { data: bookingRow, error: bookErr } = await supabase
        .from('booked_event')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!bookErr && bookingRow) {
        setBooked(true);
        setBookingId(bookingRow.id);
      } else {
        setBooked(false);
        setBookingId(null);
      }
    }
  }, [eventId, user, router]);

  useEffect(() => {
    (async () => {
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  /* ─────────────────── handler prenotazione ─────────────────── */
  const handleBook = async () => {
    if (!user) {
      Alert.alert('Devi essere loggato per prenotare.');
      return;
    }
    if (!event) return;

    const seatsLeft = event.total_seats - event.seats_taken;
    if (seatsLeft <= 0) {
      Alert.alert('Evento completo');
      return;
    }

    setBooking(true);
    const { data, error } = await supabase
      .from('booked_event')
      .insert({ user_id: user.id, event_id: eventId })
      .single<{ id: string }>(); // ottengo l'id della prenotazione

    setBooking(false);

    if (error) {
      if (error.code === '23505') {
        Alert.alert('Sei già prenotato.');
        // se vogliamo recuperare il bookingId in questo caso
        const { data: existing, error: exErr } = await supabase
          .from('booked_event')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();
        if (!exErr && existing) {
          setBookingId(existing.id);
          setBooked(true);
        }
      } else {
        Alert.alert('Errore', error.message);
      }
    } else if (data) {
      Alert.alert('Prenotazione confermata!');
      setBooked(true);
      setBookingId(data.id);
      // aggiorno contatore posti rimasti localmente
      setEvent((prev) =>
        prev
          ? { ...prev, seats_taken: prev.seats_taken + 1 }
          : prev,
      );
    }
  };

  /* ─────────────────── UI states ─────────────────── */
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!event) return null; // per sicurezza

  const seatsLeft = event.total_seats - event.seats_taken;
  const full = seatsLeft <= 0;

  return (
    <ScrollView
      className="flex-1 px-6 py-4 bg-white dark:bg-gray-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        {event.name}
      </Text>

      {event.description && (
        <Text className="text-base text-gray-700 dark:text-gray-300 mb-4">
          {event.description}
        </Text>
      )}

      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        Data: {new Date(event.event_date).toLocaleDateString()}
      </Text>

      <Text
        className={`text-sm mb-6 ${
          full ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        Posti rimasti: {seatsLeft}
      </Text>

      {booked ? (
        <View className="items-center space-y-4">
          {/* Badge "Sei già prenotato" */}
          <View className="w-full py-3 rounded bg-green-600">
            <Text className="text-center text-white font-semibold">
              Sei già prenotato
            </Text>
          </View>
            {/* Qua ci volevo mettere il qrcode ma mi crasha l'app boh, sempre ste liberie */}
          {/* QR Code con l'ID della prenotazione */}
          {bookingId && (
            <View className="items-center mt-6">
              <Text className="mb-2 text-gray-700 dark:text-gray-300">
                Il tuo QR Code di prenotazione
              </Text>
              
              <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                ID prenotazione: {bookingId}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <Pressable
          className={`py-3 rounded ${
            booking || full ? 'bg-gray-400' : 'bg-blue-600'
          }`}
          onPress={handleBook}
          disabled={booking || full}
        >
          {booking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white font-semibold">
              {full ? 'Evento completo' : 'Prenota'}
            </Text>
          )}
        </Pressable>
      )}
    </ScrollView>
  );
}
