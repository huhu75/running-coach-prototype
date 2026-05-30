"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";
import { UserProfile } from "@/lib/types";
import Navbar from "@/components/Navbar";
import ChatForm from "@/components/ChatForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleChatComplete = async (profile: UserProfile) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la génération du plan");
      }
      
      const plan = await response.json();
      
      if (!plan?.id) {
        throw new Error("Le plan généré n'a pas d'identifiant");
      }
      
      try {
        localStorage.setItem(`plan_${plan.id}`, JSON.stringify(plan));
        setPlans([plan, ...plans]);
        router.push(`/plan/${plan.id}`);
      } catch (storageError) {
        if (storageError instanceof Error && storageError.name === "QuotaExceededError") {
          toast.error("Limite de stockage atteinte. Supprimez certains plans pour en ajouter de nouveaux.");
        } else {
          throw storageError;
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la génération. Vérifiez votre clé API Mistral.");
    } finally {
      setIsLoading(false);
    }
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

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
          >
            Des plans d&apos;entraînement
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto"
          >
            Personnalisés avec IA pour atteindre tes objectifs de course à pied
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={scrollToChat}
              size="lg"
              className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 border-0"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Créer mon plan par conversation
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

      <section id="create" ref={chatRef} className="py-16 bg-white/50">
        <div className="max-w-3xl mx-auto px-4">
          <ChatForm onComplete={handleChatComplete} isLoading={isLoading} />
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
              Tes plans <span className="gradient-text">enregistrés</span>
            </h2>
            <p className="text-slate-600">
              Retrouve tous tes plans générés précédemment.
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
                          {(plan.semaines || []).length} semaines d&apos;entraînement avec {(plan.semaines || []).reduce((acc: number, semaine: any) => acc + (semaine.workouts?.length || 0), 0)} séances au total.
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
                  Aucun plan enregistré
                </h3>
                <p className="text-slate-500 mb-4">
                  Génère ton premier plan pour commencer !
                </p>
                <Button
                  onClick={scrollToChat}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  Créer un plan maintenant
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
