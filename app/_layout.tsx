import { Stack } from "expo-router";
import './global.css';

export default function RootLayout() {
  return <Stack>
    <Stack.Screen
        name="index"
        options={{headerShown: false}}

    />
    <Stack.Screen
        name="register"
        options={{headerShown: false}}

    />
    <Stack.Screen
        name="login"
        options={{headerShown: false}}

    />
    <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }} />
    <Stack.Screen
        name="landing"
        options={{ headerShown: false }} />
    <Stack.Screen
        name="incoming"
        options={{ headerShown: false }} />
    <Stack.Screen
        name="ongoing"
        options={{ headerShown: false }} />

  </Stack>
}
