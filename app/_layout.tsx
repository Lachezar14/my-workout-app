import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {View} from "react-native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {ModalProvider} from "@/context/ModalContext";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
      <ModalProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <ThemeProvider value={theme}>
              <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="exercise" options={{ headerShown: false }} />
                  <Stack.Screen name="workout" options={{ headerShown: false }} />
                  <Stack.Screen name="add-exercise" options={{ title: 'Add Exercise' }} />
                    <Stack.Screen name="add-workout" options={{ title: 'Add Workout' }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
          </ThemeProvider>
      </View>
        </GestureHandlerRootView>
      </ModalProvider>
  );
}
