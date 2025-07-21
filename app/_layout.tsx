import { Stack, router } from "expo-router";
import './global.css';
import React, { useEffect, useState } from 'react';
import { WebRTCProvider, useWebRTCContext } from '../lib/WebRTCContext';
import { FIXED_ROOM_ID } from '../lib/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AppLayout() {
  const { isConnected, joinRoom, peerJoined } = useWebRTCContext();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Failed to get user ID:', error);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (isConnected && userId) {
      joinRoom(FIXED_ROOM_ID(userId));
    }
  }, [isConnected, joinRoom, userId]);

  useEffect(() => {
    if (peerJoined) {
      router.replace('/incoming');
    }
  }, [peerJoined]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="incoming" options={{ headerShown: false }} />
      <Stack.Screen name="ongoing" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <WebRTCProvider>
      <AppLayout />
    </WebRTCProvider>
  );
}
