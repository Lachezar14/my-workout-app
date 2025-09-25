import { useState, useEffect } from "react";
import {
    FlatList,
    StyleSheet,
    View,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";

type Set = { reps: string };
type ExerciseWithSets = {
    id: string;
    name: string;
    image?: string;
    sets: Set[];
};
type Workout = {
    id: string;
    name: string;
    exercises: ExerciseWithSets[];
};

export default function WorkoutDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [editMode, setEditMode] = useState(false);
    const router = useRouter();

    // Load workout from AsyncStorage
    useEffect(() => {
        const loadWorkout = async () => {
            const data = await AsyncStorage.getItem("workouts");
            if (!data) return;

            const workouts: Workout[] = JSON.parse(data);
            const foundWorkout = workouts.find((w) => w.id.toString() === id);
            if (!foundWorkout) return;

            // Ensure each exercise has sets array
            const formatted = foundWorkout.exercises.map((ex) => ({
                ...ex,
                sets: ex.sets?.length ? ex.sets : [{ reps: "" }],
            }));

            setWorkout({ ...foundWorkout, exercises: formatted });
        };
        loadWorkout();
    }, [id]);

    // Update set
    const updateSet = (exerciseId: string, setIndex: number, reps: string) => {
        if (!workout) return;
        const updatedExercises = workout.exercises.map((ex) =>
            ex.id === exerciseId
                ? { ...ex, sets: ex.sets.map((s, i) => (i === setIndex ? { reps } : s)) }
                : ex
        );
        setWorkout({ ...workout, exercises: updatedExercises });
    };

    // Add new set
    const addSet = (exerciseId: string) => {
        if (!workout) return;
        const updatedExercises = workout.exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, sets: [...ex.sets, { reps: "" }] } : ex
        );
        setWorkout({ ...workout, exercises: updatedExercises });
    };

    // Save workout
    const saveWorkout = async () => {
        if (!workout) return;

        const data = await AsyncStorage.getItem("workouts");
        const workouts: Workout[] = data ? JSON.parse(data) : [];
        const index = workouts.findIndex((w) => w.id.toString() === workout.id);
        if (index !== -1) workouts[index] = workout;

        await AsyncStorage.setItem("workouts", JSON.stringify(workouts));
        Alert.alert("Saved", "Workout updated successfully");
        setEditMode(false);
    };

    // Delete workout
    const deleteWorkout = async () => {
        Alert.alert(
            "Delete Exercise",
            "Are you sure you want to delete this exercise?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const data = await AsyncStorage.getItem("workouts");
                        if (!data) return;
                        const exercises = JSON.parse(data).filter(
                            (e: any) => e.id.toString() !== id
                        );
                        await AsyncStorage.setItem("workouts", JSON.stringify(exercises));
                        router.back();
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: ExerciseWithSets }) => (
        <View style={styles.exerciseContainer}>
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/exercise/${item.id}`)}>
                <Image
                    source={item.image ? { uri: item.image } : require("@/assets/images/favicon.png")}
                    style={styles.image}
                />
                <View style={styles.textContainer}>
                    <ThemedText style={styles.name}>{item.name}</ThemedText>
                </View>
            </TouchableOpacity>

            <View style={styles.setsContainer}>
                {item.sets.map((set, index) =>
                    editMode ? (
                        <TextInput
                            key={index}
                            style={styles.input}
                            placeholder={`Set ${index + 1} reps`}
                            placeholderTextColor={Colors.dark.text}
                            keyboardType="number-pad"
                            value={set.reps}
                            onChangeText={(text) => updateSet(item.id, index, text)}
                        />
                    ) : (
                        <ThemedText key={index} style={styles.setText}>
                            Set {index + 1}: {set.reps} reps
                        </ThemedText>
                    )
                )}
                {editMode && (
                    <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(item.id)}>
                        <ThemedText style={styles.addSetButtonText}>+ Add Set</ThemedText>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (!workout) return null;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: Colors.dark.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerRow}>
                    <ThemedText type="defaultSemiBold" style={styles.title}>
                        {workout.name}
                    </ThemedText>
                    <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                        <ThemedText style={styles.editButton}>{editMode ? "Cancel" : "Edit"}</ThemedText>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={workout.exercises}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />

                {editMode && (
                    <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
                        <ThemedText style={styles.saveButtonText}>Save Workout</ThemedText>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.deleteButton} onPress={deleteWorkout}>
                    <ThemedText style={styles.deleteButtonText}>Delete Workout</ThemedText>
                </TouchableOpacity>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        padding: 16 
    },
    headerRow: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 16 
    },
    title: { 
        fontSize: 22, 
        color: Colors.dark.text 
    },
    editButton: { 
        fontSize: 16, 
        color: Colors.dark.tint 
    },
    exerciseContainer: { 
        marginBottom: 16 
    },
    card: {
        flexDirection: "row",
        backgroundColor: "rgb(47,47,47)",
        borderRadius: 12,
        overflow: "hidden",
    },
    image: { 
        width: 100, 
        height: 100, 
        resizeMode: "cover" 
    },
    textContainer: { 
        flex: 1, 
        padding: 12, 
        justifyContent: "center" 
    },
    name: { 
        fontSize: 16, 
        color: Colors.dark.text 
    },
    setsContainer: { 
        paddingHorizontal: 12, 
        marginTop: 8 
    },
    setText: { 
        color: Colors.dark.text, 
        marginBottom: 4 
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.dark.tint,
        borderRadius: 8,
        padding: 8,
        color: Colors.dark.text,
        marginBottom: 4,
    },
    addSetButton: {
        backgroundColor: Colors.dark.tint,
        padding: 8,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 4,
    },
    addSetButtonText: { 
        color: Colors.dark.background 
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
        fontSize: 16 
    },

    deleteButton: {
        backgroundColor: "#FF4C4C",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 12,
    },
    deleteButtonText: { 
        color: "#fff", 
        fontSize: 16 
    },
});
