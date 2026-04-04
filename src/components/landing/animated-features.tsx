"use client";

import { motion, type Variants } from "framer-motion";
import { MessageSquare, Mail, BarChart3, Shield, Zap, Globe } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "בוט וואטסאפ", desc: "הבוט עונה ללקוחות בוואטסאפ באופן אוטומטי, מותאם לעסק שלך", gradient: "from-blue-500 to-blue-600" },
  { icon: Mail, title: "בוט אימייל", desc: "תשובות אוטומטיות למיילים של לקוחות עם תוכן מותאם אישית", gradient: "from-indigo-500 to-indigo-600" },
  { icon: BarChart3, title: "דשבורד וניתוח", desc: "ראה מה שואלים, כמה שיחות, שביעות רצון וסיכומים", gradient: "from-violet-500 to-violet-600" },
  { icon: Shield, title: "מדיניות ו-FAQ", desc: "הגדר שאלות נפוצות ומדיניות והבוט ישתמש בהם לתשובות", gradient: "from-blue-600 to-indigo-500" },
  { icon: Zap, title: "AI חכם ב-3 שכבות", desc: "חיפוש FAQ, תשובה מבוססת AI, והעברה לנציג — הכל אוטומטי", gradient: "from-indigo-500 to-violet-500" },
  { icon: Globe, title: "רב-שפתי", desc: "הבוט מזהה את השפה ועונה בעברית, אנגלית וערבית אוטומטית", gradient: "from-violet-500 to-blue-500" },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function AnimatedFeatures() {
  return (
    <motion.div
      className="grid md:grid-cols-3 gap-5"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {features.map((feature, i) => (
        <motion.div
          key={i}
          variants={cardVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="glass-card rounded-2xl p-6 cursor-default"
        >
          <motion.div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <feature.icon className="h-6 w-6 text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
