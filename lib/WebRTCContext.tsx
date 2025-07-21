import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import useWebRTC from './useWebRTC';
import { router, usePathname } from 'expo-router';
import { FIXED_ROOM_ID } from '../lib/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Since useWebRTC is a JS file, we define the return type here
export interface UseWebRTCReturn {
  joinRoom: (id: string) => void;
  hangupCall: () => void;
  isConnected: boolean;
  joinedRoom: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  rejectCall: () => void;
  makeCall: () => Promise<void>;
  acceptCall: () => Promise<void>;
  lastOffer: any; // RTCSessionDescriptionInit from react-native-webrtc
}

/** Shape of the context value */
interface Ctx extends UseWebRTCReturn {
  joinFixedRoom: () => void;
  peerJoined: boolean;
}

const WebRTCContext = createContext<Ctx | null>(null);

export function WebRTCProvider({ children }: { children: ReactNode }) {
  const webrtc = useWebRTC({
    onPeerJoined: useCallback((peerId: string) => {
      console.log('[Context] Peer joined:', peerId);
      setPeerJoined(true);
    }, []),
    onLeave: useCallback(() => {
      console.log('[Context] Left room');
      setPeerJoined(false);
      if (router) {
        router.navigate('/(tabs)/home');
      }
    }, [router]),
    onCallRejected: useCallback(() => {
      console.log('[Context] Call rejected');
      setPeerJoined(false);
      if (pathname === '/incoming' || pathname === '/ongoing') {
        router.navigate('/(tabs)/home');
      }
    }, [pathname, router]),
    onRoomFull: () => {},
    onJoined: () => {},
    onIncoming: () => {},
  });
  const [peerJoined, setPeerJoined] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

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

  const joinRoom = useCallback((roomId: string) => {
    if (webrtc.isConnected) {
      webrtc.joinRoom(roomId);
    }
  }, [webrtc.isConnected, webrtc.joinRoom]);

  /** Join the single hard‑coded room once the socket is connected */
  const joinFixedRoom = () => {
    if (webrtc.isConnected && userId) {
      joinRoom(FIXED_ROOM_ID(userId));
    }
  };

  const value: Ctx = { ...webrtc, joinRoom, joinFixedRoom, peerJoined };

  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  );
};

/** Convenience hook */
export const useWebRTCContext = () => {
  const ctx = useContext(WebRTCContext);
  if (!ctx) throw new Error("Wrap your tree with <WebRTCProvider>");
  return ctx;
};
