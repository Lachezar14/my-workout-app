import { ExerciseWithSets } from "./exercise";

export type WorkoutExercise = {
    exerciseId: string;
    sets: { reps: string, kgs?: string }[];
    order: number;
};

export type Workout = {
    id: string;
    name: string;
    exercises: WorkoutExercise[];
};

