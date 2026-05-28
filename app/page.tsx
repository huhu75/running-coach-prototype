"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Footprints, Calendar, Target, Clock, Sparkles } from "lucide-react";
import { UserProfile } from "@/lib/types";
import Navbar from "@/components/Navbar";
import ChatForm from "@/components/ChatForm";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    level: "debutant",
    objectiveName: "Courir 5 km",
    targetDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Dans 8 semaines
    sessionsPerWeek: 3,
    targetTime: "",
    targetDistance: 5,
    availability: "lundi, mercredi, samedi",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [useChat, setUseChat] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleChatComplete = (completedProfile: UserProfile) => {
    setProfile(completedProfile);
    // Déclencher la soumission du formulaire
    setTimeout(() => {
      const form = document.getElementById("generate-form") as HTMLFormElement | null;
      form?.requestSubmit();
    }, 100);
  };

  useEffect(() => {
    const savedPlans: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("plan_")) {
        const plan = localStorage.getItem(key);
        if (plan) savedPlans.push(JSON.parse(plan));
      }
    }
    setPlans(savedPlans.reverse());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const plan = await response.json();
      localStorage.setItem(`plan_${plan.id}`, JSON.stringify(plan));
      setPlans([plan, ...plans]);
      router.push(`/plan/${plan.id}`);
    } catch (error) {
      alert("Erreur lors de la generation. Verifie ta cle API Mistral dans .env.local");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navbar />

      <section className="relative pt-24 pb-16 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"
        />

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
          >
            Des plans d&apos;entrainement
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={scrollToForm}
              size="lg"
              className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 border-0"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Creer mon plan
            </Button>
            <Button
              onClick={scrollToPlans}
              variant="glass"
              size="lg"
              className="px-6 py-3 text-base font-semibold"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Voir mes plans
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500 rounded-full blur-3xl"
          />
        </div>
      </section>

      <section id="create" ref={formRef} className="py-16 bg-white/50">
        <div className="max-w-3xl mx-auto px-4">
          {useChat ? (
            <ChatForm onComplete={handleChatComplete} isLoading={isLoading} onBack={() => setUseChat(false)} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-200/50"
            >
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">
                      Ton plan sur mesure
                    </h2>
                    <p className="text-slate-500">
                      Remplis ces informations pour générer ton plan en quelques secondes.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUseChat(true)}
                    className="border-indigo-500/30 hover:bg-indigo-500/10"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Mode Chat
                  </Button>
                </div>
              </div>

              <form id="generate-form" onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Footprints className="h-4 w-4 text-indigo-500" />
                  Niveau actuel
                </label>
                <select
                  value={profile.level}
                  onChange={(e) =>
                    setProfile({ ...profile, level: e.target.value as UserProfile["level"] })
                  }
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                >
                  <option value="debutant" className="bg-white">
                    Debutant (0-10 km/semaine)
                  </option>
                  <option value="intermediaire" className="bg-white">
                    Intermediaire (10-30 km/semaine)
                  </option>
                  <option value="avance" className="bg-white">
                    Avance (30+ km/semaine)
                  </option>
                </select>
              </motion.div>

              {/* Nom de l'objectif */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Target className="h-4 w-4 text-indigo-500" />
                  Nom de l&apos;objectif
                </label>
                <input
                  type="text"
                  value={profile.objectiveName}
                  onChange={(e) => setProfile({ ...profile, objectiveName: e.target.value })}
                  placeholder="ex: Marathon de Paris 2025, 5km en 25 min, 10km"
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date d'objectif */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    Date d&apos;objectif
                  </label>
                  <input
                    type="date"
                    value={profile.targetDate}
                    onChange={(e) => setProfile({ ...profile, targetDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                  />
                </motion.div>

                {/* Nombre de séances par semaine */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Footprints className="h-4 w-4 text-indigo-500" />
                    Séances par semaine
                  </label>
                  <select
                    value={profile.sessionsPerWeek}
                    onChange={(e) => setProfile({ ...profile, sessionsPerWeek: Number(e.target.value) })}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                  >
                    <option value={2} className="bg-white">2 séances/semaine</option>
                    <option value={3} className="bg-white">3 séances/semaine</option>
                    <option value={4} className="bg-white">4 séances/semaine</option>
                    <option value={5} className="bg-white">5 séances/semaine</option>
                    <option value={6} className="bg-white">6 séances/semaine</option>
                  </select>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distance cible */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Target className="h-4 w-4 text-indigo-500" />
                    Distance cible (km)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={42}
                      step={0.5}
                      value={profile.targetDistance || ''}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        targetDistance: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      placeholder="ex: 5, 10, 21.1, 42.2"
                      className="w-full p-4 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      km
                    </span>
                  </div>
                </motion.div>

                {/* Temps cible */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    Temps cible
                  </label>
                  <input
                    type="text"
                    value={profile.targetTime || ''}
                    onChange={(e) => setProfile({ ...profile, targetTime: e.target.value || undefined })}
                    placeholder="ex: 25:00, 1:30:00"
                    pattern="[0-9]:[0-5][0-9](:[0-5][0-9])?"
                    className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                  />
                  <p className="text-xs text-slate-400 mt-1">Format: MM:SS ou HH:MM:SS</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  Jours disponibles
                </label>
                <input
                  type="text"
                  value={profile.availability}
                  onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                  placeholder="ex: lundi, mercredi, samedi"
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="pt-4"
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 border-0 transition-all duration-300"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generer mon plan avec IA
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        )}
        </div>
      </section>

      <section id="plans" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Tes plans <span className="gradient-text">enregistres</span>
            </h2>
            <p className="text-slate-500">
              Retrouve tous tes plans generes precedemment.
            </p>
          </motion.div>

          <AnimatePresence>
            {plans.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => router.push(`/plan/${plan.id}`)}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-200/50 group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {plan.nom_objectif || plan.objectif || "Mon plan"}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                              Niveau: {plan.niveau || "Inconnu"}
                            </p>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 font-medium">
                            {plan.duree_semaines || 0} semaines
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {(plan.semaines || []).length} semaines d&apos;entrainement avec {(plan.semaines || []).reduce((acc: number, semaine: any) => acc + (semaine.workouts?.length || 0), 0)} seances au total.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  Aucun plan enregistre
                </h3>
                <p className="text-slate-500 mb-4">
                  Genere ton premier plan pour commencer !
                </p>
                <Button
                  onClick={scrollToForm}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  Creer un plan maintenant
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            Powered by <span className="font-semibold text-indigo-600">Mistral AI</span> & ""
            <span className="font-semibold text-indigo-600">Next.js</span>
          </p>
        </div>
      </footer>
    </>
  );
}
