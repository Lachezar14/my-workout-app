import {useState, useCallback} from "react";
import {
    StyleSheet,
    View,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity, ScrollView,
} from "react-native";
import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Workout } from "@/types/workout";
import { ExerciseWithSets } from "@/types/exercise";
import {MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import {deleteWorkout, getWorkoutById, updateWorkoutExercises} from "@/repository/workoutRepository";
import {getExercises} from "@/repository/exercisesRepository";
import {ExerciseCard} from "@/components/exercise/exerciseCard";

const CARD_HEIGHT = 80; // total height of the card
const IMAGE_WIDTH = 100; // can be smaller or bigger than CARD_HEIGHT

export default function WorkoutDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [exercisesWithSets, setExercisesWithSets] = useState<ExerciseWithSets[]>([]);
    const [editMode, setEditMode] = useState(false);
    const router = useRouter();

    // Load workout & exercises
    useFocusEffect(
        useCallback(() => {
            const loadWorkout = async () => {
                const foundWorkout = await getWorkoutById(id);
                const exercises = await getExercises();
                if (!foundWorkout) return;

                // Merge workout exercises with master exercises
                const merged: ExerciseWithSets[] = foundWorkout.exercises
                    .map(we => {
                        const ex = exercises.find(e => e.id === we.exerciseId);
                        if (!ex) return null;
                        return { ...ex, sets: we.sets };
                    })
                    .filter((e): e is ExerciseWithSets => e !== null);

                setWorkout(foundWorkout);
                setExercisesWithSets(merged);
            };

            loadWorkout();
        }, [id])
    );
    
    const handleEditMode = () => {
        if (editMode) {
            handleUpdateWorkout();
        }
        setEditMode(!editMode);
    }

    const updateSet = (exerciseId: string, setIndex: number, field: "reps" | "kgs", value: string) => {
        setExercisesWithSets((prev) =>
            prev.map((ex) =>
                ex.id === exerciseId
                    ? {
                        ...ex,
                        sets: ex.sets.map((s, i) =>
                            i === setIndex ? { ...s, [field]: value } : s
                        ),
                    }
                    : ex
            )
        );
    };

    const addSet = (exerciseId: string) => {
        setExercisesWithSets((prev) =>
            prev.map((ex) =>
                ex.id === exerciseId
                    ? { ...ex, sets: [...ex.sets, { reps: "", kgs: "" }] }
                    : ex
            )
        );
    };
    
    const removeSet = (exerciseId: string) => {
        setExercisesWithSets(prev =>
            prev.map(ex =>
                ex.id === exerciseId ? { ...ex, sets: ex.sets.slice(0, -1) } : ex
            )
        );
    };

    // Save workout
    const handleUpdateWorkout = async () => {
        if (!workout) return;
        try {
            await updateWorkoutExercises(workout.id, exercisesWithSets);
            setEditMode(false);
        } catch (error) {
            console.error("Failed to save workout:", error);
        }
    };

    // Delete workout
    const handleDeleteWorkout = async () => {
        Alert.alert(
            "Delete Workout",
            "Are you sure you want to delete this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteWorkout(id);
                            router.back();
                        } catch (error) {
                            console.error("Failed to delete workout:", error);
                            Alert.alert("Error", "Failed to delete workout");
                        }
                    },
                },
            ]
        );
    };
    
    if (!workout) return null;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: Colors.dark.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 80}
        >
            <SafeAreaView>
                {/* Scrollable content */}
                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: 120 }} // leave space for Save button
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.headerRow}>
                        {/* Back button */}
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.dark.tint} />
                        </TouchableOpacity>
                        
                        <ThemedText type="defaultSemiBold" style={styles.title}>
                            {workout.name}
                        </ThemedText>
                        
                        <View style={styles.headerButtons}>
                            <TouchableOpacity onPress={handleEditMode} style={styles.textButton}>
                                {editMode ? (
                                    <MaterialCommunityIcons
                                        name="checkbox-marked-circle-outline"
                                        size={20}
                                        color={Colors.dark.tint}
                                    />
                                ) : (
                                    <MaterialIcons name="edit" size={20} color={Colors.dark.tint} />
                                )}
                                <ThemedText style={styles.buttonText}>
                                    {editMode ? "Save" : "Edit"}
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleDeleteWorkout} style={styles.textButton}>
                                <MaterialCommunityIcons name="delete" size={20} color="#FF4C4C" />
                                <ThemedText style={[styles.buttonText, { color: "#FF4C4C" }]}>
                                    Delete
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Exercises */}
                    {exercisesWithSets.map(item => (
                        <ExerciseCard
                            key={item.id}
                            item={item}
                            editMode={editMode}
                            updateSet={updateSet}
                            addSet={addSet}
                            removeSet={removeSet}
                            onPress={() => router.push(`/exercise/${item.id}`)}
                        />
                    ))}
                </ScrollView>

                {/* Save button fixed at bottom */}
                {/*{editMode && !keyboardVisible && (
                    <TouchableOpacity style={styles.saveButtonBottom} onPress={handleUpdateWorkout}>
                        <ThemedText style={styles.saveButtonText}>Save Workout</ThemedText>
                    </TouchableOpacity>
                )}*/}
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1,
        backgroundColor: Colors.dark.background,
        padding: 16 
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 22,
        textAlign: "center",
        color: Colors.dark.text,
    },
    headerButtons: {
        flexDirection: "row",
        gap: 12,
    },
    textButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 4,
        paddingVertical: 6,
        borderRadius: 8,
    },
    buttonText: {
        marginLeft: 6,
        fontSize: 14,
        color: Colors.dark.tint,
    },
    exerciseContainer: { 
        marginBottom: 16,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "rgb(47,47,47)",
        borderRadius: 12,
        overflow: "hidden",
        height: CARD_HEIGHT,
    },
    image: {
        width: IMAGE_WIDTH,
        height: "100%",
        resizeMode: "cover",
    },
    textContainer: {
        flex: 1,
        padding: 12,
        justifyContent: "center",
    },
    name: { 
        fontSize: 16, 
        color: Colors.dark.text 
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.dark.tint,
        borderRadius: 8,
        padding: 8,
        color: Colors.dark.text,
        marginBottom: 4,
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
    saveButtonBottom: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: Colors.dark.tint,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        zIndex: 10,
    },
});
