import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
        <Tabs.Screen
            name="workouts"
            options={{
                title: 'Workouts',
                tabBarIcon: ({ color }) => <MaterialIcons size={28} name="fitness-center" color={color} />,
            }}
        />  
      <Tabs.Screen
          name="exercises"
            options={{
                title: 'Exercises',
                tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="weight-lifter" color={color} />,
            }}
      />
    </Tabs>
  );
}
