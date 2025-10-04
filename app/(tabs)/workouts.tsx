import { useCallback, useState } from "react";
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import {Workout} from "@/types/workout";
import {getWorkouts} from "@/repository/supabase/workoutRepoSupabase.ts";
import {getExercises} from "@/repository/supabase/exerciseRepoSupabase.ts";

export default function WorkoutsScreen() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const router = useRouter();
    
    useFocusEffect(
        useCallback(() => {
            const loadWorkouts = async () => {
                const workoutsData = await getWorkouts();
                const exercisesData = await getExercises();

                const syncedWorkouts = workoutsData.map(w => ({
                    ...w,
                    exercises: w.exercises.filter(we =>
                        exercisesData.some(e => e.id === we.exerciseId)
                    ),
                }));

                setWorkouts(syncedWorkouts);
            };
            loadWorkouts();
        }, [])
    );


    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/workout/${item.id}`)}
        >
            <View style={styles.cardTextContainer}>
                <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                    {item.name}
                </ThemedText>
                <ThemedText type="default">
                    {item.exercises.length} exercises
                </ThemedText>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push("/add-workout")}
            >
                <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
                    + Add Workout
                </ThemedText>
            </TouchableOpacity>

            <FlatList
                data={workouts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.dark.background,
        paddingTop: 16,
    },
    addButton: {
        backgroundColor: Colors.dark.tint,
        marginHorizontal: 16,
        marginBottom: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    addButtonText: {
        color: Colors.dark.background,
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    card: {
        flexDirection: "row",
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "rgb(47,47,47)",
        padding: 16,
    },
    cardTextContainer: {
        flex: 1,
        justifyContent: "center",
    },
    cardTitle: {
        fontSize: 16,
        color: Colors.dark.text,
    },
});
