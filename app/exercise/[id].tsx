import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

export default function ExerciseDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [exercise, setExercise] = useState<{
        id: number;
        name: string;
        description: string;
        image?: string;
    } | null>(null);

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

    const deleteExercise = async () => {
        Alert.alert(
            "Delete Exercise",
            "Are you sure you want to delete this exercise?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const data = await AsyncStorage.getItem("exercises");
                        if (!data) return;
                        const exercises = JSON.parse(data).filter(
                            (e: any) => e.id.toString() !== id
                        );
                        await AsyncStorage.setItem("exercises", JSON.stringify(exercises));
                        router.back();
                    },
                },
            ]
        );
    };

    const editExercise = () => {
        // Navigate to an edit page with the exercise id
        router.push(`/edit-exercise/${id}`);
    };

    if (!exercise) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Exercise not found</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {exercise.image && (
                <Image 
                    source={exercise.image} 
                    style={styles.image} 
                    contentFit="cover"
                />
            )}
            <ThemedText type="title" style={styles.title}>
                {exercise.name}
            </ThemedText>
            <ScrollView style={{ marginTop: 16 }}>
                <ThemedText>
                    {exercise.description || "No description provided."}
                </ThemedText>
            </ScrollView>

            <TouchableOpacity style={styles.editButton} onPress={editExercise}>
                <ThemedText style={styles.buttonText}>Edit</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={deleteExercise}>
                <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    image: {
        width: "100%",
        height: 220,
        borderRadius: 16,
        marginBottom: 16,
    },
    title: {
        marginBottom: 8,
    },
    editButton: {
        backgroundColor: Colors.dark.tint,
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 16,
    },
    deleteButton: {
        backgroundColor: "#FF4C4C",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 12,
    },
    buttonText: {
        color: Colors.dark.background,
        fontSize: 16,
    },
    deleteButtonText: {
        color: "fff",
        fontSize: 16,
    },
});
