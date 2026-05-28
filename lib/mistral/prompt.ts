import { UserProfile } from "../types";

function formatDateForPrompt(dateStr: string): string {
  if (!dateStr) return "non spécifiée";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

export function buildGeneratePlanPrompt(profile: UserProfile): string {
  const targetDate = formatDateForPrompt(profile.targetDate);
  
  // Construire la description de l'objectif
  let objectiveDescription = `Nom de l'objectif: ${profile.objectiveName}`;
  if (profile.targetDistance && profile.targetTime) {
    objectiveDescription += `\n- Distance cible: ${profile.targetDistance} km`;
    objectiveDescription += `\n- Temps cible: ${profile.targetTime}`;
  } else if (profile.targetDistance) {
    objectiveDescription += `\n- Distance cible: ${profile.targetDistance} km`;
  } else if (profile.targetTime) {
    objectiveDescription += `\n- Temps cible: ${profile.targetTime}`;
  }
  
  // Calculer la durée en semaines à partir de la date
  const durationWeeks = profile.targetDate ? 
    Math.ceil((new Date(profile.targetDate).getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000)) : 8;

  return `
    Tu es un **coach d'athlétisme expert**. Génère un **plan d'entraînement à la course à pied** personnalisé.

    **Profil du coureur** :
    - Niveau : **${profile.level}**
    - Objectif : **${objectiveDescription}**
    - Date d'objectif : **${targetDate}**
    - Nombre de séances par semaine : **${profile.sessionsPerWeek}**
    - Jours disponibles : **${profile.availability}**

    **Contraintes** :
    - Le plan doit durer environ **${durationWeeks > 0 ? durationWeeks : 8} semaines** (jusqu'à la date objectif).
    - Prévoir exactement **${profile.sessionsPerWeek} séances par semaine** sur les jours disponibles.
    - Alterne les types de séances : **endurance**, **fractionné**, **seuil**, **repos**.
    - Volume progressif (+10% max/semaine).
    - Si un temps cible est spécifié, adapte les allures pour atteindre cet objectif.
    - Si une distance cible est spécifiée, envoie un plan progressif vers cette distance.

    **Types de Séances** :
    - **Endurance** : 60-80% FC max, durée 30-60min, allure conversationnelle.
    - **Fractionné** : Ex: 8x400m à allure 10km, récup 1min.
    - **Seuil** : 20-30min à allure semi-marathon.
    - **Repos** : Jour sans entraînement.

    **Format de Sortie (JSON STRICT)** :
    \`\`\`json
    {
      "niveau": "${profile.level}",
      "objectif": "${profile.objectiveName}",
      "nom_objectif": "${profile.objectiveName}",
      "date_objectif": "${profile.targetDate || ''}",
      "seances_par_semaine": ${profile.sessionsPerWeek},
      ${profile.targetTime ? `"temps_cible": "${profile.targetTime}",` : ''}
      ${profile.targetDistance ? `"distance_cible": ${profile.targetDistance},` : ''}
      "duree_semaines": ${durationWeeks > 0 ? durationWeeks : 8},
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
    REPONDS **UNIQUEMENT** avec le JSON valide ci-dessus, **sans texte supplémentaire**, **sans commentaires**, **sans explications**.
    Le JSON doit être parsable directement.
  `;
}
