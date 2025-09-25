export type Set = {
    reps: string;
};

export type ExerciseWithSets = {
    id: string;
    name: string;
    image?: string;
    sets: Set[];
};

export type Exercise = {
    id: string;
    name: string;
    description: string;
    image?: string;
};
