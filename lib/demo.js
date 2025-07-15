// Ongoing.js – A React Native screen that shows an ongoing WebRTC audio call with mute
// and hang‑up controls. Every line below contains an inline comment explaining what it does.

import React, { useEffect, useState } from 'react'; // React framework + two hooks used by this component
import {
    View,              // Container component for layout
    Text,              // Component for displaying text
    Image,             // Component for displaying an avatar image
    ActivityIndicator, // Loading spinner
    Pressable,         // Tappable UI element (like a button)
    StatusBar,         // Allows customising the OS status‑bar (battery/time area)
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Icon packs from Expo
import { useRouter } from 'expo-router'; // Navigation hook (push/replace/back) in Expo Router
import useWebRTC from '../lib/useWebRTC'; // Custom React hook that wraps the app’s WebRTC logic

const WEB_LINK_PREFIX = 'https://call-web-five.vercel.app/#/room/'; // Base URL that the web client uses for joining rooms
const FIXED_ROOM_ID = 'shahid'; // Hard‑coded room ID so this screen always joins the same audio room

// ─────────────────────────────────────────────────────────────────────────────
// Main component definition
const Ongoing = () => {
    const router = useRouter(); // Gives imperative nav methods such as router.back()
    const [isMuted, setIsMuted] = useState(false); // TRUE while the local mic is muted

    // Toggle mute state and enable/disable the audio tracks accordingly
    const handleToggleMute = () => {
        setIsMuted((prev) => {
            const next = !prev; // Compute new mute state
            if (localStream) { // Only if we already have a local MediaStream
                localStream.getAudioTracks().forEach((track) => {
                    track.enabled = !next; // When muted, disable each track (enabled = false)
                });
            }
            return next; // Update React state
        });
    };

    // Room‑related local state. For this simplified app the roomId is fixed but we still keep it stateful
    const [roomId, setRoomId] = useState<string>(FIXED_ROOM_ID);
    const [roomLink, setRoomLink] = useState<string>(`${WEB_LINK_PREFIX}${FIXED_ROOM_ID}`); // Pre‑built shareable link
    const [joined, setJoined] = useState(false); // TRUE after we have successfully joined the room
    const [full, setFull] = useState(false); // TRUE if server says room already has 2 participants (app’s max)

    // Pull functions & values out of the custom WebRTC hook
    const { joinRoom,       // fn(roomId) → tries to join
        leaveRoom,      // fn() → hangs up & closes connections
        isConnected,    // socket.io signalling connection status
        localStream,    // MediaStream for our microphone audio
        remoteStream } = useWebRTC({
        // Callbacks passed into the hook:
        onRoomFull: () => setFull(true),              // Server refused join
        onJoined:   () => setJoined(true),            // We’re inside the room
        onLeave:    () => {
            // Clean up UI state when the remote peer leaves OR we leave
            setJoined(false);
            setFull(false);
            router.replace('/(tabs)/home');             // Go back to Home tab
        },
    });

    // Dummy function kept because a commented‑out Pressable references it. Prevents linter errors.
    const handleCreateRoom = () => {};

    // Explicit hang‑up handler wired to the red phone button
    const handleHangup = () => {
        leaveRoom();    // Tell the hook to close connections & sockets
        router.back();  // Also pop this screen from the nav stack
    };

    const [callDuration, setCallDuration] = useState(0); // Seconds since call joined

    // ───────────────────────────────────────────────────────────────────────────
    // Side‑effects (useEffect)

    // Once the signalling socket is ready, auto‑join the fixed room
    useEffect(() => {
        if (isConnected) {
            joinRoom(FIXED_ROOM_ID);
        }
    }, [isConnected]);

    // Start a 1‑second interval when we’re in the call so we can display a timer
    useEffect(() => {
        let interval: NodeJS.Timer;
        if (joined) {
            interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
        } else {
            setCallDuration(0); // Reset timer when not joined
        }
        return () => clearInterval(interval); // Cleanup on unmount or when deps change
    }, [joined]);

    // Formats the timer as mm:ss (e.g., 03:07)
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    // ───────────────────────────────────────────────────────────────────────────
    // Render
    return (
        <>
            {/* Light text on dark bg for status bar icons */}
            <StatusBar barStyle="light-content"/>

            {/* Main full‑screen container */}
            <View className="flex-1 bg-black justify-center items-center p-4">
                {/* If we have a roomId (always true here) render call UI */}
                {roomId ? (
                    <View className="flex-1 justify-center items-center">
                        {/* Inside call? show avatar + controls; else show spinner */}
                        {joined ? (
                            <>
                                {/* Avatar image (placeholder using https://i.pravatar.cc) */}
                                <Image
                                    source={{uri: 'https://i.pravatar.cc/300'}}
                                    className="w-32 h-32 rounded-full mb-6"/>

                                {/* Caller name – you could replace with remote peer name */}
                                <Text className="text-white text-2xl font-bold mb-1">Caller</Text>

                                {/* Sub‑title */}
                                <Text className="text-gray-400 mb-10">Ongoing Call...</Text>

                                {/* Timer */}
                                <Text className="text-gray-300 mb-4 font-bold text-2xl">
                                    {formatDuration(callDuration)}
                                </Text>

                                {/* Inline row that holds mute/unmute button */}
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

                                {/* Absolute‑positioned red hang‑up button at screen bottom */}
                                <View className="absolute bottom-10 flex-row space-x-6 justify-center">
                                    <Pressable onPress={handleHangup} className="bg-red-600 p-4 rounded-full mb-6">
                                        <MaterialCommunityIcons name="phone-hangup" size={32} color="white"/>
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            // Waiting for joinRoom confirmation – show spinner
                            <ActivityIndicator size="large" color="#fff"/>
                        )}

                        {/* Show ROOM FULL error message if necessary */}
                        {full && <Text className="text-red-500 mt-4">This room is full.</Text>}
                    </View>
                ) : (
                    // Fallback UI (never shown because roomId is fixed)
                    <View className="w-full px-4">
                        <Text className="text-2xl text-white font-bold mb-6 text-center">Enter Call-Mode</Text>

                        {/* The following button is hidden because we auto‑join a fixed room.
                It’s kept here for future manual room creation flow. */}
                        {/*
            <Pressable onPress={handleCreateRoom} className="items-center mb-6">
              <View className="bg-green-600 p-4 rounded-full mb-2">
                <MaterialCommunityIcons name="call-made" size={32} color="white"/>
              </View>
            </Pressable>
            */}
                    </View>
                )}

                {/* Overlay that blocks UI while the socket isn’t ready */}
                {!isConnected && (
                    <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/70 justify-center items-center">
                        <ActivityIndicator size="large" color="#fff"/>
                        <Text className="text-white mt-4">Connecting to Server...</Text>
                    </View>
                )}
            </View>
        </>
    );
};

export default Ongoing; // Export so other screens can import this component
