import {useState, useCallback} from "react";
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
import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { Workout } from "@/types/workout";
import {Exercise, ExerciseWithSets} from "@/types/exercise";
import { MaterialIcons } from "@expo/vector-icons";

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
                const wData = await AsyncStorage.getItem("workouts");
                const eData = await AsyncStorage.getItem("exercises");
                if (!wData || !eData) return;

                const workouts: Workout[] = JSON.parse(wData);
                const exercises: Exercise[] = JSON.parse(eData);

                const foundWorkout = workouts.find(w => w.id.toString() === id);
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
    
    // Update set
    const updateSet = (exerciseId: string, setIndex: number, reps: string) => {
        setExercisesWithSets(prev =>
            prev.map(ex =>
                ex.id === exerciseId
                    ? { ...ex, sets: ex.sets.map((s, i) => (i === setIndex ? { reps } : s)) }
                    : ex
            )
        );
    };

    // Add new set
    const addSet = (exerciseId: string) => {
        setExercisesWithSets(prev =>
            prev.map(ex =>
                ex.id === exerciseId
                    ? { ...ex, sets: [...ex.sets, { reps: "" }] }
                    : ex
            )
        );
    };

    // Remove set
    const removeSet = (exerciseId: string) => {
        setExercisesWithSets(prev =>
            prev.map(ex =>
                ex.id === exerciseId
                    ? { ...ex, sets: ex.sets.slice(0, -1) } // remove the last set
                    : ex
            )
        );
    };

    // Save workout
    const saveWorkout = async () => {
        if (!workout) return;

        const data = await AsyncStorage.getItem("workouts");
        const workouts: Workout[] = data ? JSON.parse(data) : [];
        const index = workouts.findIndex(w => w.id === workout.id);
        if (index === -1) return;

        // Save updated sets back to workout
        const updatedExercises = workout.exercises.map(we => {
            const ex = exercisesWithSets.find(e => e.id === we.exerciseId);
            return ex ? { ...we, sets: ex.sets } : we;
        });

        workouts[index] = { ...workout, exercises: updatedExercises };
        await AsyncStorage.setItem("workouts", JSON.stringify(workouts));
        Alert.alert("Saved", "Workout updated successfully");
        setEditMode(false);
    };

    // Delete workout
    const deleteWorkout = async () => {
        Alert.alert(
            "Delete Workout",
            "Are you sure you want to delete this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const data = await AsyncStorage.getItem("workouts");
                        if (!data) return;
                        const remaining = JSON.parse(data).filter(
                            (w: Workout) => w.id.toString() !== id
                        );
                        await AsyncStorage.setItem("workouts", JSON.stringify(remaining));
                        router.back();
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: ExerciseWithSets }) => (
        <View style={styles.exerciseContainer}>
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/exercise/${item.id}`)}
            >
                <Image
                    source={
                        item.image
                            ? { uri: item.image }
                            : require("@/assets/images/favicon.png")
                    }
                    style={styles.image}
                    autoplay={false}
                />
                <View style={styles.textContainer}>
                    <ThemedText style={styles.name}>{item.name}</ThemedText>
                </View>
            </TouchableOpacity>

            <View style={styles.setsContainer}>
                <View style={styles.setsHeaderRow}>
                    <ThemedText style={styles.setsHeaderText}>Set</ThemedText>
                    <ThemedText style={styles.setsHeaderText}>Reps</ThemedText>
                </View>

                {editMode ? (
                    item.sets.map((set, index) => (
                        <View key={index} style={styles.editRow}>
                            <ThemedText style={styles.setNumberText}>{index + 1}</ThemedText>
                            <TextInput
                                style={styles.repsInput}
                                placeholder="Reps"
                                placeholderTextColor={Colors.dark.text}
                                keyboardType="number-pad"
                                value={set.reps}
                                onChangeText={text => updateSet(item.id, index, text)}
                            />
                        </View>
                    ))
                ) : (
                    <View style={styles.setsDataRow}>
                        <View style={styles.setNumbers}>
                            {item.sets.map((_, index) => (
                                <ThemedText key={index} style={styles.setNumberText}>
                                    {index + 1}
                                </ThemedText>
                            ))}
                        </View>
                        <View style={styles.repsValues}>
                            {item.sets.map((set, index) => (
                                <ThemedText key={index} style={styles.repsValueText}>
                                    {set.reps}
                                </ThemedText>
                            ))}
                        </View>
                    </View>
                )}

                {editMode && (
                    <View style={{ flexDirection: "row", marginTop: 8 }}>
                        <TouchableOpacity
                            style={[styles.addSetButton, { flex: 1, marginRight: 8 }]}
                            onPress={() => addSet(item.id)}
                        >
                            <ThemedText style={styles.addSetButtonText}>+ Add Set</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.removeSetButton, { flex: 1 }]}
                            onPress={() => removeSet(item.id)}
                        >
                            <ThemedText style={styles.removeSetButtonText}>- Remove Set</ThemedText>
                        </TouchableOpacity>
                    </View>
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

                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            onPress={() => setEditMode(!editMode)}
                            style={styles.iconButton}
                        >
                            {editMode ? (
                                <MaterialIcons
                                    name="edit-off"
                                    size={24}
                                    color={Colors.dark.tint}
                                />
                            ) : (
                                <MaterialIcons
                                    name="edit"
                                    size={24}
                                    color={Colors.dark.tint}
                                />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={deleteWorkout}
                            style={styles.iconButton}
                        >
                            <MaterialIcons name="delete" size={24} color="#FF4C4C" />
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={exercisesWithSets}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />

                {editMode && (
                    <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
                        <ThemedText style={styles.saveButtonText}>
                            Save Workout
                        </ThemedText>
                    </TouchableOpacity>
                )}
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
        marginBottom: 16,
    },
    headerButtons: {
        flexDirection: "row",
        gap: 12, // space between icons
    },
    iconButton: {
        padding: 8, // increases touch area
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
        marginBottom: 16,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "rgb(47,47,47)",
        borderRadius: 12,
        overflow: "hidden",
        height: CARD_HEIGHT, // set the card height here
    },
    image: {
        width: IMAGE_WIDTH, // image width
        height: "100%",     // take full card height
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
    setsContainer: { paddingHorizontal: 12, marginTop: 8 },
    setsHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    setsHeaderText: { color: Colors.dark.text, fontWeight: "bold" },

    setsDataRow: { flexDirection: "row", justifyContent: "space-between" },
    setNumbers: {},
    repsValues: {},
    repsValueText: { color: Colors.dark.text, marginBottom: 4 },
    addSetButton: {
        backgroundColor: Colors.dark.tint,
        padding: 8,
        borderRadius: 8,
        alignItems: "center",
    },
    removeSetButton: {
        backgroundColor: Colors.dark.background,
        borderColor: Colors.dark.tint,
        borderWidth: 1,
        padding: 8,
        borderRadius: 8,
        alignItems: "center",
    },
    addSetButtonText: { color: Colors.dark.background },
    removeSetButtonText: { color: Colors.dark.tint },
    editRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    setNumberText: { color: Colors.dark.text, width: 30 },
    repsInput: {
        borderWidth: 1,
        borderColor: Colors.dark.tint,
        borderRadius: 8,
        padding: 8,
        color: Colors.dark.text,
        width: 60, // only under the Reps column
        textAlign: "center",
    },
});
