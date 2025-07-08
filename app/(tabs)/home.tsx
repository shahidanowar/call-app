import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { router } from 'expo-router';

// Ports explanation:
// 3000 = Node.js signaling server (WebSocket/WSS for signaling)
// 5173 = Vite dev server (web frontend, serves the React app)
const CALLEE_ID = 'user123';
const QR_URL = `https://demo-app/call/${CALLEE_ID}`;

const Home = () => {
    const [showQR, setShowQR] = useState(false); // Start with QR hidden
    const peerRef = useRef<any>(null);
    const localStreamRef = useRef<any>(null);

    useEffect(() => {
        // No-op for demo
        return () => {};
    }, []);

    const ActionButton = ({
                              label,
                              onPress,
                              icon,
                              backgroundColor = "bg-gray-800",
                              textColor = "text-white"
                          }: {
        label: string;
        onPress: () => void;
        icon?: string;
        backgroundColor?: string;
        textColor?: string;
    }) => (
        <TouchableOpacity
            onPress={onPress}
            className={`${backgroundColor} px-8 py-4 rounded-full items-center justify-center mx-2 flex-row`}
        >
            {icon && <Ionicons name={icon as any} size={20} color="white" style={{ marginRight: 8 }} />}
            <Text className={`${textColor} font-semibold text-base`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <>
            <StatusBar barStyle="dark-content"/>
            <View className="flex-1 bg-[#d5e0e0]">
                <View className="flex-1 items-center mt-10 px-6 py-8">

                    <View className="bg-white rounded-2xl p-6 pt-10 w-full max-w-sm items-center mb-6">
                        {showQR ? (
                            <>
                                <View className="bg-white rounded-xl p-4 mb-4 relative">

                                    <QRCode
                                        value={QR_URL}
                                        size={200}
                                        color="black"
                                        backgroundColor="white"
                                    />
                                </View>


                            </>
                        ) : (
                            <View className="items-center py-16 mb-5">
                                <Ionicons name="qr-code-outline" size={64} color="#6b7280" className="mb-4" />
                                <Text className="text-gray-400 text-lg font-medium text-center">
                                    Generate QR to view
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* QR*/}
                    <View className="flex-row justify-center w-full">
                        {!showQR ? (
                            <ActionButton
                                label="Generate QR"
                                onPress={() => setShowQR(true)}
                                icon="qr-code"
                                backgroundColor="bg-teal-600"
                            />
                        ) : (
                            <>
                                <ActionButton
                                    label="Print QR"
                                    onPress={() => {
                                        router.push('../incoming');
                                        console.log('Print clicked');
                                    }}
                                    icon="print"
                                    backgroundColor="bg-gray-800"
                                />

                                <ActionButton
                                    label="Share QR"
                                    onPress={() => {
                                        router.push('../ongoing');
                                        console.log('Share clicked');
                                    }}
                                    icon="share"
                                    backgroundColor="bg-gray-800"
                                />
                            </>
                        )}
                    </View>


                </View>
            </View>
        </>
    );
};

export default Home;