import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    Text,
    View,
    ActivityIndicator,
} from 'react-native';

const Profile = () => {
    // Use a mock user for demo purposes
    const [user] = useState<{ name: string; email: string } | null>({ name: 'Demo User', email: 'demo@example.com' });
    const [loading] = useState(false);

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <ScrollView className="flex-1 bg-[#d5e0e0] px-6 py-10">
                <View className="bg-white rounded-2xl p-6 pt-10 w-full max-w-sm self-center items-center">
                    <Ionicons name="person-circle-outline" size={100} color="#018a91" />

                    {loading ? (
                        <ActivityIndicator size="large" color="#018a91" className="mt-6" />
                    ) : user ? (
                        <>
                            <Text className="text-2xl font-bold text-gray-800 mb-1">
                                {user.name}
                            </Text>
                            <Text className="text-base text-gray-500 mb-4">
                                {user.email}
                            </Text>
                        </>
                    ) : (
                        <Text className="text-gray-500 mt-4">Failed to load profile</Text>
                    )}
                </View>
            </ScrollView>
        </>
    );
};

export default Profile;
