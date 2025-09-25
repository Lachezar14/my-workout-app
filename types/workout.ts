import { ExerciseWithSets } from "./exercise";

export type WorkoutExercise = {
    exerciseId: string;
    sets: { reps: string }[];
};

export type Workout = {
    id: string;
    name: string;
    exercises: WorkoutExercise[];
};

