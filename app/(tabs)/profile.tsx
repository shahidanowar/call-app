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

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#d5e0e0' }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, paddingTop: 40, width: '100%', maxWidth: 360, alignItems: 'center' }}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#018a91" />
                    ) : error ? (
                        <Text style={{ color: 'gray', marginTop: 16 }}>{error}</Text>
                    ) : profile ? (
                        <>
                            {profile.avatar ? (
                                <Image source={{ uri: profile.avatar }} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 16 }} />
                            ) : (
                                <Ionicons name="person-circle-outline" size={100} color="#018a91" style={{ marginBottom: 16 }} />
                            )}
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{profile.name}</Text>
                            <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>{profile.email}</Text>
                            <Text style={{ fontSize: 14, color: '#aaa' }}>Joined: {profile.created_at}</Text>
                        </>
                    ) : (
                        <Text style={{ color: 'gray', marginTop: 16 }}>Profile not found</Text>
                    )}
                </View>
            </ScrollView>
        </>
    );
};

export default Profile;
