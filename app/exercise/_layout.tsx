// app/exercise/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function ExerciseLayout() {
    return (
        <Stack>
            {/* Exercise detail screen */}
            <Stack.Screen
                name="[id]"
                options={{
                    headerTitle: 'Exercise Details',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}

