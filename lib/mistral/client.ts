import Mistral from "@mistralai/mistralai";
import { buildGeneratePlanPrompt } from "./prompt";
import { UserProfile, TrainingPlan } from "../types";
import { v4 as uuidv4 } from "uuid";

export async function generateTrainingPlan(
  profile: UserProfile
): Promise<TrainingPlan> {
  const mistral = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY!,
  });

  const prompt = buildGeneratePlanPrompt(profile);
  const response = await mistral.chat({
    model: "mistral-medium",
    messages: [{ role: "user", content: prompt }],
    responseFormat: { type: "json_object" },
    temperature: 0.3,
  });

  const plan = JSON.parse(response.choices[0].message.content) as Omit<TrainingPlan, "id">;
  return { ...plan, id: uuidv4() };
}
