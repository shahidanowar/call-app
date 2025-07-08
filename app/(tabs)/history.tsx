import React from 'react';
import { View, Text, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const history = () => {
    // Demo call history data - only incoming calls
    const callHistory = [
        {
            id: 1,
            name: "John Smith",
            time: "2:45 PM",
            duration: "5:32",
            type: "incoming"
        },
        {
            id: 2,
            name: "Sarah Johnson",
            time: "1:20 PM",
            duration: "2:15",
            type: "incoming"
        },
        {
            id: 3,
            name: "Mike Wilson",
            time: "11:45 AM",
            duration: "8:45",
            type: "incoming"
        },
        {
            id: 4,
            name: "Emma Davis",
            time: "10:30 AM",
            duration: "3:22",
            type: "incoming"
        },
        {
            id: 5,
            name: "Robert Brown",
            time: "Yesterday 6:15 PM",
            duration: "1:58",
            type: "incoming"
        },
        {
            id: 6,
            name: "Lisa Garcia",
            time: "Yesterday 4:20 PM",
            duration: "7:10",
            type: "incoming"
        },
        {
            id: 7,
            name: "David Miller",
            time: "Yesterday 2:45 PM",
            duration: "4:33",
            type: "incoming"
        },
        {
            id: 8,
            name: "Jennifer Taylor",
            time: "Yesterday 1:10 PM",
            duration: "2:47",
            type: "incoming"
        }
    ];

    const CallHistoryItem = ({ call }) => (
        <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 mx-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    {/* Call Type Icon */}
                    <View className="w-10 h-10 bg-teal-600/20 rounded-full items-center justify-center mr-3">
                        <Ionicons name="call" size={20} color="#0d9488" />
                    </View>

                    {/* Call Details */}
                    <View className="flex-1">
                        <Text className="text-primary font-semibold text-base mb-1">
                            {call.name}
                        </Text>
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={14} color="#717780" className="mr-1" />
                            <Text className="text-[#717780] text-sm mr-4">
                                {call.time}
                            </Text>
                            <Ionicons name="timer-outline" size={14} color="#717780" className="mr-1" />
                            <Text className="text-[#717780] text-sm">
                                {call.duration}
                            </Text>
                        </View>
                    </View>
                </View>


            </View>
        </TouchableOpacity>
    );

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <View className="flex-1 bg-[#d5e0e0]">


                {/* Call History List */}
                <ScrollView className="flex-1 mb-16 pt-4" showsVerticalScrollIndicator={false}>
                    <View className="pb-6">
                        {callHistory.map((call) => (
                            <CallHistoryItem key={call.id} call={call} />
                        ))}
                    </View>



                </ScrollView>
            </View>
        </>
    );
};

export default history;