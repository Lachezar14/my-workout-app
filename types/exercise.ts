export type Set = {
    reps: string;
    kgs; string;
};

export type ExerciseWithSets = {
    id: string;
    name: string;
    image_url?: string;
    sets: Set[];
};

export type Exercise = {
    id: string;
    name: string;
    description: string;
    image_url?: string;
};
