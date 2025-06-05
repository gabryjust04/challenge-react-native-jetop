// app/(organization)/[id]/add-event.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '~/lib/supabase';
import { useOrganizationStore } from '~/store/useOrganizationStore';


export default function AddEvent() {
  // Prendo l'ID dell'organizzazione dallo store
  const orgId = useOrganizationStore((state) => state.currentOrgId);
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [eventDate, setEventDate] = useState(''); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    // validazione rapida
    if (!name || !totalSeats || !eventDate) {
      Alert.alert('Errore', 'Compila almeno nome, posti e data.');
      return;
    }
    const seats = parseInt(totalSeats, 10);
    if (isNaN(seats) || seats < 1) {
      Alert.alert('Errore', 'Il numero di posti deve essere un intero positivo.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('event')
      .insert({
        name,
        description: description || null,
        total_seats: seats,
        event_date: eventDate,
        organization_id: orgId,
      });

    setLoading(false);
    if (error) {
      Alert.alert('Creazione fallita', error.message);
    } else {
      Alert.alert('Fatto', 'Evento creato con successo!', [
        {
          text: 'OK',
          onPress: () => router.push(`/${orgId}/events`),
        },
      ]);
    }
  };

  return (
    <View className="flex-1 px-6 bg-white dark:bg-gray-900 justify-center">
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">
        Aggiungi Nuovo Evento
      </Text>

      <Text className="mb-1 text-gray-700 dark:text-gray-300">Nome</Text>
      <TextInput
        className="mb-4 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder="Titolo evento"
        placeholderTextColor="#888"
        onChangeText={setName}
        value={name}
      />

      <Text className="mb-1 text-gray-700 dark:text-gray-300">Descrizione</Text>
      <TextInput
        className="mb-4 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder="Dettagli (opzionale)"
        placeholderTextColor="#888"
        onChangeText={setDescription}
        value={description}
      />

      <Text className="mb-1 text-gray-700 dark:text-gray-300">Posti totali</Text>
      <TextInput
        className="mb-4 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder="Es. 10"
        placeholderTextColor="#888"
        keyboardType="numeric"
        onChangeText={setTotalSeats}
        value={totalSeats}
      />

      <Text className="mb-1 text-gray-700 dark:text-gray-300">Data (YYYY-MM-DD)</Text>
      <TextInput
        className="mb-6 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder="2025-06-01"
        placeholderTextColor="#888"
        onChangeText={setEventDate}
        value={eventDate}
      />

      <Pressable
        onPress={handleCreate}
        disabled={loading}
        className={`py-3 rounded ${
          loading ? 'bg-gray-400' : 'bg-green-600'
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-semibold">
            Crea Evento
          </Text>
        )}
      </Pressable>
    </View>
  );
}
