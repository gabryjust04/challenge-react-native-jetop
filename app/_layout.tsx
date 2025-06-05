import '../global.css';
//import 'expo-dev-client'; // <-- per il debug

import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';

import { ThemeToggle } from '~/components/ThemeToggle';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { supabase } from '../lib/supabase';           // <-- tuo client
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Esporta l’ErrorBoundary generato automaticamente da Expo Router
export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  /** ──────────────────────────────────────────
   *  1. Stato sessione Supabase
   *  ────────────────────────────────────────── */
  const [sessionReady, setSessionReady] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    // sessione al lancio
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLogged(!!session);
      setSessionReady(true);
    });

    // listener login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLogged(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** ──────────────────────────────────────────
   *  2. Schermata di caricamento molto semplice
   *  ────────────────────────────────────────── */
  if (!sessionReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /** ──────────────────────────────────────────
   *  3. Navigatore con initialRoute dinamica
   *  ────────────────────────────────────────── */
  return (
    <>
    <SafeAreaProvider>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <NavThemeProvider value={NAV_THEME[colorScheme]}>
              <Stack
                screenOptions={SCREEN_OPTIONS}
                initialRouteName={isLogged ? '(tabs)' : '(home)'}
              >
                {/* NB: se non hai creato (home) devi farlo! */}
                <Stack.Screen name="(home)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={TABS_OPTIONS} />
                <Stack.Screen name="(organization)/[id]" options={TABS_OPTIONS} />
                <Stack.Screen name="modal" options={MODAL_OPTIONS} />
                {/* Tipo sono pagine senza le tabs */}
+               <Stack.Screen name="(page)" options={{ headerShown: false }} />
              </Stack>
            </NavThemeProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
      </SafeAreaProvider>
    </>
  );
}

/* ──────────────────────────────
 *  Opzioni navigator di default
 * ────────────────────────────── */
const SCREEN_OPTIONS = {
  animation: 'ios_from_right', // Android friendly
} as const;

const TABS_OPTIONS = {
  headerShown: false,
} as const;

const MODAL_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom', // Android friendly
  title: 'Settings',
  headerRight: () => <ThemeToggle />,
} as const;
