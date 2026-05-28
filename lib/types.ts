export type UserProfile = {
  level: "debutant" | "intermediaire" | "avance";
  goal: string;
  durationWeeks: number;
  availability: string;
};

export type Workout = {
  id: string;
  jour: string;
  type: "endurance" | "fractionne" | "seuil" | "repos";
  titre: string;
  description: string;
  duree_minutes: number;
  distance_km?: number;
  allure_kmh?: number;
  intensite: "facile" | "moderee" | "elevee";
};

export type Week = {
  numero: number;
  objectif: string;
  workouts: Workout[];
};

export type TrainingPlan = {
  id: string;
  niveau: string;
  objectif: string;
  duree_semaines: number;
  semaines: Week[];
  conseils: string[];
};
