import { Mistral } from "@mistralai/mistralai";
import { buildGeneratePlanPrompt } from "./prompt";
import { UserProfile, TrainingPlan } from "../types";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// Schema de validation pour Workout
const WorkoutSchema = z.object({
  id: z.string(),
  jour: z.string(),
  type: z.enum(["endurance", "fractionne", "seuil", "repos"]),
  titre: z.string(),
  description: z.string(),
  duree_minutes: z.number(),
  distance_km: z.number().optional(),
  allure_kmh: z.number().optional(),
  intensite: z.enum(["facile", "moderee", "elevee"]),
});

// Schema de validation pour Week
const WeekSchema = z.object({
  numero: z.number(),
  objectif: z.string(),
  workouts: z.array(WorkoutSchema),
});

// Schema de validation complet pour TrainingPlan
const TrainingPlanSchema = z.object({
  niveau: z.string(),
  objectif: z.string(),
  nom_objectif: z.string(),
  date_objectif: z.string(),
  seances_par_semaine: z.number(),
  temps_cible: z.string().optional(),
  distance_cible: z.number().optional(),
  duree_semaines: z.number(),
  semaines: z.array(WeekSchema),
  conseils: z.array(z.string()),
});

export async function generateTrainingPlan(
  profile: UserProfile
): Promise<TrainingPlan> {
  const apiKey = process.env.MISTRAL_API_KEY;
  
  // Vérification améliorée de la clé API
  if (!apiKey?.trim() || apiKey === "ta_clé_api_mistral_ici") {
    throw new Error("MISTRAL_API_KEY non configurée ou invalide. Ajoutez une clé valide dans votre fichier .env.local");
  }

  const client = new Mistral({ apiKey });

  const prompt = buildGeneratePlanPrompt(profile);
  
  try {
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      responseFormat: { type: "json_object" },
    });

    const responseContent = response.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("Aucune réponse reçue de l'API Mistral");
    }

    // Nettoyer la réponse pour s'assurer qu'elle est valide JSON
    // Le content peut être une string ou un tableau de chunks, on le convertit en string
    const contentString = typeof responseContent === 'string' 
      ? responseContent 
      : Array.isArray(responseContent) 
        ? responseContent.map(chunk => {
            if (typeof chunk === 'string') return chunk;
            if (typeof chunk === 'object' && chunk !== null) {
              // @ts-ignore - Accès dynamique aux propriétés du chunk
              return chunk.text || chunk.content || '';
            }
            return '';
          }).join('')
        : String(responseContent);
    
    let jsonContent = contentString.trim();
    
    // Retirer les backticks et le format markdown si présent
    jsonContent = jsonContent.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const rawPlan = JSON.parse(jsonContent);
    
    // Valider avec Zod
    const plan = TrainingPlanSchema.parse(rawPlan);
    
    return { ...plan, id: uuidv4() };
  } catch (error: any) {
    console.error("Erreur lors de la génération du plan:", error);
    
    // Améliorer le message d'erreur
    if (error instanceof z.ZodError) {
      throw new Error(`La réponse de l'API ne contient pas tous les champs requis: ${error.errors.map(e => e.path.join('.')).join(', ')}`);
    }
    
    throw new Error(`Échec de la génération du plan: ${error.message}`);
  }
}
