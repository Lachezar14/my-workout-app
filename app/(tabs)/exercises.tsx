import { useCallback, useState } from "react";
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import {Exercise} from "@/types/exercise";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 80; // card height
const IMAGE_WIDTH = width * 0.25; // image takes 25% of card width

export default function ExercisesScreen() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            const loadExercises = async () => {
                const data = await AsyncStorage.getItem("exercises");
                setExercises(data ? JSON.parse(data) : []);
            };
            loadExercises();
        }, [])
    );

    const renderItem = ({ item }: { item: Exercise }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/exercise/${item.id}`)}
        >
            <Image
                source={
                    item.image
                        ? item.image
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push("/add-exercise")}
            >
                <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
                    + Add Exercise
                </ThemedText>
            </TouchableOpacity>

            <FlatList
                data={exercises}
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
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        height: CARD_HEIGHT,                 // fixed height for card
    },
    cardImage: {
        width: IMAGE_WIDTH,
        height: "100%",                      // image fills card height
        resizeMode: "cover",
    },
    cardTextContainer: {
        flex: 1,                             // take remaining horizontal space
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    cardTitle: {
        fontSize: 16,
        color: "#fff",
    },
});
