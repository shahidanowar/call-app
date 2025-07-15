import { Stack, router } from "expo-router";
import './global.css';
import React, { useEffect } from 'react';
import { WebRTCProvider, useWebRTCContext } from '../lib/WebRTCContext';

const FIXED_ROOM_ID = 'shahid'; // Hard‑coded room ID so this screen always joins the same audio r

function AppLayout() {
  const { isConnected, joinRoom, peerJoined } = useWebRTCContext();

  useEffect(() => {
    if (isConnected) {
      joinRoom(FIXED_ROOM_ID);
    }
  }, [isConnected, joinRoom]);

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
