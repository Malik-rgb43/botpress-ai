"use client";

import { motion } from "framer-motion";
import { Users, MessageSquare, Star, Zap } from "lucide-react";

const stats = [
  { value: "500+", label: "עסקים", icon: Users },
  { value: "50K+", label: "הודעות", icon: MessageSquare },
  { value: "4.9", label: "דירוג", icon: Star },
];

export function HeroStatsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-strong rounded-3xl p-8 max-w-sm mx-auto lg:mx-0 relative overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 h-48 w-48 rounded-full bg-blue-200/20 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold gradient-text">24/7</div>
            <div className="text-xs text-gray-500">הבוט תמיד זמין</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500">שביעות רצון לקוחות</span>
            <span className="font-semibold gradient-text">98%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: "98%" }}
              transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-5" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
            >
              <stat.icon className="h-4 w-4 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold gradient-text">{stat.value}</div>
              <div className="text-[10px] text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Active badge */}
        <div className="mt-5 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-gray-400">פעיל עכשיו</span>
        </div>
      </div>
    </motion.div>
  );
}
