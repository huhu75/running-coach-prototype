"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Footprints } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { Button } from "./ui/button";

// Types pour les questions du chat
type ChatQuestion = {
  id: keyof UserProfile;
  question: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  options?: { value: string; label: string; disabled?: boolean }[];
  optional?: boolean;
  helpText?: string;
};

// Questions pour le chat
const getQuestions = (profile: Partial<UserProfile>): ChatQuestion[] => {
  const baseQuestions: ChatQuestion[] = [
    {
      id: "level",
      question: "Salut ! Pour bien adapter ton entraînement, quel est ton niveau actuel en course à pied ?",
      type: "select",
      options: [
        { value: "debutant", label: "Débutant - Je pars de zéro ou je veux alterner marche et course" },
        { value: "intermediaire", label: "Intermédiaire - Je cours déjà 30 à 45 minutes sans m'arrêter" },
        { value: "avance", label: "Avancé - Je cours régulièrement et je cherche la performance" },
      ],
    },
  ];

  // Si intermédiaire/avancé, demander VMA/FCMax/allure
  if (profile.level === "intermediaire" || profile.level === "avance") {
    baseQuestions.push({
      id: "vma",
      question: "Si tu as une montre cardio ou une application, connais-tu ta VMA (vitesse maximale aérobie en km/h) ?",
      type: "number",
      placeholder: "ex: 14, 16, 18",
      optional: true,
      helpText: "VMA = Vitesse à laquelle tu atteins ta consommation maximale d'oxygène. Si tu ne connais pas, laisse vide.",
    });

    baseQuestions.push({
      id: "fcMax",
      question: "Connais-tu ta FCMax (fréquence cardiaque maximale en bpm) ?",
      type: "number",
      placeholder: "ex: 180, 190",
      optional: true,
      helpText: "FCMax = Nombre maximal de battements de cœur par minute. Formule standard : 220 - âge.",
    });

    baseQuestions.push({
      id: "allure5km",
      question: "Quelle est ton allure moyenne sur 5 km ? (en min/km)",
      type: "text",
      placeholder: "ex: 5:30, 6:00",
      optional: true,
      helpText: "Format : MM:SS par km (ex: 5:30 signifie 5 minutes et 30 secondes par kilomètre).",
    });
  }

  // Objectif
  baseQuestions.push({
    id: "objectiveType",
    question: "Quel est l'objectif principal de ce programme ?",
    type: "select",
    options: [
      { value: "perte_poids", label: "Perte de poids" },
      { value: "remise_forme", label: "Se remettre en forme" },
      { value: "finir_distance", label: "Finir une distance (5k, 10k, Semi, Marathon)" },
      { value: "battre_chrono", label: "Battre un chrono" },
    ],
  });

  baseQuestions.push({
    id: "objectiveName",
    question: "Précise ton objectif : quelle distance ou quel chrono veux-tu atteindre ?",
    type: "text",
    placeholder: "ex: Marathon de Paris, 10km en 50min, 5km, Semi-marathon",
  });

  baseQuestions.push({
    id: "dureeSemaines",
    question: "Dans combien de semaines a lieu ton objectif ?",
    type: "number",
    placeholder: "Idéalement entre 6 et 12 semaines",
    helpText: "Recommandé : 6 à 12 semaines pour une progression optimale.",
  });

  // Contraintes
  baseQuestions.push({
    id: "sessionsPerWeek",
    question: "Combien de fois par semaine peux-tu aller courir ?",
    type: "select",
    options: [
      { value: "2", label: "2 séances/semaine", disabled: profile.level !== "debutant" },
      { value: "3", label: "3 séances/semaine" },
      { value: "4", label: "4 séances/semaine" },
      { value: "5", label: "5 séances/semaine" },
      { value: "6", label: "6 séances/semaine" },
    ],
    helpText: profile.level === "debutant" 
      ? "Pour éviter les blessures, nous te conseillons maximum 2-3 séances/semaine."
      : undefined,
  });

  baseQuestions.push({
    id: "availability",
    question: "Quels jours es-tu disponible pour t'entraîner ?",
    type: "text",
    placeholder: "ex: lundi, mercredi, samedi",
    helpText: "Sépare les jours par des virgules. Ex: lundi, mercredi, vendredi",
  });

  baseQuestions.push({
    id: "douleurs",
    question: "As-tu des douleurs actuelles (genoux, dos) ou des antécédents médicaux ?",
    type: "text",
    placeholder: "ex: Douleur au genou droit, ancienne entorse",
    optional: true,
    helpText: "Cela nous aidera à adapter ton entraînement pour éviter les blessures.",
  });

  return baseQuestions;
};

type ChatFormProps = {
  onComplete: (profile: UserProfile) => void;
  isLoading: boolean;
};

export default function ChatForm({ onComplete, isLoading }: ChatFormProps) {
  const [chatMessages, setChatMessages] = useState<{text: string; isUser: boolean; isQuestion?: boolean}[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatProfile, setChatProfile] = useState<Partial<UserProfile>>({});
  const [inputValue, setInputValue] = useState("");
  const [questions, setQuestions] = useState<ChatQuestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (chatMessages.length === 0) {
      askQuestionAtIndex(chatProfile, currentQuestionIndex);
    }
  }, []);

  const askQuestionAtIndex = (profile: Partial<UserProfile>, index: number) => {
    const currentQuestions = getQuestions(profile);
    setQuestions(currentQuestions);
    if (index < currentQuestions.length) {
      const question = currentQuestions[index];
      setChatMessages(prev => [...prev, {
        text: question.question,
        isUser: false,
        isQuestion: true
      }]);
      
      if (question.helpText) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            text: question.helpText,
            isUser: false,
            isQuestion: false
          }]);
        }, 500);
      }
    }
  };

  const askNextQuestion = () => {
    askQuestionAtIndex(chatProfile, currentQuestionIndex);
  };

  const handleRadioSelect = (value: string) => {
    setInputValue(value);
    // Pour les questions radio, soumettre automatiquement après que inputValue soit mis à jour
    setTimeout(() => {
      if (inputValue === value) {
        handleSubmit();
      }
    }, 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    const currentQuestions = getQuestions(chatProfile);
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Ajouter la réponse de l'utilisateur
    setChatMessages(prev => [...prev, {
      text: inputValue,
      isUser: true
    }]);

    // Stocker la réponse
    let newChatProfile = { ...chatProfile };
    
    if (currentQuestion.type === "number") {
      newChatProfile = { ...newChatProfile, [currentQuestion.id]: inputValue ? Number(inputValue) : undefined };
    } else if (currentQuestion.type === "select") {
      newChatProfile = { ...newChatProfile, [currentQuestion.id]: inputValue };
    } else {
      newChatProfile = { ...newChatProfile, [currentQuestion.id]: inputValue || undefined };
    }
    
    setChatProfile(newChatProfile);
    setInputValue("");

    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    const updatedQuestions = getQuestions(newChatProfile);
    
    if (nextIndex < updatedQuestions.length) {
      setTimeout(() => {
        askQuestionAtIndex(newChatProfile, nextIndex);
      }, 500);
    } else {
      setTimeout(() => {
        const finalProfile: UserProfile = {
          level: (newChatProfile.level as UserProfile["level"]) || "debutant",
          levelDetails: newChatProfile.levelDetails || undefined,
          objectiveType: (newChatProfile.objectiveType as UserProfile["objectiveType"]) || "remise_forme",
          objectiveName: newChatProfile.objectiveName || "Courir 5 km",
          dureeSemaines: newChatProfile.dureeSemaines || 8,
          sessionsPerWeek: newChatProfile.sessionsPerWeek || 3,
          targetTime: newChatProfile.targetTime || "",
          targetDistance: newChatProfile.targetDistance || undefined,
          availability: newChatProfile.availability || "lundi, mercredi, samedi",
          vma: newChatProfile.vma || undefined,
          fcMax: newChatProfile.fcMax || undefined,
          allure5km: newChatProfile.allure5km || undefined,
          allure10km: newChatProfile.allure10km || undefined,
          douleurs: newChatProfile.douleurs || undefined,
        };
        onComplete(finalProfile);
      }, 1000);
    }
  };

  // Gestion du champ de détails pour le niveau
  const handleLevelDetailsChange = (value: string) => {
    setChatProfile({...chatProfile, levelDetails: value});
  };

  const goBack = () => {
    if (currentQuestionIndex <= 0) return;
    
    setChatMessages(prev => {
      const newMessages = prev.slice(0, -1);
      if (newMessages[newMessages.length - 1]?.isQuestion) {
        return newMessages.slice(0, -1);
      }
      return newMessages;
    });
    
    const prevIndex = currentQuestionIndex - 1;
    
    const prevQuestion = getQuestions(chatProfile)[prevIndex];
    if (prevQuestion) {
      const newProfile = { ...chatProfile };
      delete newProfile[prevQuestion.id];
      setChatProfile(newProfile);
      setInputValue("");
      setCurrentQuestionIndex(prevIndex);
      
      setTimeout(() => {
        askQuestionAtIndex(newProfile, prevIndex);
      }, 100);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-200/50"
    >
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Footprints className="h-8 w-8 text-indigo-500" />
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Ton coach personnalisé
            </h2>
            <p className="text-slate-500 mt-1">
              Réponds à mes questions pour créer ton plan d'entraînement sur mesure.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
        {chatMessages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-2xl px-4 py-3 ${
                message.isUser
                  ? "bg-indigo-500 text-white rounded-br-sm"
                  : message.isQuestion
                    ? "bg-slate-100 text-slate-800 rounded-bl-sm font-medium"
                    : "bg-slate-200/60 text-slate-600 rounded-bl-sm text-sm"
              }`}
            >
              <p className="text-sm md:text-base">{message.text}</p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {currentQuestion && currentQuestionIndex < questions.length ? (
        <div className="space-y-4">
          {/* Question de niveau avec radio buttons + champ détails */}
          {currentQuestion.id === "level" && currentQuestion.type === "select" && currentQuestion.options ? (
            <div className="space-y-4">
              <div className="grid gap-3">
                {currentQuestion.options.map((opt) => (
                  <motion.label
                    key={opt.value}
                    className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      inputValue === opt.value
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                        : "border-slate-200 bg-slate-50/50 hover:border-indigo-300"
                    } ${opt.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={opt.value}
                      checked={inputValue === opt.value}
                      onChange={() => handleRadioSelect(opt.value)}
                      disabled={opt.disabled || isLoading}
                      className="sr-only"
                    />
                    <p className="font-medium text-slate-800">{opt.label}</p>
                  </motion.label>
                ))}
              </div>
              <div className="relative">
                <textarea
                  value={chatProfile.levelDetails || ""}
                  onChange={(e) => {
                    setChatProfile({...chatProfile, levelDetails: e.target.value});
                  }}
                  placeholder="Ajoute des détails sur ton niveau (optionnel)"
                  rows={2}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 disabled:opacity-50 resize-none"
                />
              </div>
            </div>
          ) : currentQuestion.type === "select" && currentQuestion.options ? (
            <div className="grid gap-3">
              {currentQuestion.options.map((opt) => (
                <motion.label
                  key={opt.value}
                  className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    inputValue === opt.value
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-slate-50/50 hover:border-indigo-300"
                  } ${opt.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={opt.value}
                    checked={inputValue === opt.value}
                    onChange={() => handleRadioSelect(opt.value)}
                    disabled={opt.disabled || isLoading}
                    className="sr-only"
                  />
                  <p className="font-medium text-slate-800">{opt.label}</p>
                  {opt.disabled && (
                    <p className="text-sm text-slate-400 mt-1">
                      Non recommandé pour ton niveau
                    </p>
                  )}
                </motion.label>
              ))}
            </div>
          ) : (
            <div className="relative">
              {currentQuestion.type === "number" ? (
                <div className="relative">
                  <input
                    type="number"
                    min={currentQuestion.id === "dureeSemaines" ? 4 : undefined}
                    max={currentQuestion.id === "dureeSemaines" ? 24 : undefined}
                    step={currentQuestion.id === "vma" || currentQuestion.id === "fcMax" ? 1 : undefined}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder={currentQuestion.placeholder}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 disabled:opacity-50"
                  />
                  {currentQuestion.id === "dureeSemaines" && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      semaines
                    </span>
                  )}
                  {currentQuestion.id === "vma" && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      km/h
                    </span>
                  )}
                  {currentQuestion.id === "fcMax" && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      bpm
                    </span>
                  )}
                </div>
              ) : (
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder={currentQuestion.placeholder}
                  rows={currentQuestion.id === "douleurs" ? 3 : 2}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 disabled:opacity-50 resize-none"
                />
              )}
            </div>
          )}
          
          <div className="flex gap-3">
            {currentQuestionIndex > 0 && (
              <Button
                variant="outline"
                onClick={goBack}
                disabled={isLoading}
                className="flex-1 text-slate-600 hover:text-indigo-600"
              >
                ← Retour
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isLoading}
              size="lg"
              className={`flex-1 ${currentQuestionIndex > 0 ? '' : 'w-full'}`}
            >
              <Send className="h-5 w-5 mr-2" />
              {currentQuestionIndex < questions.length - 1 ? "Suivant" : isLoading ? "Génération..." : "Générer mon plan"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"
          />
        </div>
      )}
    </motion.div>
  );
}
