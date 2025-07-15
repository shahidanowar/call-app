import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useWebRTCContext } from '../lib/WebRTCContext';

interface Params {
    name?: string;
    avatar?: string;
}

export default function IncomingCall() {
    const router = useRouter();
    const { peerJoined, rejectCall } = useWebRTCContext();

    const [callerName, setCallerName] = useState('Caller');
    const [avatar, setAvatar] = useState('https://i.pravatar.cc/300');
    const sound = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        const playRingtone = async () => {
            try {
                const { sound: ringtone } = await Audio.Sound.createAsync(
                    require('../assets/ringtone.mp3'),
                    { shouldPlay: true, isLooping: true }
                );
                sound.current = ringtone;
            } catch (error) {
                console.log('Error playing ringtone:', error);
            }
        };

        playRingtone();

        const timeout = setTimeout(() => {
            handleReject();
        }, 30000); // 30-second timeout

        return () => {
            clearTimeout(timeout);
            if (sound.current) {
                sound.current.stopAsync();
                sound.current.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        // If the peer leaves (peerJoined becomes false), go back to home.
        // This also handles the case where the call is rejected by the other party.
        if (!peerJoined) {
            if (sound.current) {
                sound.current.stopAsync();
            }
            router.replace('/(tabs)/home');
        }
    }, [peerJoined, router]);

    const handleReject = () => {
        if (sound.current) {
            sound.current.stopAsync();
        }
        rejectCall(); // Notify the other peer
        router.replace('/(tabs)/home');
    };

    const handleAccept = () => {
        if (sound.current) {
            sound.current.stopAsync();
        }
        router.replace('/ongoing'); // Go to ongoing screen to connect
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
