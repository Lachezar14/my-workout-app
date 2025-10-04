import { supabase } from "@/supabaseClient";
import { Workout } from "@/types/workout";
import { ExerciseWithSets } from "@/types/exercise";

/**
 * Fetch all workouts with exercises and sets
 */
export const getWorkouts = async (): Promise<Workout[]> => {
    // Fetch workouts
    const { data: workouts, error } = await supabase.from("workouts").select("*");
    if (error) throw error;
    if (!workouts) return [];

    // Fetch all workout exercises
    const { data: workoutExercises } = await supabase
        .from("workout_exercises")
        .select("*");

    return workouts.map((w) => ({
        ...w,
        exercises: workoutExercises
            .filter((we) => we.workout_id === w.id)
            .map((we) => ({
                exerciseId: we.exercise_id,
                sets: we.sets,
            })),
    }));
};

/**
 * Fetch a single workout by id with exercises
 */
export const getWorkoutById = async (id: string): Promise<Workout | null> => {
    const { data: workout, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", id)
        .single();
    if (error) throw error;
    if (!workout) return null;

    const { data: workoutExercises } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", id);

    return {
        ...workout,
        exercises: (workoutExercises || []).map((we) => ({
            exerciseId: we.exercise_id,
            sets: we.sets,
        })),
    };
};

/**
 * Save a new workout and its exercises
 */
export const saveWorkout = async (workout: Workout) => {
    const { error: workoutError } = await supabase.from("workouts").insert([{
        id: workout.id,
        name: workout.name,
    }]);
    if (workoutError) throw workoutError;

    // Insert workout_exercises
    if (workout.exercises.length > 0) {
        const { error: weError } = await supabase.from("workout_exercises").insert(
            workout.exercises.map((we) => ({
                workout_id: workout.id,
                exercise_id: we.exerciseId,
                sets: we.sets,
            }))
        );
        if (weError) throw weError;
    }
};

/**
 * Delete workout and its exercises
 */
export const deleteWorkout = async (id: string) => {
    // Delete workout_exercises first
    const { error: weError } = await supabase
        .from("workout_exercises")
        .delete()
        .eq("workout_id", id);
    if (weError) throw weError;

    // Delete the workout
    const { error: workoutError } = await supabase
        .from("workouts")
        .delete()
        .eq("id", id);
    if (workoutError) throw workoutError;
};

/**
 * Update workout exercises with sets
 */
export const updateWorkoutExercises = async (
    workoutId: string,
    exercisesWithSets: ExerciseWithSets[]
) => {
    // Fetch existing workout exercises
    const { data: existingWE, error } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", workoutId);
    if (error) throw error;

    // Update or insert each exercise
    for (const ex of exercisesWithSets) {
        const existing = existingWE?.find((we) => we.exercise_id === ex.id);
        if (existing) {
            const { error: updateError } = await supabase
                .from("workout_exercises")
                .update({ sets: ex.sets })
                .eq("id", existing.id);
            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await supabase
                .from("workout_exercises")
                .insert([{
                    workout_id: workoutId,
                    exercise_id: ex.id,
                    sets: ex.sets,
                }]);
            if (insertError) throw insertError;
        }
    }
};
