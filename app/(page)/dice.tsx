// app/(tabs)/dice.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// array con i require delle 6 facce
const diceFaces = [
  require('~/assets/dice/dice-1.png'),
  require('~/assets/dice/dice-2.png'),
  require('~/assets/dice/dice-3.png'),
  require('~/assets/dice/dice-4.png'),
  require('~/assets/dice/dice-5.png'),
  require('~/assets/dice/dice-6.png'),
];

export default function DiceRoller() {
  // 1) Stato di quanti dadi voglio
  const [numDice, setNumDice] = useState(1);

  // 2) Stato di “inizializzazione” quando cambia numDice
  const [initializing, setInitializing] = useState(true);

  // 3) Stato dei valori di ciascun dado (lunghezza === numDice)
  const [values, setValues] = useState<number[]>([]);

  // 4) Ref che conterrà gli Animated.Value (lunghezza === numDice)
  const animValuesRef = useRef<Animated.Value[]>([]);

  // UTILITY: genera un nuovo valore da 1 a 6 diverso da "current"
  const getNextValue = (current: number) => {
    let next = Math.floor(Math.random() * 6) + 1;
    return next === current ? ((next % 6) + 1) : next;
  };

  //
  // ─────── useEffect: inizializza animValuesRef.current e values quando numDice cambia ───────
  //
  useEffect(() => {
    // Indico che sto per ricreare i dati
    setInitializing(true);

    // 1) Creo un nuovo array di Animated.Value di lunghezza numDice
    const newAnims = Array.from({ length: numDice }, () => new Animated.Value(0));
    animValuesRef.current = newAnims;

    // 2) Creo un array di valori iniziali (tutti a 1) di lunghezza numDice
    const initialValues = Array.from({ length: numDice }, () => 1);
    setValues(initialValues);

    // 3) Ho finito: posso smettere di mostrare lo spinner
    setInitializing(false);
  }, [numDice]);

  //
  // ─────── Funzione che lancia i dadi ───────
  //
  const rollDice = useCallback(() => {
    // 1) Genera i nextValues
    const nextValues = values.map((v) => getNextValue(v));

    // 2) Resetta tutti gli Animated.Value a 0
    animValuesRef.current.forEach((anim) => anim.setValue(0));

    // 3) Prepara un timing per ciascun dado
    const animations = animValuesRef.current.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        easing: Easing.bounce,
        useNativeDriver: true,
      })
    );

    // 4) Avvia tutte le animazioni in parallelo
    Animated.parallel(animations).start(() => {
      // Al termine, aggiorno lo stato dei valori
      setValues(nextValues);
    });
  }, [values]);

  //
  // ─────── Funzione che genera le interpolazioni per un singolo Animated.Value ───────
  //
  const getInterpolations = (anim: Animated.Value) => ({
    rotate: anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '720deg'], // due giri completi
    }),
    scale: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.4, 1],
    }),
  });

  //
  // ─────── Render ───────
  //
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* ────────── Selettore quantità dadi ────────── */}
      <View className="flex-row justify-center items-center mt-10">
        <Pressable
          onPress={() => {
            if (numDice > 1) {
              setNumDice((n) => n - 1);
            }
          }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-l"
        >
          <Text className="text-xl text-gray-800 dark:text-gray-100">–</Text>
        </Pressable>
        <View className="px-6 py-2 bg-gray-100 dark:bg-gray-800">
          <Text className="text-lg text-gray-900 dark:text-gray-50">{numDice}</Text>
        </View>
        <Pressable
          onPress={() => {
            if (numDice < 6) {
              setNumDice((n) => n + 1);
            }
          }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-r"
        >
          <Text className="text-xl text-gray-800 dark:text-gray-100">+</Text>
        </Pressable>
      </View>

      {/* ────────── Area Dadi / Spinner ────────── */}
      {initializing ? (
        // Se sto ancora inizializzando (animValuesRef non pronto), mostro lo spinner
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        // Altrimenti mostro la griglia di dadi
        <View className="flex-1 justify-center items-center px-4">
          <View className="flex-row flex-wrap justify-center">
            {values.map((val, idx) => {
              // Prendo l'animValue corrispondente
              const anim = animValuesRef.current[idx];
              // Siccome sono sicuro che animValuesRef.current ha la lunghezza corretta,
              // 'anim' non è più undefined
              const { rotate, scale } = getInterpolations(anim);

              return (
                <Animated.Image
                  key={`die-${idx}`}
                  source={diceFaces[val - 1]}
                  style={{
                    width: 80,
                    height: 80,
                    margin: 8,
                    transform: [{ rotate }, { scale }],
                  }}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* ────────── Bottone per lanciare i dadi ────────── */}
      <View className="items-center mb-10">
        <Pressable
          onPress={rollDice}
          className="px-8 py-3 rounded bg-blue-600 active:bg-blue-700"
        >
          <Text className="text-white font-semibold text-lg">Lancia i dadi</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
