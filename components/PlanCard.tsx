"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Footprints, Zap, Flame, Moon, Calendar, Clock } from "lucide-react";
import { Week } from "@/lib/types";

type PlanCardProps = {
  week: Week;
};

const intensityConfig = {
  facile: { color: "green" as const, icon: Moon, label: "Facile" },
  moderee: { color: "yellow" as const, icon: Footprints, label: "Modérée" },
  elevee: { color: "red" as const, icon: Zap, label: "Élevée" },
};

const typeConfig = {
  endurance: { icon: Footprints, color: "indigo" as const, label: "Endurance" },
  fractionne: { icon: Zap, color: "purple" as const, label: "Fractionné" },
  seuil: { icon: Flame, color: "orange" as const, label: "Seuil" },
  repos: { icon: Moon, color: "slate" as const, label: "Repos" },
};

const colorClasses = {
  green: "bg-emerald-500/10 text-emerald-600",
  yellow: "bg-amber-500/10 text-amber-600",
  red: "bg-rose-500/10 text-rose-600",
  indigo: "bg-indigo-500/10 text-indigo-600",
  purple: "bg-purple-500/10 text-purple-600",
  orange: "bg-orange-500/10 text-orange-600",
  slate: "bg-slate-500/10 text-slate-600",
} as const;

type ColorKey = keyof typeof colorClasses;

export default function PlanCard({ week }: PlanCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const IconChevron = isOpen ? ChevronUp : ChevronDown;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50/50 transition-colors"
        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
        whileTap={{ scale: 0.995 }}
      >
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
              <span className="text-xl font-bold text-slate-700">
                Semaine {week.numero}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {week.objectif || "Objectif non défini"}
              </h3>
              <p className="text-sm text-slate-500">
                {(week.workouts || []).length} séances
              </p>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, rotate: -90 }}
          whileInView={{ opacity: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-2 rounded-full bg-slate-100 text-slate-400"
        >
          <IconChevron className="h-5 w-5" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-6 pt-0 space-y-4"
            >
              {(week.workouts || []).map((workout, index) => {
                const type = typeConfig[(workout.type as keyof typeof typeConfig) || "endurance"];
                const intensity = intensityConfig[(workout.intensite as keyof typeof intensityConfig) || "facile"];
                const TypeIcon = type.icon;
                const IntensityIcon = intensity.icon;
                const typeColor = type.color as ColorKey;
                const intensityColor = intensity.color as ColorKey;

                return (
                  <motion.div
                    key={workout.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    whileHover={{ x: 5, scale: 1.01 }}
                    className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-indigo-200 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${colorClasses[typeColor]}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {workout.titre || "Séance sans titre"}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${colorClasses[intensityColor]}`}>
                                <IntensityIcon className="h-3 w-3 inline mr-1" />
                                {intensity.label || "Facile"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 ml-11">
                          {workout.description || "Aucune description"}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 ml-11 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {workout.jour || "Non spécifié"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {workout.duree_minutes || 0} min
                          </span>
                          {workout.distance_km && (
                            <span className="flex items-center gap-1">
                              {workout.distance_km} km
                            </span>
                          )}
                          {workout.allure_kmh && (
                            <span className="flex items-center gap-1">
                              {(60 / workout.allure_kmh).toFixed(2)} min/km
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
