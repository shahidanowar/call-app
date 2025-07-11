import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import io from 'socket.io-client';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';

// IMPORTANT: Replace this with the ngrok URL for your signaling server (port 3000)
const SERVER_URL = 'https://call-server-ueo9.onrender.com';
const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function useWebRTC({ onRoomFull, onJoined, onLeave, onCallRejected, onIncoming }) {
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [localStream, setLocalStream] = useState(/** @type {MediaStream | null} */(null));
  const [remoteStream, setRemoteStream] = useState(/** @type {MediaStream | null} */(null));
  const [roomId, setRoomId] = useState(null);
  const peerIdRef = useRef(null);

  // Get local media stream
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        if (isMounted) setLocalStream(stream);
      } catch (err) {
        Alert.alert('Media Error', 'Could not access camera/microphone.');
      }
    })();
    return () => {
      isMounted = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup signaling
  useEffect(() => {
    if (!socketRef.current) {
      // Use both polling and websocket so the client can connect in restrictive networks
      socketRef.current = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        forceNew: true,            // create dedicated connection instance
        timeout: 10000,            // 10-second connection timeout
      });

      socketRef.current.io.on('error', (err) => {
        console.warn('[Socket] connection error', err);
      });

      socketRef.current.on('connect', () => setIsConnected(true));
      socketRef.current.on('disconnect', () => setIsConnected(false));
      socketRef.current.on('joined-room', (id) => {
        setJoinedRoom(true);
        setRoomId(id);
        if (onJoined) onJoined(id);
        console.log('[Socket] joined-room', id);
        // Only set up peer connection and wait for offer; do NOT create offer here.
      });
      socketRef.current.on('room-full', () => {
        setJoinedRoom(false);
        if (onRoomFull) onRoomFull();
      });
      socketRef.current.on('peer-joined', (pid) => {
        peerIdRef.current = pid;
        if (onIncoming) onIncoming(pid);   // trigger ringtone / incoming UI
      });
      socketRef.current.on('call-rejected', () => {
        if (onCallRejected) onCallRejected();
      });

      socketRef.current.on('call-rejected', () => {
        setRemoteStream(null);
        closePeerConnection();
        if (onLeave) onLeave();            // reuse existing clean-up
      });

      socketRef.current.on('peer-left', () => {
        setRemoteStream(null);
        closePeerConnection();
        if (onLeave) onLeave();
        console.log('[Socket] peer-left');
      });
      socketRef.current.on('signal', async ({ from, data }) => {
        console.log('[Socket] signal', { from, data });
        if (data.sdp) {
          console.log('[WebRTC] Received SDP', data.sdp.type);
          await handleRemoteSDP(from, data.sdp);
        } else if (data.candidate) {
          console.log('[WebRTC] Received ICE candidate');
          await handleRemoteICE(data.candidate);
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  // Peer connection helpers
  const createPeerConnection = () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && peerIdRef.current) {
        console.log('[WebRTC] Sending ICE candidate');
        socketRef.current.emit('signal', { to: peerIdRef.current, data: { candidate: event.candidate } });
      }
    };
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        console.log('[WebRTC] Received remote track');
      }
    };
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
    };
    return pc;
  };

  const closePeerConnection = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };
  const rejectCall = () => {
    socketRef.current.emit('reject-call', roomId);
    closePeerConnection();   // Reject locally
  };

  // Signaling handlers
  const createOffer = async (pid) => {
    const pc = createPeerConnection();
    peerIdRef.current = pid;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('signal', { to: pid, data: { sdp: offer } });
      console.log('[WebRTC] Sent offer');
    } catch (err) {
      Alert.alert('Offer Error', err.message);
      console.warn('[WebRTC] Offer Error', err);
    }
  };

  const createAnswer = async (from, offer) => {
    const pc = createPeerConnection();
    peerIdRef.current = from;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current.emit('signal', { to: from, data: { sdp: answer } });
      console.log('[WebRTC] Sent answer');
    } catch (err) {
      Alert.alert('Answer Error', err.message);
      console.warn('[WebRTC] Answer Error', err);
    }
  };

  const handleRemoteSDP = async (from, sdp) => {
    const pc = createPeerConnection();
    if (sdp.type === 'offer') {
      console.log('[WebRTC] Handling remote offer');
      await createAnswer(from, sdp);
    } else if (sdp.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log('[WebRTC] Set remote answer');
    }
  };

  const handleRemoteICE = async (candidate) => {
    const pc = createPeerConnection();
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('[WebRTC] Added ICE candidate');
    } catch (err) {
      console.warn('[WebRTC] Failed to add ICE candidate', err);
    }
  };

  // API
  const joinRoom = (id) => {
    if (!id) return;
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join-room', id);
    } else {
      // Wait for connection then emit once
      socketRef.current.once('connect', () => {
        socketRef.current.emit('join-room', id);
      });
    }
  };

  const leaveRoom = () => {
    setRemoteStream(null);
    closePeerConnection(); //  closes the call

    //  DON'T emit 'leave-room'
    // DON'T disconnect socketRef

    if (onLeave) onLeave(); // call UI handlers
  };

  return {
    joinRoom,
    leaveRoom,
    isConnected,
    joinedRoom,
    localStream,
    remoteStream,
    rejectCall,
  };
}
