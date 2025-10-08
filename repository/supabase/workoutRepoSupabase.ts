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

    // Fetch all workout_exercises
    const { data: workoutExercises } = await supabase
        .from("workout_exercises")
        .select("*");

    return workouts.map((w) => ({
        ...w,
        exercises: (workoutExercises || [])
            .filter((we) => we.workout_id === w.id)
            .sort((a, b) => a.exercise_order - b.exercise_order) // <-- order them
            .map((we) => ({
                exerciseId: we.exercise_id,
                sets: we.sets,
                order: we.exercise_order, // <-- include in object
            })),
    }));
};

/**
 * Fetch all exercise IDs for a specific workout
 */
export const getExerciseIDsInWorkout = async (workoutId: string): Promise<string[]> => {
    const { data, error } = await supabase
        .from("workout_exercises")
        .select("exercise_id")
        .eq("workout_id", workoutId);

    if (error) throw error;

    // Return just the exercise IDs as an array
    return (data || []).map((row) => row.exercise_id);
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
        .eq("workout_id", id)
        .order("exercise_order", { ascending: true }); // <-- use Supabase ordering

    return {
        ...workout,
        exercises: (workoutExercises || []).map((we) => ({
            exerciseId: we.exercise_id,
            sets: we.sets,
            order: we.exercise_order, // <-- include
        })),
    };
};

/**
 * Save a new workout and its exercises
 */
export const saveWorkout = async (workout: Workout) => {
    const { error: workoutError } = await supabase.from("workouts").insert([
        {
            id: workout.id,
            name: workout.name,
        },
    ]);
    if (workoutError) throw workoutError;

    // Insert workout_exercises
    if (workout.exercises.length > 0) {
        const { error: weError } = await supabase.from("workout_exercises").insert(
            workout.exercises.map((we) => ({
                workout_id: workout.id,
                exercise_id: we.exerciseId,
                sets: we.sets,
                exercise_order: we.order, // <-- save order
            }))
        );
        if (weError) throw weError;
    }
};

/**
 * Add one or more exercises to an existing workout
 */
export const addExercisesToWorkout = async (
    workoutId: string,
    exercises: { exerciseId: string; sets?: any; order?: number }[]
) => {
    if (!exercises || exercises.length === 0) return;

    // Optional: fetch the current highest order to append correctly
    const { data: existing, error: fetchError } = await supabase
        .from("workout_exercises")
        .select("exercise_order")
        .eq("workout_id", workoutId)
        .order("exercise_order", { ascending: false })
        .limit(1);

    if (fetchError) throw fetchError;

    const startOrder = existing?.[0]?.exercise_order ?? 0;

    // Prepare rows to insert
    const rows = exercises.map((ex, i) => ({
        workout_id: workoutId,
        exercise_id: ex.exerciseId,
        sets: ex.sets || [],
        exercise_order: ex.order ?? startOrder + i + 1,
    }));

    const { error: insertError } = await supabase.from("workout_exercises").insert(rows);
    if (insertError) throw insertError;
};

/**
 * Update workout exercises with sets
 */
export const updateWorkoutExercises = async (
    workoutId: string,
    exercisesWithSets: ExerciseWithSets[]
) => {
    // Fetch existing workout_exercises
    const { data: existingWE, error } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", workoutId);
    if (error) throw error;

    // Update or insert each exercise
    for (const [index, ex] of exercisesWithSets.entries()) {
        const existing = existingWE?.find((we) => we.exercise_id === ex.id);
        if (existing) {
            const { error: updateError } = await supabase
                .from("workout_exercises")
                .update({
                    sets: ex.sets,
                    exercise_order: index, // <-- update order
                })
                .eq("id", existing.id);
            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await supabase
                .from("workout_exercises")
                .insert([
                    {
                        workout_id: workoutId,
                        exercise_id: ex.id,
                        sets: ex.sets,
                        exercise_order: index, // <-- insert with order
                    },
                ]);
            if (insertError) throw insertError;
        }
    }
};

/**
 * Delete a specific exercise from a workout
 */
export const deleteExerciseFromWorkout = async (
    workoutId: string,
    exerciseId: string
) => {
    const { error } = await supabase
        .from("workout_exercises")
        .delete()
        .eq("workout_id", workoutId)
        .eq("exercise_id", exerciseId);

    if (error) throw error;
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
