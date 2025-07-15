import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Pressable,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWebRTCContext } from '../lib/WebRTCContext';
import { useLocalSearchParams } from 'expo-router';
import { FIXED_ROOM_ID } from '../lib/config';

const WEB_LINK_PREFIX = 'https://call-web-five.vercel.app/#/room/';

const Ongoing = () => {
  const router = useRouter();
  const { 
    acceptCall, 
    makeCall, 
    hangupCall, 
    localStream, 
    remoteStream, 
    lastOffer 
  } = useWebRTCContext();
  const [isMuted, setIsMuted] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (remoteStream) {
      setIsLoading(false);
      setJoined(true);
    }
  }, [remoteStream]);

  useEffect(() => {
    // If we have a lastOffer, it means we are the callee and should accept.
    // Otherwise, we are the caller and should make the call.
    if (lastOffer) {
      acceptCall();
    } else {
      makeCall();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = !next; // disable when muted
        });
      }
      return next;
    });
  };

  const [roomId, setRoomId] = useState<string>(FIXED_ROOM_ID);
  const [roomLink, setRoomLink] = useState<string>(`${WEB_LINK_PREFIX}${FIXED_ROOM_ID}`);
  const [full, setFull] = useState(false);

  const handleHangup = () => {
    // initiate clean-up; onLeave callback above handles UI state
    hangupCall();
    router.navigate('/home');
  };

  const [callDuration, setCallDuration] = useState(0);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (joined) {
      interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000) as unknown as NodeJS.Timeout;
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [joined]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <>
      <StatusBar barStyle="light-content"/>
      <View className="flex-1 bg-black justify-center items-center p-4">
        {roomId ? (
          <View className="flex-1 justify-center items-center">
            {joined ? (
              <>
                <Image
                  source={{uri: 'https://i.pravatar.cc/300'}}
                  className="w-32 h-32 rounded-full mb-6"/>

                <Text className="text-white text-2xl font-bold mb-1">Caller</Text>
                <Text className="text-gray-400 mb-10">Ongoing Call...</Text>
                <Text className="text-gray-300 mb-4 font-bold text-2xl">
                  {formatDuration(callDuration)}
                </Text>

                <View className="flex-row justify-center space-x-4 mt-4">
                  <Pressable
                    onPress={handleToggleMute}
                    className={`p-4 rounded-full ${isMuted ? 'bg-red-200' : 'bg-white'}`}
                  >
                    <Ionicons
                      name={isMuted ? 'mic-off' : 'mic'}
                      size={28}
                      color={isMuted ? 'red' : 'black'}/>
                  </Pressable>
                </View>
                <View className="absolute bottom-10 flex-row space-x-6 justify-center">
                  <Pressable onPress={handleHangup} className="bg-red-600 p-4 rounded-full mb-6">
                    <MaterialCommunityIcons name="phone-hangup" size={32} color="white"/>

                  </Pressable>
                </View>
              </>
            ) : (
              <ActivityIndicator size="large" color="#fff"/>

            )}

            {full && <Text className="text-red-500 mt-4">This room is full.</Text>}
          </View>
        ) : (
          <View className="w-full px-4">
            <Text className="text-2xl text-white font-bold mb-6 text-center">Enter Call-Mode</Text>

            {/* Hidden because room is pre-joined
            <Pressable onPress={handleCreateRoom} className="items-center mb-6">
              <View className="bg-green-600 p-4 rounded-full mb-2">
                <MaterialCommunityIcons name="call-made" size={32} color="white"/>
              </View>
            </Pressable>
            */}
          </View>
        )}

        {(isLoading || !localStream) && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/70 justify-center items-center">
            <ActivityIndicator size="large" color="#fff"/>
            <Text className="text-white mt-4">{isLoading ? 'Loading...' : 'Connecting to Server...'}</Text>
          </View>
        )}
      </View>
    </>
  );
};

export default Ongoing;
