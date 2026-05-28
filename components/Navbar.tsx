"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Calendar, Settings, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/20 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
              className="relative p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <span className="font-bold text-xl gradient-text">
              Running<span className="text-indigo-600">Coach</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Link>
            <Link
              href="/#plans"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Mes Plans
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>
          </div>

          {/* CTA Button */}
          <Link
            href="/#create"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            <Sparkles className="h-4 w-4" />
            Créer un plan
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
