import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function NewExerciseScreen() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const router = useRouter();

    const saveExercise = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a name for the exercise");
            return;
        }

        try {
            const existing = await AsyncStorage.getItem("exercises");
            const exercises = existing ? JSON.parse(existing) : [];

            exercises.push({
                id: Date.now(), // simple unique ID
                name,
                description,
            });

            await AsyncStorage.setItem("exercises", JSON.stringify(exercises));

            // Go back to exercises list
            router.back();
        } catch (error) {
            console.error("Error saving exercise:", error);
            Alert.alert("Error", "Failed to save exercise");
        }
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 20, marginBottom: 12 }}>New Exercise</Text>

            <TextInput
                placeholder="Exercise Name"
                value={name}
                onChangeText={setName}
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 8,
                    marginBottom: 12,
                    borderRadius: 4,
                }}
            />

            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 8,
                    marginBottom: 12,
                    borderRadius: 4,
                    height: 100,
                    textAlignVertical: "top",
                }}
            />

            <Button title="Save Exercise" onPress={saveExercise} />
        </View>
    );
}
