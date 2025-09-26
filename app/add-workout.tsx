import { useState, useEffect } from "react";
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    TextInput,
    Image,
    Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Workout } from "@/types/workout";
import { Exercise } from "@/types/exercise";
import {saveWorkout} from "@/repository/workoutRepository";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 80;
const IMAGE_WIDTH = 100;

export default function AddWorkout() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selected, setSelected] = useState<Exercise[]>([]);
    const [name, setName] = useState("");
    const router = useRouter();

    useEffect(() => {
        const loadExercises = async () => {
            const data = await AsyncStorage.getItem("exercises");
            setExercises(data ? JSON.parse(data) : []);
        };
        loadExercises();
    }, []);

    const toggleSelect = (exercise: Exercise) => {
        if (selected.some((e) => e.id === exercise.id)) {
            setSelected((prev) => prev.filter((e) => e.id !== exercise.id));
        } else {
            setSelected((prev) => [...prev, exercise]);
        }
    };

    const handleSaveWorkout = async () => {
        const newWorkout: Workout = {
            id: Date.now().toString(),
            name: name || "Untitled Workout",
            exercises: selected.map((ex) => ({
                exerciseId: ex.id,
                sets: [],
            })),
        };

        try {
            await saveWorkout(newWorkout);
            router.back();
        } catch (error) {
            console.error("Error saving workout:", error);
        }
    };

    const renderItem = ({ item }: { item: Exercise }) => {
        const isSelected = selected.some((e) => e.id === item.id);
        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { borderWidth: isSelected ? 2 : 0, borderColor: Colors.dark.tint },
                ]}
                onPress={() => toggleSelect(item)}
            >
                <Image
                    source={
                        item.image
                            ? { uri: item.image }
                            : require("@/assets/images/favicon.png")
                    }
                    style={styles.cardImage}
                />
                <View style={styles.cardTextContainer}>
                    <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                        {item.name}
                    </ThemedText>
                </View>
            </TouchableOpacity>
        );
    };



    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header + input stay fixed above the list */}
            <View style={styles.header}>
                <ThemedText type="title" style={styles.label}>
                    Name
                </ThemedText>
                <TextInput
                    placeholder="Workout name"
                    placeholderTextColor={Colors.dark.tabIconDefault}
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
            </View>

            {/* Exercises scrollable list */}
            <FlatList
                data={exercises}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                style={styles.list}
            />

            {/* Save button pinned to bottom */}
            {selected.length > 0 && (
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
                    <ThemedText style={styles.saveButtonText}>
                        Save Workout
                    </ThemedText>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    label: {
        marginBottom: 8,
        color: Colors.dark.text,
    },
    input: {
        backgroundColor: Colors.dark.tabIconDefault,
        padding: 12,
        borderRadius: 12,
        color: Colors.dark.text,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100, // prevent last card from being hidden by save button
    },
    card: {
        flexDirection: "row",
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "rgb(47,47,47)",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        height: CARD_HEIGHT,
        position: "relative",
    },
    cardImage: {
        width: IMAGE_WIDTH,
        height: "100%",
        resizeMode: "cover",
    },
    cardTextContainer: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    cardTitle: {
        fontSize: 16,
        color: "#fff",
    },
    saveButton: {
        backgroundColor: Colors.dark.tint,
        margin: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonText: {
        color: Colors.dark.background,
        fontSize: 16,
    },
});
