import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

interface Params {
    name?: string;
    avatar?: string;
}

export default function IncomingCall() {
  const router = useRouter();
  

  const [callerName, setCallerName] = useState('Caller');
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/300');
  const [offer] = useState<any>(null); // No offer in demo

  useEffect(() => {
    // Demo: Simulate an incoming call after 1 second
    const timeout = setTimeout(() => {
      setCallerName('Demo Caller');
      setAvatar('https://i.pravatar.cc/301');
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleReject = () => {
    router.back();
  };

  const handleAccept = async () => {
    // Navigate to ongoing screen
    router.push('/ongoing');
  };

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Image
        source={{ uri: avatar }}
        className="w-40 h-40 rounded-full mb-8"
      />
      <Text className="text-white text-2xl font-semibold mb-1">Incoming Call</Text>
      <Text className="text-primary text-xl font-semibold mb-12">{callerName}</Text>

      <View className="flex-row space-x-4 mt-4">
        <TouchableOpacity
          className="flex-1 rounded-full bg-red-700 items-center justify-center py-3 px-10 mx-10"
          onPress={handleReject}
        >
          <Ionicons name="call-outline" size={28} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 rounded-full bg-green-700 items-center justify-center py-3 px-10 mx-10"
          onPress={handleAccept}
        >
          <Ionicons name="call-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
