import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

const OngoingCall = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  useEffect(() => {
    // Demo: Simulate remote connection after 1s
    const timeout = setTimeout(() => setRemoteConnected(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <View className="flex-1 bg-black items-center justify-center">
      <Image
        source={{ uri: 'https://i.pravatar.cc/300' }}
        className="w-32 h-32 rounded-full mb-6"
      />
      <Text className="text-white text-2xl font-bold mb-1">John Doe</Text>
      <Text className="text-gray-400 mb-10">Ongoing Call...</Text>

      <View className="flex-row justify-center space-x-4 mt-4">
        <Pressable
          onPress={toggleMute}
          className={`p-4 rounded-full ${isMuted ? 'bg-white' : 'bg-white'}`}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={28}
            color={isMuted ? 'red' : 'black'}
          />
        </Pressable>
      </View>

      <TouchableOpacity
        className="mt-10 rounded-full bg-red-700 items-center justify-center py-3 px-10"
        onPress={() => {
          router.push('./(tabs)/home');
        }}
      >
        <Ionicons name="call-outline" size={28} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
      </TouchableOpacity>
    </View>
  );
};

export default OngoingCall;
