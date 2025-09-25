import AsyncStorage from "@react-native-async-storage/async-storage";
import { Workout, WorkoutExercise } from "@/types/workout";
import {Exercise, ExerciseWithSets} from "@/types/exercise";

/**
 * Fetch all workouts
 */
export const getWorkouts = async (): Promise<Workout[]> => {
    try {
        const data = await AsyncStorage.getItem("workouts");
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to fetch workouts:", error);
        return [];
    }
};

/**
 * Fetch a single workout by id
 */
export const getWorkoutById = async (id: string): Promise<Workout | null> => {
    const workouts = await getWorkouts();
    return workouts.find(w => w.id === id) || null;
};

/**
 * Save a new workout
 */
export const saveWorkout = async (workout: Workout) => {
    const workouts = await getWorkouts();
    workouts.push(workout);
    await AsyncStorage.setItem("workouts", JSON.stringify(workouts));
};

/**
 * Delete workout by id
 */
export const deleteWorkout = async (id: string) => {
    const workouts = await getWorkouts();
    const updated = workouts.filter(w => w.id !== id);
    await AsyncStorage.setItem("workouts", JSON.stringify(updated));
};

/**
 * Update workout exercises with sets
 */
export const updateWorkoutExercises = async (
    workoutId: string,
    exercisesWithSets: ExerciseWithSets[]
) => {
    const workouts = await getWorkouts();
    const index = workouts.findIndex(w => w.id === workoutId);
    if (index === -1) throw new Error("Workout not found");

    const updatedExercises: WorkoutExercise[] = workouts[index].exercises.map(we => {
        const ex = exercisesWithSets.find(e => e.id === we.exerciseId);
        return ex ? { ...we, sets: ex.sets } : we;
    });

    workouts[index] = { ...workouts[index], exercises: updatedExercises };
    await AsyncStorage.setItem("workouts", JSON.stringify(workouts));
};
