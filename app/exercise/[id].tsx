// app/exercise/[id].tsx

import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function ExerciseDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [exercise, setExercise] = useState<{ id: number; name: string; description: string } | null>(null);

    useEffect(() => {
        const loadExercise = async () => {
            const data = await AsyncStorage.getItem("exercises");
            if (!data) return;
            const exercises = JSON.parse(data);
            const found = exercises.find((e: any) => e.id.toString() === id);
            setExercise(found || null);
        };
        loadExercise();
    }, [id]);

    if (!exercise) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Exercise not found</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">{exercise.name}</ThemedText>
            <ScrollView style={{ marginTop: 16 }}>
                <ThemedText>{exercise.description || "No description provided."}</ThemedText>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
});
