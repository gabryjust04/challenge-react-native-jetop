// app/(organization)/[id]/_layout.tsx

import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { SafeAreaView, View, ActivityIndicator, Text } from 'react-native';
import { supabase } from '~/lib/supabase';
import { useUser } from '~/lib/useUser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrganizationStore } from '~/store/useOrganizationStore';
import { TabBarIcon } from '~/components/TabBarIcon'; // ← import icone

export default function OrgTabsLayout() {
  const { user } = useUser();
  const { id: orgId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const setOrgId = useOrganizationStore((s) => s.setOrgId);

  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState<string>('');

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setOrgId(orgId);
    if (!user) return;

    (async () => {
      const { data: member, error: memErr } = await supabase
        .from('organization_member')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single();

      if (memErr || !member) {
        router.replace('/');
        return;
      }

      const { data: org, error: orgErr } = await supabase
        .from('organization')
        .select('name')
        .eq('id', orgId)
        .single();

      if (orgErr || !org) {
        router.replace('/');
        return;
      }

      setOrgName(org.name);
      setLoading(false);
    })();
  }, [user, orgId, setOrgId, router]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 px-6 bg-white dark:bg-gray-900">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8, color: '#555' }}>Caricamento…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563eb',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: `Admin ${orgName}`,
            tabBarIcon: ({ color }) => <TabBarIcon name="cogs" color={color} />,
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Eventi',
            tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="add-event"
          options={{
            title: 'Nuovo Evento',
            tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
