import { UserProfile } from "../types";

export function buildGeneratePlanPrompt(profile: UserProfile): string {
  return `
    Tu es un **coach d'athlétisme expert**. Génère un **plan d'entraînement à la course à pied** sur **${profile.durationWeeks} semaines** pour un coureur de **niveau ${profile.level}** avec l'objectif suivant : **${profile.goal}**.

    **Contraintes** :
    - Disponibilités : **${profile.availability}** (ex: "lundi, mercredi, samedi").
    - Alterne les types de séances : **endurance**, **fractionné**, **seuil**, **repos**.
    - Volume progressif (+10% max/semaine).

    **Types de Séances** :
    - **Endurance** : 60-80% FC max, durée 30-60min, allure conversationnelle.
    - **Fractionné** : Ex: 8x400m à allure 10km, récup 1min.
    - **Seuil** : 20-30min à allure semi-marathon.
    - **Repos** : Jour sans entraînement.

    **Format de Sortie (JSON STRICT)** :
    \`\`\`json
    {
      "niveau": "${profile.level}",
      "objectif": "${profile.goal}",
      "duree_semaines": ${profile.durationWeeks},
      "semaines": [
        {
          "numero": 1,
          "objectif": "Adaptation",
          "workouts": [
            {
              "id": "week1_workout1",
              "jour": "lundi",
              "type": "endurance",
              "titre": "Endurance Fondamentale",
              "description": "40 min à allure lente (6:30-7:00/km).",
              "duree_minutes": 40,
              "distance_km": 6.5,
              "allure_kmh": 9.0,
              "intensite": "facile"
            },
            {
              "id": "week1_workout2",
              "jour": "mercredi",
              "type": "fractionne",
              "titre": "Fractionné Court",
              "description": "6x400m à 5:30/km (récup 1min).",
              "duree_minutes": 30,
              "distance_km": 4.0,
              "intensite": "elevee"
            },
            {
              "id": "week1_workout3",
              "jour": "samedi",
              "type": "endurance",
              "titre": "Endurance Longue",
              "description": "50 min à allure modérée (6:00-6:30/km).",
              "duree_minutes": 50,
              "distance_km": 8.0,
              "intensite": "moderee"
            }
          ]
        }
      ],
      "conseils": [
        "Écoute ton corps et ajuste l'allure si nécessaire.",
        "Hydrate-toi avant, pendant et après l'effort."
      ]
    }
    \`\`\`
    REPONDS **UNIQUEMENT** avec le JSON ci-dessus, **sans texte supplémentaire**.
  `;
}
