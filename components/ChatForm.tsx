"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Footprints, Calendar, Target, Clock } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { Button } from "./ui/button";

// Types pour les questions du chat
type ChatQuestion = {
  id: keyof UserProfile;
  question: string;
  type: "text" | "number" | "date" | "select";
  placeholder: string;
  options?: { value: string; label: string }[];
  optional?: boolean;
};

// Questions pour le chat
const chatQuestions: ChatQuestion[] = [
  {
    id: "level",
    question: "Quel est ton niveau actuel en course à pied ?",
    type: "select",
    options: [
      { value: "debutant", label: "Débutant (0-10 km/semaine)" },
      { value: "intermediaire", label: "Intermédiaire (10-30 km/semaine)" },
      { value: "avance", label: "Avancé (30+ km/semaine)" },
    ],
    placeholder: "Choisis ton niveau...",
  },
  {
    id: "objectiveName",
    question: "Quel est ton objectif principal ? (ex: Marathon de Paris, 5km en 25 min, 10km, etc.)",
    type: "text",
    placeholder: "ex: Marathon de Paris 2025, 5km en moins de 25 minutes...",
  },
  {
    id: "targetDate",
    question: "Quelle est ta date d'objectif ?",
    type: "date",
    placeholder: "",
  },
  {
    id: "sessionsPerWeek",
    question: "Combien de séances par semaine peux-tu faire ?",
    type: "select",
    options: [
      { value: "2", label: "2 séances/semaine" },
      { value: "3", label: "3 séances/semaine" },
      { value: "4", label: "4 séances/semaine" },
      { value: "5", label: "5 séances/semaine" },
      { value: "6", label: "6 séances/semaine" },
    ],
    placeholder: "Sélectionne un nombre...",
  },
  {
    id: "targetDistance",
    question: "Quelle distance veux-tu atteindre ? (en km, optionnel)",
    type: "number",
    placeholder: "ex: 5, 10, 21.1, 42.2",
    optional: true,
  },
  {
    id: "targetTime",
    question: "Quel temps vise-tu ? (format MM:SS ou HH:MM:SS, optionnel)",
    type: "text",
    placeholder: "ex: 25:00, 1:30:00",
    optional: true,
  },
  {
    id: "availability",
    question: "Quels jours es-tu disponible pour t'entraîner ?",
    type: "text",
    placeholder: "ex: lundi, mercredi, samedi",
  },
];

type ChatFormProps = {
  onComplete: (profile: UserProfile) => void;
  isLoading: boolean;
  onBack?: () => void;
};

export default function ChatForm({ onComplete, isLoading, onBack }: ChatFormProps) {
  const [chatMessages, setChatMessages] = useState<{text: string, isUser: boolean, isQuestion?: boolean}[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatProfile, setChatProfile] = useState<Partial<UserProfile>>({});
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Faire défiler vers le bas du chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initialiser le chat avec la première question
  useEffect(() => {
    if (chatMessages.length === 0) {
      askNextQuestion();
    }
  }, []);

  const askNextQuestion = () => {
    if (currentQuestionIndex < chatQuestions.length) {
      const question = chatQuestions[currentQuestionIndex];
      setChatMessages(prev => [...prev, {
        text: question.question,
        isUser: false,
        isQuestion: true
      }]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim() || currentQuestionIndex >= chatQuestions.length) return;

    const currentQuestion = chatQuestions[currentQuestionIndex];
    
    // Ajouter la réponse de l'utilisateur
    setChatMessages(prev => [...prev, {
      text: inputValue,
      isUser: true
    }]);

    // Stocker la réponse
    let newChatProfile = { ...chatProfile };
    
    if (currentQuestion.id === "targetDistance") {
      newChatProfile = { ...newChatProfile, [currentQuestion.id]: inputValue ? Number(inputValue) : undefined };
    } else if (currentQuestion.type === "number") {
      newChatProfile = { ...newChatProfile, [currentQuestion.id]: inputValue ? Number(inputValue) : undefined };
    } else if (currentQuestion.type === "date") {
      newChatProfile = { ...newChatProfile, [currentQuestion.id]: inputValue };
    } else if (currentQuestion.type === "select") {
      newChatProfile = { ...newChatProfile, [currentQuestion.id]: inputValue };
    } else {
      newChatProfile = { ...newChatProfile, [currentQuestion.id]: inputValue };
    }
    
    setChatProfile(newChatProfile);
    setInputValue("");

    // Passer à la question suivante ou générer le plan
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    if (nextIndex < chatQuestions.length) {
      // Poser la prochaine question après un court délai
      setTimeout(() => askNextQuestion(), 500);
    } else {
      // Toutes les questions sont répondues, générer le plan
      setTimeout(() => {
        // Fusionner avec les valeurs par défaut
        const finalProfile: UserProfile = {
          level: (newChatProfile.level as UserProfile["level"]) || "debutant",
          objectiveName: newChatProfile.objectiveName || "Courir 5 km",
          targetDate: newChatProfile.targetDate || new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sessionsPerWeek: newChatProfile.sessionsPerWeek || 3,
          targetTime: newChatProfile.targetTime || "",
          targetDistance: newChatProfile.targetDistance || undefined,
          availability: newChatProfile.availability || "lundi, mercredi, samedi",
        };
        onComplete(finalProfile);
      }, 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-200/50"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Discutons de ton plan
            </h2>
            <p className="text-slate-500 mt-2">
              Réponds à mes questions pour créer ton plan personnalisé.
            </p>
          </div>
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="text-slate-600"
            >
              Retour au formulaire
            </Button>
          )}
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
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              <p className="text-sm md:text-base">{message.text}</p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {currentQuestionIndex < chatQuestions.length ? (
        <div className="space-y-4">
          <div className="relative">
            {chatQuestions[currentQuestionIndex].type === "select" ? (
              <select
                value={inputValue}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full p-4 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 disabled:opacity-50"
              >
                <option value="" disabled>
                  {chatQuestions[currentQuestionIndex].placeholder}
                </option>
                {chatQuestions[currentQuestionIndex].options?.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : chatQuestions[currentQuestionIndex].type === "date" ? (
              <input
                type="date"
                value={inputValue}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                disabled={isLoading}
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 disabled:opacity-50"
              />
            ) : chatQuestions[currentQuestionIndex].type === "number" ? (
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={42}
                  step={0.5}
                  value={inputValue}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder={chatQuestions[currentQuestionIndex].placeholder}
                  className="w-full p-4 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 disabled:opacity-50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  km
                </span>
              </div>
            ) : (
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={chatQuestions[currentQuestionIndex].placeholder}
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 disabled:opacity-50"
              />
            )}
          </div>
          
          <div className="flex gap-3">
            {currentQuestionIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setChatMessages(prev => prev.slice(0, -1));
                  setCurrentQuestionIndex(prev => prev - 1);
                  setInputValue("");
                }}
                disabled={isLoading}
                className="flex-1"
              >
                Retour
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isLoading}
              size="lg"
              className={`flex-1 ${currentQuestionIndex > 0 ? '' : 'w-full'}`}
            >
              <Send className="h-5 w-5 mr-2" />
              {currentQuestionIndex < chatQuestions.length - 1 ? "Suivant" : isLoading ? "Génération..." : "Générer mon plan"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
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
