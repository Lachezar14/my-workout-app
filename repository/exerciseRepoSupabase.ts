import { Exercise } from "@/types/exercise";
import * as FileSystem from "expo-file-system";
import {supabase} from "@/supabaseClient";

const BUCKET = "exercise-images";

/**
 * Fetch all exercises
 */
export const getExercises = async (): Promise<Exercise[]> => {
    const { data, error } = await supabase.from("exercises").select("*").order("name", { ascending: true });
    if (error) {
        console.error("Failed to fetch exercises:", error);
        throw error;
    }
    return data || [];
};

/**
 * Fetch a single exercise by id
 */
export const getExerciseById = async (id: string): Promise<Exercise | null> => {
    const { data, error } = await supabase.from("exercises").select("*").eq("id", id).single();
    if (error) {
        console.error("Failed to fetch exercise by id:", error);
        return null;
    }
    return data;
};

/**
 * Upload an image to Supabase Storage and return its public URL
 */
const uploadImageToSupabase = async (localUri: string, exerciseId: string) => {
    try {
        const fileExt = localUri.split(".").pop();
        const fileName = `${exerciseId}.${fileExt}`;
        const filePath = `exercises/${fileName}`;

        // Read the image as base64
        const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to Blob
        const fileBlob = Buffer.from(base64, "base64");

        const { error: uploadError } = await supabase.storage
            .from("exercise-images") // your bucket name
            .upload(filePath, fileBlob, {
                contentType: `image/${fileExt}`,
                upsert: true,
            });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data } = supabase.storage.from("exercise-images").getPublicUrl(filePath);
        return data.publicUrl;
    } catch (error) {
        console.error("Image upload failed:", error);
        return null;
    }
};

/**
 * Create exercise (image URL is passed from component)
 */
export const saveExercise = async (exercise: Exercise) => {
    const { error } = await supabase.from("exercises").insert([exercise]);
    if (error) throw error;
};

/**
 * Update exercise
 */
export const updateExercise = async (exercise: Exercise) => {
    const { error } = await supabase
        .from("exercises")
        .update(exercise)
        .eq("id", exercise.id);
    if (error) throw error;
};

/**
 * Delete an exercise by id
 */
export const deleteExercise = async (id: string) => {
    try {
        const { error } = await supabase.from("exercises").delete().eq("id", id);
        if (error) throw error;
    } catch (error) {
        console.error("Failed to delete exercise:", error);
        throw error;
    }
};
