import { Exercise } from "@/types/exercise";
import {supabase} from "@/supabaseClient";

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
