import { UserProfile, ObjectiveType } from "../types";

// Logique de calcul automatique pour le bot
function getBotCalculations(profile: Partial<UserProfile>): {
  volumeDepartKm: number;
  volumeDepartMinutes: number;
  progressionRule: string;
  dischargeWeeks: number[];
  workoutDistribution: string;
} {
  // Valeurs par défaut
  const sessionsPerWeek = profile.sessionsPerWeek || 3;
  const dureeSemaines = profile.dureeSemaines || 8;
  const level = profile.level || "debutant";
  
  // Déterminer le volume de départ basé sur le niveau
  let volumeDepartKm: number;
  let volumeDepartMinutes: number;
  
  switch (level) {
    case "debutant":
      // Débutant : séances de 20-30 min, alternance marche/course
      volumeDepartKm = 0; // On part de 0 ou très peu
      volumeDepartMinutes = sessionsPerWeek * 25; // 25 min par séance
      break;
    case "intermediaire":
      // Intermédiaire : 30-45 min sans s'arrêter
      // Estimation : 3 séances de 40 min = 2h = ~20-25 km/semaine
      volumeDepartKm = 20;
      volumeDepartMinutes = sessionsPerWeek * 40;
      break;
    case "avance":
      // Avancé : 30+ km/semaine
      volumeDepartKm = 35;
      volumeDepartMinutes = sessionsPerWeek * 50;
      break;
    default:
      volumeDepartKm = 0;
      volumeDepartMinutes = sessionsPerWeek * 25;
  }
  
  // Règle des +10%
  const progressionRule = "Augmentation maximale de 10% du volume total (km ou temps) par semaine pour éviter les blessures.";
  
  // Semaines de décharge (toutes les 4 semaines)
  const dischargeWeeks: number[] = [];
  for (let i = 4; i <= dureeSemaines; i += 4) {
    dischargeWeeks.push(i);
  }
  
  // Répartition des séances
  let workoutDistribution = "";
  switch (profile.sessionsPerWeek) {
    case 2:
      workoutDistribution = "1 séance d'endurance fondamentale + 1 sortie longue";
      break;
    case 3:
      workoutDistribution = "1 séance d'endurance fondamentale (EF) + 1 séance de fractionné court + 1 sortie longue";
      break;
    case 4:
      workoutDistribution = "2 séances d'endurance (1 fondamentale, 1 active) + 1 séance de fractionné + 1 sortie longue";
      break;
    case 5:
      workoutDistribution = "2 séances d'endurance + 1 séance de fractionné + 1 séance de seuil + 1 sortie longue";
      break;
    case 6:
      workoutDistribution = "3 séances d'endurance (dont 1 longue) + 2 séances de fractionné/seuil + 1 sortie très longue";
      break;
    default:
      workoutDistribution = "Répartition équilibrée entre endurance, fractionné et seuil";
  }
  
  return {
    volumeDepartKm,
    volumeDepartMinutes,
    progressionRule,
    dischargeWeeks,
    workoutDistribution
  };
}

function getObjectiveDescription(objectiveType: ObjectiveType | undefined, objectiveName: string | undefined): string {
  const type = objectiveType || "remise_forme";
  const name = objectiveName || "Courir 5 km";
  
  switch (type) {
    case "perte_poids":
      return `Objectif : Perte de poids. Focus sur l'endurance fondamentale et la régularité.`;
    case "remise_forme":
      return `Objectif : Remise en forme. Progression douce avec alternance marche/course si débutant.`;
    case "finir_distance":
      return `Objectif : Finir une distance (${name}). Plan progressif pour atteindre la distance cible.`;
    case "battre_chrono":
      return `Objectif : Battre un chrono (${name}). Intégration de séances de fractionné et de seuil.`;
    default:
      return `Objectif : ${name}`;
  }
}

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
  // Calculations automatiques
  const calculations = getBotCalculations(profile);
  const targetDate = profile.targetDate ? formatDateForPrompt(profile.targetDate) : "non spécifiée";
  const objectiveDescription = getObjectiveDescription(profile.objectiveType, profile.objectiveName);

  // Extraire distance et temps cible de l'objectif
  let targetDistance: number | undefined;
  let targetTime: string | undefined;
  
  // Essayer de parser l'objectif pour extraire distance et temps
  const objectiveLower = profile.objectiveName.toLowerCase();
  
  // Extraire distance (5k, 10k, 21km, 42km, etc.)
  const distanceMatch = objectiveLower.match(/(\d+(?:\.\d+)?)\s*(?:km|kilomètre|kilomètres)/i);
  if (distanceMatch) {
    targetDistance = parseFloat(distanceMatch[1]);
  }
  
  // Extraire temps (25min, 50:00, 1:30:00, etc.)
  const timeMatch = objectiveLower.match(/(\d+(?::\d{2}){1,2})\s*(?:min|minutes)?/i);
  if (timeMatch) {
    targetTime = timeMatch[1];
  }

  // Construire les informations du profil
  const profileInfo = [
    `Niveau : **${profile.level}**`,
    `Type d'objectif : **${profile.objectiveType}**`,
    `Objectif : **${profile.objectiveName}**`,
    `Durée du programme : **${profile.dureeSemaines} semaines**`,
    `Séances par semaine : **${profile.sessionsPerWeek}**`,
    `Jours disponibles : **${profile.availability}**`,
  ];
  
  // Ajouter les métriques si disponibles
  if (profile.vma) {
    profileInfo.push(`VMA : **${profile.vma} km/h**`);
  }
  if (profile.fcMax) {
    profileInfo.push(`FC Max : **${profile.fcMax} bpm**`);
  }
  if (profile.allure5km) {
    profileInfo.push(`Allure sur 5km : **${profile.allure5km}/km**`);
  }
  if (targetDistance) {
    profileInfo.push(`Distance cible : **${targetDistance} km**`);
  }
  if (targetTime) {
    profileInfo.push(`Temps cible : **${targetTime}**`);
  }
  if (profile.levelDetails) {
    profileInfo.push(`Détails niveau : **${profile.levelDetails}**`);
  }
  if (profile.douleurs) {
    profileInfo.push(`⚠️  Contraintes : **${profile.douleurs}** (à prendre en compte)`);
  }

  // Contraintes de volume
  const volumeConstraints = [
    `Volume de départ : **${calculations.volumeDepartKm} km/semaine** (${calculations.volumeDepartMinutes} minutes total)`,
    `Progression : **${calculations.progressionRule}**`,
    `Semaines de décharge : **semaine ${calculations.dischargeWeeks.join(', semaine ')}**`,
    `Répartition : **${calculations.workoutDistribution}**`,
  ];

  return `
    Tu es un **coach d'athlétisme expert**. Génère un **plan d'entraînement à la course à pied** personnalisé.

    **${objectiveDescription}**

    **Profil du coureur** :
    ${profileInfo.map(info => `- ${info}`).join('\n    ')}

    **Contraintes et logique de calcul** :
    ${volumeConstraints.map(c => `- ${c}`).join('\n    ')}

    **Règles à respecter impérativement** :
    - Le plan DOIT durer exactement **${profile.dureeSemaines} semaines**.
    - Prévoir exactement **${profile.sessionsPerWeek} séances par semaine** sur les jours disponibles : **${profile.availability}**.
    - **Semaine 1** : Volume de départ = ${calculations.volumeDepartKm} km ou ${calculations.volumeDepartMinutes} minutes.
    - **Progression** : Augmenter le volume total de MAXIMUM 10% par semaine (calculer semaine par semaine).
    - **Semaines de décharge** : À chaque semaine ${calculations.dischargeWeeks.join(', ')} (et multiples de 4), REDUIRE le volume de 20-30% par rapport à la semaine précédente.
    - **Répartition des types** : ${calculations.workoutDistribution}
    - Si des douleurs sont mentionnées (${profile.douleurs ? 'oui' : 'non'}), adapter les exercices pour éviter d'aggraver ces zones.

    **Types de Séances (à alterner intelligemment)** :
    - **Endurance Fondamentale (EF)** : 60-70% FC max, durée 30-60min, allure conversationnelle (on peut parler facilement).
    - **Endurance Active** : 70-80% FC max, allure un peu plus soutenue.
    - **Fractionné Court** : Ex: 6x400m, 8x300m à allure 10km, récupération = temps d'effort. Pour débutants : 30/30.
    - **Fractionné Long** : Ex: 5x1000m à allure semi-marathon, récup 2-3min.
    - **Seuil** : 20-30min à allure semi-marathon (85-90% FC max).
    - **Sortie Longue** : 60-90min (débutant) à 120+ min (avancé) à allure endurance fondamentale.
    - **Repos** : Jour sans entraînement ou activité très légère (marche, étirements).

    **Adaptation selon le niveau** :
    - **Débutant** : Beaucoup d'alternance marche/course, progression très douce, max 3 séances/semaine.
    - **Intermédiaire** : Séances de 40-60min, introduction du fractionné court.
    - **Avancé** : Séances de seuil, fractionné long, sorties longues de 1h30+.

    **Format de Sortie (JSON STRICT)** :
    \`\`\`json
    {
      "niveau": "${profile.level}",
      "objectif": "${profile.objectiveName}",
      "type_objectif": "${profile.objectiveType}",
      "nom_objectif": "${profile.objectiveName}",
      "date_objectif": "${profile.targetDate || ''}",
      "duree_semaines": ${profile.dureeSemaines},
      "seances_par_semaine": ${profile.sessionsPerWeek},
      "volume_depart_km": ${calculations.volumeDepartKm},
      "volume_depart_minutes": ${calculations.volumeDepartMinutes},
      ${targetDistance ? `"distance_cible": ${targetDistance},` : ''}
      ${targetTime ? `"temps_cible": "${targetTime}",` : ''}
      ${profile.vma ? `"vma": ${profile.vma},` : ''}
      ${profile.fcMax ? `"fc_max": ${profile.fcMax},` : ''}
      ${profile.allure5km ? `"allure_5km": "${profile.allure5km}/km",` : ''}
      "semaines": [
        {
          "numero": 1,
          "objectif": "Semaine d'adaptation",
          "volume_total_km": ${calculations.volumeDepartKm},
          "volume_total_minutes": ${calculations.volumeDepartMinutes},
          "est_décharge": ${calculations.dischargeWeeks.includes(1) ? 'true' : 'false'},
          "workouts": [
            {
              "id": "week1_workout1",
              "jour": "${profile.availability.split(',')[0]?.trim() || 'lundi'}",
              "type": "endurance",
              "titre": "Endurance Fondamentale",
              "description": "Séance d'adaptation, allure très confortable",
              "duree_minutes": ${Math.floor(calculations.volumeDepartMinutes / profile.sessionsPerWeek)},
              "distance_km": ${(calculations.volumeDepartKm / profile.sessionsPerWeek).toFixed(1)},
              "allure_kmh": ${profile.level === 'debutant' ? '8.0' : profile.level === 'intermediaire' ? '9.0' : '10.0'},
              "intensite": "facile"
            }
          ]
        }
      ],
      "conseils": [
        "Écoute ton corps et ajuste l'allure si nécessaire.",
        "Hydrate-toi avant, pendant et après l'effort.",
        "Respecte les semaines de décharge pour éviter le surentraînement.",
        "La règle des 10% est impérative : ne dépasse jamais cette progression."
        ${profile.douleurs ? `, "Attention : ${profile.douleurs}. Adapte tes mouvements et arrête en cas de douleur."` : ''}
      ]
    }
    \`\`\`
    REPONDS **UNIQUEMENT** avec le JSON valide ci-dessus, **sans texte supplémentaire**, **sans commentaires**, **sans explications**.
    Le JSON doit être parsable directement. Vérifie que tous les champs sont présents et valides.
  `;
}
