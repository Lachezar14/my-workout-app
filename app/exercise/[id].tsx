import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Alert,
    TouchableOpacity,
    TextInput,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Exercise } from "@/types/exercise";
import * as ImagePicker from "expo-image-picker";

export default function ExerciseDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | undefined>(undefined);

    useEffect(() => {
        const loadExercise = async () => {
            const data = await AsyncStorage.getItem("exercises");
            if (!data) return;
            const exercises = JSON.parse(data);
            const found = exercises.find((e: any) => e.id.toString() === id);
            if (found) {
                setExercise(found);
                setTitle(found.name);
                setDescription(found.description || "");
                setImage(found.image);
            }
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

    const saveExercise = async () => {
        if (!exercise) return;
        const data = await AsyncStorage.getItem("exercises");
        if (!data) return;
        const exercises = JSON.parse(data).map((e: any) =>
            e.id === exercise.id
                ? { ...e, name: title, description, image }
                : e
        );
        await AsyncStorage.setItem("exercises", JSON.stringify(exercises));
        setExercise({ ...exercise, name: title, description, image });
        setEditMode(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
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
            <TouchableOpacity onPress={editMode ? pickImage : undefined}>
                {image && (
                    <Image
                        source={image}
                        style={styles.image}
                        contentFit="cover"
                    />
                )}
                {editMode && (
                    <View style={styles.imageOverlay}>
                        <ThemedText style={styles.overlayText}>Update Image</ThemedText>
                    </View>
                )}
            </TouchableOpacity>

            {editMode ? (
                <>
                    <ThemedText style={styles.label}>Title</ThemedText>
                    <TextInput
                        style={styles.inputTitle}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Exercise title"
                        placeholderTextColor="#888"
                    />
                </>
            ) : (
                <ThemedText type="title" style={styles.title}>
                    {exercise.name}
                </ThemedText>
            )}

            <ScrollView style={{ marginTop: 16 }}>
                {editMode ? (
                    <>
                        <ThemedText style={styles.label}>Description</ThemedText>
                        <TextInput
                            style={styles.inputDescription}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Exercise description"
                            placeholderTextColor="#888"
                            multiline
                        />
                    </>
                ) : (
                    <ThemedText>
                        {exercise.description || "No description provided."}
                    </ThemedText>
                )}
            </ScrollView>

            {editMode ? (
                <>
                    <TouchableOpacity style={styles.editButton} onPress={saveExercise}>
                        <ThemedText style={styles.buttonText}>Save</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={deleteExercise}>
                        <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                    </TouchableOpacity>
                </>
            ) : (
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditMode(true)}
                >
                    <ThemedText style={styles.buttonText}>Edit</ThemedText>
                </TouchableOpacity>
            )}
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
    imageOverlay: {
        position: "absolute",
        top: 100,
        left: 50,
        right: 50,
        bottom: 100,
        borderRadius: 8,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    overlayText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    title: {
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: "#aaa",
        marginBottom: 4,
    },
    inputTitle: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: "rgb(47,47,47)",
        color: "#fff",
    },
    inputDescription: {
        fontSize: 16,
        borderRadius: 8,
        padding: 8,
        minHeight: 100,
        backgroundColor: "rgb(47,47,47)",
        color: "#fff",
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
        color: "#fff",
        fontSize: 16,
    },
});
