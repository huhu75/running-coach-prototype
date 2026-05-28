"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Target, Sparkles, Home, Footprints } from "lucide-react";
import { TrainingPlan } from "@/lib/types";
import Link from "next/link";
import PlanCard from "@/components/PlanCard";
import { Button } from "@/components/ui/button";

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedPlan = localStorage.getItem(`plan_${params.id}`);
    if (!savedPlan) {
      router.push("/");
      return;
    }
    setPlan(JSON.parse(savedPlan));
    setLoading(false);
  }, [params.id, router]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  if (!plan) return null;

  const totalWorkouts = plan.semaines.reduce(
    (acc: number, semaine) => acc + semaine.workouts.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50"
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="glass"
                size="icon"
                onClick={() => router.push("/")}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Link href="/" className="p-2 hidden sm:inline-flex">
                <Home className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">
                Plan: {plan.objectif}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center gap-4 mb-4"
              >
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                    {plan.nom_objectif || plan.objectif}
                  </h1>
                  {plan.date_objectif && (
                    <p className="text-lg text-slate-600 mt-1">
                      À atteindre le {new Date(plan.date_objectif).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  <p className="text-lg text-slate-600 mt-1">
                    Plan d&apos;entrainement sur {plan.duree_semaines} semaines
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-wrap gap-3"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/50 shadow-sm">
                  <Target className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Niveau: <span className="text-indigo-600">{plan.niveau}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/50 shadow-sm">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">
                    {plan.seances_par_semaine} séances/semaine
                  </span>
                </div>
                {plan.duree_semaines && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/50 shadow-sm">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {plan.duree_semaines} semaines
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/50 shadow-sm">
                  <Footprints className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">
                    {totalWorkouts} séances
                  </span>
                </div>
                {plan.distance_cible && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/50 shadow-sm">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">
                      Distance cible: {plan.distance_cible} km
                    </span>
                  </div>
                )}
                {plan.temps_cible && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/50 shadow-sm">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">
                      Temps cible: {plan.temps_cible}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex gap-3"
            >
              <Link href="/" className="inline-flex items-center px-6 py-3 font-semibold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl hover:from-indigo-500/20 hover:to-purple-500/20 transition-all">
                <Sparkles className="h-5 w-5 mr-2" />
                Nouveau plan
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {plan.conseils && plan.conseils.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Sparkles className="h-5 w-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Conseils du coach
              </h2>
            </div>
            <ul className="space-y-3">
              {plan.conseils.map((conseil, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-3 text-slate-700"
                >
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>{conseil}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-4"
        >
          {plan.semaines.map((semaine, index) => (
            <motion.div
              key={semaine.numero}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
            >
              <PlanCard week={semaine} />
            </motion.div>
          ))}
        </motion.div>
      </main>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="fixed bottom-8 right-8"
      >
        <Button
          variant="glass"
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="p-3 shadow-lg"
        >
          <ArrowLeft className="h-5 w-5 rotate-90" />
        </Button>
      </motion.div>
    </div>
  );
}
