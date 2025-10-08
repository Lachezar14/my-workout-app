import { useState, useEffect } from "react";
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {useLocalSearchParams, useRouter} from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Exercise } from "@/types/exercise";
import {addExercisesToWorkout, getExerciseIDsInWorkout} from "@/repository/supabase/workoutRepoSupabase.ts";
import {HeaderDefault} from "@/components/header/headerDefault";
import {getExercises} from "@/repository/supabase/exerciseRepoSupabase.ts";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 80;
const IMAGE_WIDTH = 100;

export default function AddExerciseToWorkout() {
    const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selected, setSelected] = useState<Exercise[]>([]);
    const router = useRouter();

    useEffect(() => {
        const loadExercises = async () => {
            const all = await getExercises();
            const inWorkout = await getExerciseIDsInWorkout(workoutId);

            // Filter out exercises already in the workout
            const filtered = all.filter((ex) => !inWorkout.includes(ex.id));
            setExercises(filtered);
        };

        if (workoutId) loadExercises();
    }, [workoutId]);

    const toggleSelect = (exercise: Exercise) => {
        if (selected.some((e) => e.id === exercise.id)) {
            setSelected((prev) => prev.filter((e) => e.id !== exercise.id));
        } else {
            setSelected((prev) => [...prev, exercise]);
        }
    };

    const handleAddExerciseToWorkout = async () => {
        if (!workoutId || selected.length === 0) return;

        await addExercisesToWorkout(
            workoutId,
            selected.map((ex) => ({
                exerciseId: ex.id,
            }))
        );

        router.back(); // go back to workout detail
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
                        item.image_url
                            ? { uri: item.image_url }
                            : require("@/assets/images/favicon.png")
                    }
                    style={styles.cardImage}
                    autoplay={false}
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
            <View style={styles.header}>
                <HeaderDefault title={"Add Exercise"} />
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
                <TouchableOpacity style={styles.saveButton} onPress={handleAddExerciseToWorkout}>
                    <ThemedText style={styles.saveButtonText}>
                        Add Exercises
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
        padding: 16,
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
