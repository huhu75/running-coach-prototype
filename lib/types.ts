export type UserProfile = {
  level: "debutant" | "intermediaire" | "avance";
  objectiveName: string;
  targetDate: string;
  sessionsPerWeek: number;
  targetTime?: string; // Format: "HH:MM:SS" ou "MM:SS"
  targetDistance?: number; // en km
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
  date_objectif: string;
  nom_objectif: string;
  seances_par_semaine: number;
  temps_cible?: string;
  distance_cible?: number;
  duree_semaines: number;
  semaines: Week[];
  conseils: string[];
};
