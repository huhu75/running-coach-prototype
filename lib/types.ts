export type ObjectiveType = 
  | "perte_poids"
  | "remise_forme"
  | "finir_distance"
  | "battre_chrono";

export type UserProfile = {
  level: "debutant" | "intermediaire" | "avance";
  levelDetails?: string; // Détails supplémentaires sur le niveau
  objectiveType: ObjectiveType;
  objectiveName: string;
  targetDate?: string;
  dureeSemaines: number;
  sessionsPerWeek: number;
  targetTime?: string; // Format: "HH:MM:SS" ou "MM:SS"
  targetDistance?: number; // en km
  availability: string;
  vma?: number; // Vitesse Maximale Aérobie en km/h
  fcMax?: number; // Fréquence Cardiaque Maximale
  allure5km?: string; // Format: "MM:SS" par km
  allure10km?: string; // Format: "MM:SS" par km
  douleurs?: string; // Douleurs ou antécédents médicaux
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
