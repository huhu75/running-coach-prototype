import Mistral from "@mistralai/mistralai";
import { buildGeneratePlanPrompt } from "./prompt";
import { UserProfile, TrainingPlan } from "../types";
import { v4 as uuidv4 } from "uuid";

export async function generateTrainingPlan(
  profile: UserProfile
): Promise<TrainingPlan> {
  const apiKey = process.env.MISTRAL_API_KEY;
  
  if (!apiKey || apiKey === "") {
    throw new Error("MISTRAL_API_KEY non configurée. Ajoutez-la dans votre fichier .env.local");
  }

  const mistral = new Mistral(apiKey);

  const prompt = buildGeneratePlanPrompt(profile);
  
  try {
    const response = await mistral.chat({
      model: "mistral-medium",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const responseContent = response.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("Aucune réponse reçue de l'API Mistral");
    }

    // Nettoyer la réponse pour s'assurer qu'elle est valide JSON
    let jsonContent = responseContent.trim();
    
    // Retirer les backticks et le format markdown si présent
    jsonContent = jsonContent.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const plan = JSON.parse(jsonContent) as Omit<TrainingPlan, "id">;
    
    // Valider que les champs requis sont présents
    if (!plan.niveau || !plan.objectif || !plan.semaines) {
      throw new Error("La réponse de l'API ne contient pas les champs requis");
    }

    return { ...plan, id: uuidv4() };
  } catch (error: any) {
    console.error("Erreur lors de la génération du plan:", error);
    throw new Error(`Échec de la génération du plan: ${error.message}`);
  }
}
