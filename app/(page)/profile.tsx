// app/(page)/profile.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '~/lib/supabase';
import { useUser } from '~/lib/useUser';

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export default function Profile() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<ImagePicker.ImagePickerAsset | null>(
    null,
  );

  /* ──────────────── carica profilo ──────────────── */
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single<Profile>();

      if (error) {
        Alert.alert('Errore', error.message);
      } else {
        setName(data.full_name ?? '');
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    })();
  }, [user]);

  /* ──────────────── seleziona immagine ──────────────── */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Serve l’accesso alla galleria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setNewImage(result.assets[0]);
    }
  };

  /* ──────────────── upload avatar su Supabase Storage ──────────────── */
  const uploadAvatar = useCallback(async () => {
    if (!newImage) return null;

    const fileExt = newImage.uri.split('.').pop();
    const filePath = `${user?.id}/${uuidv4()}.${fileExt}`;

    // converte la URI locale in blob
    const response = await fetch(newImage.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        upsert: true,
        contentType: blob.type,
      });

    if (error) {
      throw new Error(error.message);
    }

    // ottieni URL pubblico
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }, [newImage, user]);

  /* ──────────────── salva profilo ──────────────── */
  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 3) {
      Alert.alert('Il nome deve avere almeno 3 caratteri.');
      return;
    }

    setSaving(true);
    let newAvatarUrl: string | null = avatarUrl;

    try {
      if (newImage) {
        newAvatarUrl = await uploadAvatar();
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name.trim(),
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) {
        throw new Error(error.message);
      }

      setAvatarUrl(newAvatarUrl);
      setNewImage(null);
      Alert.alert('Salvato', 'Profilo aggiornato con successo.');
    } catch (err: any) {
      Alert.alert('Errore', err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ──────────────── UI states ──────────────── */
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
        Il tuo profilo
      </Text>

      {/* Avatar */}
      <View className="items-center mb-6">
        <Image
          source={
            newImage
              ? { uri: newImage.uri }
              : avatarUrl
              ? { uri: avatarUrl }
              : require('~/assets/avatar-placeholder.png')
          }
          className="w-32 h-32 rounded-full bg-gray-300"
        />
        <Pressable
          className="mt-3 py-2 px-4 rounded bg-gray-200 dark:bg-gray-700"
          onPress={pickImage}
        >
          <Text className="text-gray-800 dark:text-gray-100">
            Cambia foto
          </Text>
        </Pressable>
      </View>

      {/* Nome */}
      <Text className="mb-1 text-gray-700 dark:text-gray-300">Nome</Text>
      <TextInput
        className="mb-6 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={name}
        onChangeText={setName}
        placeholder="Il tuo nome"
      />

      {/* Bottone Salva */}
      <Pressable
        className={`py-3 rounded ${saving ? 'bg-gray-400' : 'bg-blue-600'}`}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-semibold">
            Salva
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
