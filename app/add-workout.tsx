import { useState, useEffect } from "react";
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

export default function AddWorkout() {
    const [exercises, setExercises] = useState<any[]>([]);
    const [selected, setSelected] = useState<any[]>([]);
    const [name, setName] = useState("");
    const router = useRouter();

    useEffect(() => {
        const loadExercises = async () => {
            const data = await AsyncStorage.getItem("exercises");
            setExercises(data ? JSON.parse(data) : []);
        };
        loadExercises();
    }, []);

    const toggleSelect = (exercise: any) => {
        if (selected.some((e) => e.id === exercise.id)) {
            setSelected((prev) => prev.filter((e) => e.id !== exercise.id));
        } else {
            setSelected((prev) => [...prev, exercise]);
        }
    };

    const saveWorkout = async () => {
        const newWorkout = {
            id: Date.now(),
            name: name || "Untitled Workout",
            exercises: selected,
        };

        const existing = await AsyncStorage.getItem("workouts");
        const workouts = existing ? JSON.parse(existing) : [];
        workouts.push(newWorkout);
        await AsyncStorage.setItem("workouts", JSON.stringify(workouts));
        router.back();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TextInput
                placeholder="Workout name"
                placeholderTextColor={Colors.dark.text}
                value={name}
                onChangeText={setName}
                style={styles.input}
            />

            <FlatList
                data={exercises}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.card,
                            selected.some((e) => e.id === item.id) && styles.selectedCard,
                        ]}
                        onPress={() => toggleSelect(item)}
                    >
                        <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
                <ThemedText style={styles.saveButtonText}>Save Workout</ThemedText>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.dark.background,
        padding: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.dark.tint,
        borderRadius: 8,
        padding: 12,
        color: Colors.dark.text,
        marginBottom: 16,
    },
    card: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: Colors.dark.tabIconDefault,
        marginBottom: 8,
    },
    selectedCard: {
        backgroundColor: Colors.dark.tint,
    },
    cardTitle: {
        color: Colors.dark.text,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: Colors.dark.tint,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 16,
    },
    saveButtonText: {
        color: Colors.dark.background,
        fontSize: 16,
    },
});
