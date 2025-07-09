import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../../lib/api';
import {
    ScrollView,
    StatusBar,
    Text,
    View,
    Image,
    ActivityIndicator,
} from 'react-native';

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const res = await getProfile(user.id);
                    if (res.success) {
                        setProfile(res.user);
                    } else {
                        setError(res.message || 'Profile not found');
                    }
                } else {
                    setError('User not logged in');
                }
            } catch (err) {
                setError('Failed to fetch profile');
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{error}</Text>
            </View>
        );
    }
    if (!profile) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Profile not found</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 16 }} />
            ) : (
                <Ionicons name="person-circle" size={120} color="#ccc" style={{ marginBottom: 16 }} />
            )}
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{profile.name}</Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>{profile.email}</Text>
            <Text style={{ fontSize: 14, color: '#aaa' }}>Joined: {profile.created_at}</Text>
        </ScrollView>
    );

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
