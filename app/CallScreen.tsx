import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  ActivityIndicator,
  Pressable,
  Platform,
  TextInput,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useWebRTC from '../lib/useWebRTC';

// IMPORTANT: Replace this with your actual ngrok forwarding address from your terminal
// IMPORTANT: Replace this with your ngrok URL for the WEB client (port 8000)
const WEB_LINK_PREFIX = 'https://call-web-five.vercel.app/#/room/'; // Use your LAN IP and web server port

function generateRoomId() {
  return Math.random().toString(36).substr(2, 9);
}

const CallScreen = () => {
  const [roomId, setRoomId] = useState('');
  const [roomLink, setRoomLink] = useState('');
  const [joined, setJoined] = useState(false);
  const [full, setFull] = useState(false);

  const [joinInput, setJoinInput] = useState('');

  const { joinRoom, leaveRoom, isConnected, localStream, remoteStream } = useWebRTC({
    onRoomFull: () => setFull(true),
    onJoined: () => setJoined(true),
    onLeave: () => {
      // When leaving, reset to the initial screen
      handleHangup();
    },
  });

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setRoomLink(`${WEB_LINK_PREFIX}${newRoomId}`);
    joinRoom(newRoomId);
  };

  const handleShare = async () => {
    if (!roomLink) return;
    try {
      await Share.share({ message: `Join my Ringr call: ${roomLink}` });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleJoinWithCode = () => {
    if (joinInput.trim()) {
      const newRoomId = joinInput.trim();
      setRoomId(newRoomId);
      setRoomLink(`${WEB_LINK_PREFIX}${newRoomId}`);
      joinRoom(newRoomId);
    }
  };

  const handleHangup = () => {
    leaveRoom();
    setRoomId('');
    setRoomLink('');
    setJoined(false);
    setFull(false);
    setJoinInput('');
  };

    return (
    <View style={styles.container}>
      {roomId ? (
        // In a call or waiting
        <>
          <RTCView streamURL={remoteStream?.toURL()} style={styles.remoteVideo} objectFit="cover" />
          {localStream && (
            <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" zOrder={1} />
          )}
          <View style={styles.buttonContainer}>
            {joined ? (
              <Pressable onPress={handleHangup} style={[styles.button, { backgroundColor: '#e63946' }]}>
                <MaterialCommunityIcons name="phone-hangup" size={32} color="white" />
              </Pressable>
            ) : (
              <Pressable onPress={handleShare} style={styles.buttonWithLabel}>
                <View style={[styles.button, { backgroundColor: '#0284c7' }]}>
                  <MaterialCommunityIcons name="share-variant" size={32} color="white" />
                </View>
                <Text style={styles.buttonLabel}>Share Link</Text>
              </Pressable>
            )}
            {full && <Text style={styles.errorText}>This room is full.</Text>}
          </View>
        </>
      ) : (
        // Initial screen to Create or Join
        <View style={styles.joinContainer}>
          <Text style={styles.title}>Start a Call</Text>
          <Pressable onPress={handleCreateRoom} style={styles.buttonWithLabel}>
            <View style={[styles.button, { backgroundColor: '#28a745' }]}>
              <MaterialCommunityIcons name="plus" size={32} color="white" />
            </View>
            <Text style={styles.buttonLabel}>Create New Room</Text>
          </Pressable>

          <Text style={styles.separatorText}>OR</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Room Code"
            placeholderTextColor="#888"
            value={joinInput}
            onChangeText={setJoinInput}
            autoCapitalize="none"
          />
          <Pressable onPress={handleJoinWithCode} style={styles.joinButton} disabled={!joinInput.trim()}>
            <Text style={styles.joinButtonText}>Join Room</Text>
          </Pressable>
        </View>
      )}

      {!isConnected && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Connecting to Server...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#e63946',
    marginTop: 10,
    fontWeight: 'bold',
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonWithLabel: {
    alignItems: 'center',
  },
  buttonLabel: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  // Video call styles
  remoteVideo: {
    flex: 1,
    backgroundColor: '#000',
  },
  localVideo: {
    position: 'absolute',
    top: 24,
    right: 16,
    width: 120,
    height: 180,
    borderRadius: 8,
    borderColor: '#fff',
    borderWidth: 1,
    backgroundColor: '#333',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Join screen styles
  joinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  creatingContainer: {
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  linkText: {
    color: '#4dabf7',
    fontSize: 18,
    textDecorationLine: 'underline',
  },
});

export default CallScreen;
