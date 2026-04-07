"use client";

interface HandWrittenTitleProps {
  title?: string;
  subtitle?: string;
}

function HandWrittenTitle({
  title = "BotPress AI",
  subtitle,
}: HandWrittenTitleProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto py-12">
      <div className="absolute bottom-[45%] left-[10%] right-[10%] h-4">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 600 20"
          preserveAspectRatio="none"
        >
          <title>{title}</title>
          <path
            d="M 10 15 Q 150 2, 300 12 Q 450 22, 590 8"
            fill="none"
            strokeWidth="4"
            stroke="url(#underline-gradient)"
            strokeLinecap="round"
            className="opacity-60"
            style={{
              strokeDasharray: 600,
              strokeDashoffset: 0,
              animation: 'draw-line 1.5s ease forwards',
            }}
          />
          <defs>
            <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="relative text-center z-10 flex flex-col items-center justify-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-gray-500 mt-3">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export { HandWrittenTitle };
