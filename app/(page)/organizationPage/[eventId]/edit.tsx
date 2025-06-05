// app/(page)/organizationPage/[eventId]/edit.tsx
import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '~/lib/supabase';
import { useUser } from '~/lib/useUser';
import { useOrganizationStore } from '~/store/useOrganizationStore';

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;     // ISO
  total_seats: number;
  organization_id: string;
};

export default function EditEvent() {
  const navigation = useNavigation();
  const router = useRouter();
  const orgId = useOrganizationStore((state) => state.currentOrgId);
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');        // yyyy-mm-dd
  const [seats, setSeats] = useState('');

  /* ──────────────── carica dati evento ──────────────── */
  useEffect(() => {
    if (!user || !orgId || !eventId) return;

    (async () => {
      const { data, error } = await supabase
        .from('event')
        .select('*')
        .eq('id', eventId)
        .eq('organization_id', orgId)
        .single<EventRow>();

      if (error || !data) {
        Alert.alert('Errore', 'Evento non trovato.');
        navigation.goBack();
        return;
      }

      setName(data.name);
      setDescription(data.description ?? '');
      setDate(data.event_date.slice(0, 10)); // ISO → yyyy-mm-dd
      setSeats(String(data.total_seats));
      setLoading(false);
    })();
  }, [user, orgId, eventId, router]);

  /* ──────────────── imposta titolo dinamico ──────────────── */
  useLayoutEffect(() => {
    // se hai già caricato name, lo metti nell'header
    if (name) {
      navigation.setOptions({ title: `Modifica: ${name}` });
    } else {
      navigation.setOptions({ title: 'Modifica evento' });
    }
  }, [navigation, name]);

  /* ──────────────── salva modifiche ──────────────── */
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nome obbligatorio');
      return;
    }
    const seatsNum = parseInt(seats, 10);
    if (Number.isNaN(seatsNum) || seatsNum <= 0) {
      Alert.alert('Posti totali non validi');
      return;
    }
    setSaving(true);

    const { error } = await supabase
      .from('event')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        event_date: date,
        total_seats: seatsNum,
      })
      .eq('id', eventId)
      .eq('organization_id', orgId);

    setSaving(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert('Salvato', 'Evento aggiornato con successo.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-6 py-4 bg-white dark:bg-gray-900">
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">
        Modifica evento
      </Text>

      {/* Nome */}
      <Text className="mb-1 text-gray-700 dark:text-gray-300">Nome</Text>
      <TextInput
        className="mb-4 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={name}
        onChangeText={setName}
      />

      {/* Descrizione */}
      <Text className="mb-1 text-gray-700 dark:text-gray-300">Descrizione</Text>
      <TextInput
        multiline
        className="mb-4 h-24 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={description}
        onChangeText={setDescription}
      />

      {/* Data */}
      <Text className="mb-1 text-gray-700 dark:text-gray-300">Data (YYYY-MM-DD)</Text>
      <TextInput
        className="mb-4 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={date}
        onChangeText={setDate}
        placeholder="2025-06-15"
      />

      {/* Posti totali */}
      <Text className="mb-1 text-gray-700 dark:text-gray-300">Posti totali</Text>
      <TextInput
        keyboardType="number-pad"
        className="mb-6 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={seats}
        onChangeText={setSeats}
        placeholder="100"
      />

      <Pressable
        className={`py-3 rounded ${saving ? 'bg-gray-400' : 'bg-blue-600'}`}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-semibold">Salva</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
