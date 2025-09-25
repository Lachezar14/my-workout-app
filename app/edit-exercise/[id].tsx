// app/edit-exercise/[id].tsx
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";

export default function EditExercise() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);

    useEffect(() => {
        const loadExercise = async () => {
            const data = await AsyncStorage.getItem("exercises");
            if (!data) return;
            const exercises = JSON.parse(data);
            const found = exercises.find((e: any) => e.id.toString() === id);
            if (!found) return;
            setName(found.name);
            setDescription(found.description);
            setImageUri(found.image || null);
        };
        loadExercise();
    }, [id]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const saveExercise = async () => {
        const data = await AsyncStorage.getItem("exercises");
        const exercises = data ? JSON.parse(data) : [];

        const index = exercises.findIndex((e: any) => e.id.toString() === id);
        if (index === -1) {
            Alert.alert("Error", "Exercise not found");
            return;
        }

        exercises[index] = {
            ...exercises[index],
            name,
            description,
            image: imageUri,
        };

        await AsyncStorage.setItem("exercises", JSON.stringify(exercises));
        router.back();
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ThemedText type="title" style={styles.label}>Name</ThemedText>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Exercise name"
                style={styles.input}
                placeholderTextColor={Colors.dark.icon}
            />

            <ThemedText type="title" style={styles.label}>Description</ThemedText>
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

            <TouchableOpacity style={styles.saveButton} onPress={saveExercise}>
                <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
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
