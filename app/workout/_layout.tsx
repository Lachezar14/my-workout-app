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
                    headerShown: false,
                }}
            />
            {/* Add exercise to workout screen */}
            <Stack.Screen
                name="add-exercise-to-workout"
                options={{
                    headerTitle: 'Add Exercise',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}

