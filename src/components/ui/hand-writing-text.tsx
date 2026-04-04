"use client";

import { motion, type Variants } from "framer-motion";

interface HandWrittenTitleProps {
  title?: string;
  subtitle?: string;
}

function HandWrittenTitle({
  title = "BotPress AI",
  subtitle,
}: HandWrittenTitleProps) {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: [0.43, 0.13, 0.23, 0.96] },
        opacity: { duration: 0.5 },
      },
    },
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto py-12">
      {/* Animated underline instead of circle */}
      <div className="absolute bottom-[45%] left-[10%] right-[10%] h-4">
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 600 20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          preserveAspectRatio="none"
        >
          <title>{title}</title>
          <motion.path
            d="M 10 15 Q 150 2, 300 12 Q 450 22, 590 8"
            fill="none"
            strokeWidth="4"
            stroke="url(#underline-gradient)"
            strokeLinecap="round"
            variants={draw}
            className="opacity-60"
          />
          <defs>
            <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>
      <div className="relative text-center z-10 flex flex-col items-center justify-center">
        <motion.h2
          className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            className="text-lg text-gray-500 mt-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
}

export { HandWrittenTitle };
