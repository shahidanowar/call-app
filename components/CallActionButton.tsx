import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface CallActionButtonProps {
    /** Tailwind background color e.g. "bg-red-600" */
    color: string;
    /** Icon or emoji string to display inside the button */
    icon: string;
    /** Callback when the button is pressed */
    onPress: () => void;
}

/**
 * Reusable circular action button used in incoming / ongoing call screens.
 * Pass a Tailwind background colour class via `color` to determine the button colour.
 */
export default function CallActionButton({ color, icon, onPress }: CallActionButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`${color} w-16 h-16 rounded-full items-center justify-center`}
            activeOpacity={0.8}
        >
            <Text className="text-white text-xl">{icon}</Text>
        </TouchableOpacity>
    );
}
