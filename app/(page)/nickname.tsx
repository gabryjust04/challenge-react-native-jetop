// app/(page)/nickname.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

const OLLAMA_URL =
  'http://api-ollama-f0gggog4kw8ww4owkkggo4sk.93.43.240.59.sslip.io/api/chat';
const MODEL = 'tinyllama:1.1b';

export default function NicknameGenerator() {
  const [theme, setTheme] = useState('');          // es. “fantasy”, “tech” ecc.
  const [busy, setBusy] = useState(false);
  const [nicknames, setNicknames] = useState<string[]>([]);

  const prompt = `Generate 8 short, fun nicknames${
    theme ? ' with a ' + theme + ' vibe' : ''
  }. Return them as a plain numbered list.`;

  async function generate() {
    setBusy(true);
    setNicknames([]);

    try {
      const res = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // Response format: { message: { content: "1. Foo\n2. Bar\n..." } }
      const lines = data.message.content
        .split('\n')
        .map((l: string) => l.replace(/^\d+[.)]\s*/, '').trim()) // rimuove "1. "
        .filter((l: string) => l.length > 0);

      setNicknames(lines);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Errore', err.message ?? 'Impossibile generare nicknames');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 p-6">
      {/* HEADER */}
      <Text className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
        🎲 Generatore di Nickname
      </Text>

      {/* INPUT TEMA */}
      <Text className="mb-1 text-gray-700 dark:text-gray-300">
        Tema (opzionale):
      </Text>
      <TextInput
        className="mb-4 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50"
        placeholder="es. fantasy, hacker, kawaii..."
        placeholderTextColor="#888"
        onChangeText={setTheme}
        value={theme}
      />

      {/* BOTTONE */}
      <Pressable
        onPress={generate}
        disabled={busy}
        className={`py-3 rounded ${busy ? 'bg-gray-400' : 'bg-green-600'}`}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-semibold">
            Genera!
          </Text>
        )}
      </Pressable>

      {/* LISTA RESULT */}
      <FlatList
        data={nicknames}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Text className="mt-4 text-lg text-center text-blue-700 dark:text-blue-300">
            {item}
          </Text>
        )}
        ListEmptyComponent={
          !busy && (
            <Text className="mt-10 text-center text-gray-500">
              Inserisci un tema (facoltativo) e premi “Genera!”
            </Text>
          )
        }
      />

      {/* Link back alle tab (facoltativo) */}
      <View className="mt-auto pt-6 items-center">
        <Link href="/(tabs)" className="text-blue-500">
          Torna alla Home
        </Link>
      </View>
    </SafeAreaView>
  );
}
