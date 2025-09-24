import { useEffect, useState, useCallback } from "react";
import { View, Text, Button, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import {ThemedView} from "@/components/themed-view";
import {ThemedText} from "@/components/themed-text";

export default function ExercisesScreen() {
    const [exercises, setExercises] = useState<any[]>([]);
    const router = useRouter();

    const loadExercises = async () => {
        const data = await AsyncStorage.getItem("exercises");
        if (data) setExercises(JSON.parse(data));
        else setExercises([]);
    };

    // Run whenever the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadExercises();
        }, [])
    );

    return (
        <ThemedView style={{ flex: 1, padding: 16 }}>
            <Button title="Add Exercise" onPress={() => router.push("/newExercise")} />
            <FlatList
                data={exercises}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/exercise/${item.id}`)}
                        style={{ padding: 12, borderBottomWidth: 1, borderColor: "#ccc" }}
                    >
                        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                    </TouchableOpacity>
                )}
            />
        </ThemedView>
    );
}
