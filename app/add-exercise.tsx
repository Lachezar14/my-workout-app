import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import {saveExercise} from "@/repository/exercisesRepository";
import {Exercise} from "@/types/exercise";

export default function AddExercise() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);
    const router = useRouter();

    // Pick image or GIF
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All, // images & gifs
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // Save exercise
    const handleSaveExercise = async () => {
        const newExercise: Exercise = {
            id: Date.now().toString(),
            name: name || "Untitled Exercise",
            description: description || "",
            image: imageUri ?? undefined,
        };

        try {
            await saveExercise(newExercise);
            router.back();
        } catch (error) {
            console.error("Error saving workout:", error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ThemedText type="title" style={styles.label}>
                Name
            </ThemedText>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Exercise name"
                style={styles.input}
                placeholderTextColor={Colors.dark.icon}
            />

            <ThemedText type="title" style={styles.label}>
                Description
            </ThemedText>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Exercise description"
                style={[styles.input, { height: 100 }]}
                placeholderTextColor={Colors.dark.icon}
                multiline
            />

            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <ThemedText style={styles.imageButtonText}>
                    {imageUri ? "Change Image/GIF" : "Add Image/GIF"}
                </ThemedText>
            </TouchableOpacity>

            {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveExercise}>
                <ThemedText style={styles.saveButtonText}>Save Exercise</ThemedText>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: Colors.dark.background,
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
        marginBottom: 16,
    },
    imageButton: {
        backgroundColor: Colors.dark.tint,
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 16,
    },
    imageButtonText: {
        color: Colors.dark.background,
        fontSize: 16,
    },
    preview: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
    },
    saveButton: {
        backgroundColor: Colors.dark.tint,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonText: {
        color: Colors.dark.background,
        fontSize: 16,
    },
});
