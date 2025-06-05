import React from 'react';
import { Link, Tabs } from 'expo-router';
import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb', // Blu acceso
        headerRight: () => (
          // Pulsante per andare al profilo
          <Link href="/profile" asChild>
            <HeaderButton />
          </Link>
        ),
      }}
    >

      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      {/* TUTTI GLI EVENTI */}
      <Tabs.Screen
        name="events"
        options={{
          title: 'Eventi',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />

      {/* I MIEI EVENTI */}
      <Tabs.Screen
        name="my-events"
        options={{
          title: 'I miei eventi',
          tabBarIcon: ({ color }) => <TabBarIcon name="clipboard" color={color} />,
        }}
      />
    </Tabs>
  );
}
