// app/workout/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function WorkoutLayout() {
    return (
        <Stack>
            {/* Workout detail screen */}
            <Stack.Screen
                name="[id]"
                options={{
                    headerTitle: 'Workout Details',
                }}
            />
        </Stack>
    );
}

