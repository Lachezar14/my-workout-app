import AsyncStorage from "@react-native-async-storage/async-storage";
import { Exercise } from "@/types/exercise";

/**
 * Fetch all exercises from AsyncStorage
 */
export const getExercises = async (): Promise<Exercise[]> => {
    try {
        const data = await AsyncStorage.getItem("exercises");
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to fetch exercises:", error);
        return [];
    }
};


/**
 * Get a single exercise by id
 */
export const getExerciseById = async (id: string): Promise<Exercise | null> => {
    try {
        const data = await AsyncStorage.getItem("exercises");
        if (!data) return null;
        const exercises: Exercise[] = JSON.parse(data);
        const found = exercises.find(e => e.id.toString() === id);
        return found || null;
    } catch (error) {
        console.error("Failed to fetch exercise by id:", error);
        return null;
    }
};


/**
 * Add a new exercise
 */
export const saveExercise = async (exercise: Exercise) => {
    try {
        const existingData = await AsyncStorage.getItem("exercises");
        const exercises: Exercise[] = existingData ? JSON.parse(existingData) : [];
        exercises.push(exercise);
        await AsyncStorage.setItem("exercises", JSON.stringify(exercises));
    } catch (error) {
        console.error("Failed to add exercise:", error);
        throw error;
    }
};

/**
 * Update an existing exercise by id
 */
export const updateExercise = async (exercise: Exercise) => {
    try {
        const existingData = await AsyncStorage.getItem("exercises");
        const exercises: Exercise[] = existingData ? JSON.parse(existingData) : [];
        const updatedExercises = exercises.map((ex) =>
            ex.id === exercise.id ? exercise : ex
        );
        await AsyncStorage.setItem("exercises", JSON.stringify(updatedExercises));
    } catch (error) {
        console.error("Failed to update exercise:", error);
        throw error;
    }
};

/**
 * Delete an exercise by id
 */
export const deleteExercise = async (id: string) => {
    try {
        const existingData = await AsyncStorage.getItem("exercises");
        const exercises: Exercise[] = existingData ? JSON.parse(existingData) : [];
        const updatedExercises = exercises.filter((ex) => ex.id.toString() !== id.toString());
        await AsyncStorage.setItem("exercises", JSON.stringify(updatedExercises));
    } catch (error) {
        console.error("Failed to delete exercise:", error);
        throw error;
    }
};

