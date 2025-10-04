import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import {saveExercise} from "@/repository/exerciseRepoSupabase.ts";
import {Exercise} from "@/types/exercise";
import {HeaderDefault} from "@/components/header/headerDefault";
import {SafeAreaView} from "react-native-safe-area-context";
import {uploadImageToSupabase} from "@/repository/storageSupabase";

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
            allowsEditing: false,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSaveExercise = async () => {
        try {
            let imageUrl: string | undefined;

            if (imageUri) {
                imageUrl = await uploadImageToSupabase(imageUri, name || "exercise");
                if (!imageUrl) throw new Error("Image upload failed");
            }

            const newExercise: Exercise = {
                id: Date.now().toString(),
                name: name || "Untitled Exercise",
                description: description || "",
                image_url: imageUrl, // make sure your DB column is image_url
            };

            await saveExercise(newExercise);
            router.back();
        } catch (error) {
            console.error("Error saving exercise:", error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView>
                <HeaderDefault title={"Add Exercise"} />
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
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
