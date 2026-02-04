"use client"

import { BookOpen, Flame } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedLogo() {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-32 w-32">
      <BookOpen
        className="absolute inset-0 h-full w-full text-primary transition-all duration-1000"
        strokeWidth={1.5}
        style={{
          transform: isAnimated ? "scale(1)" : "scale(0.8)",
          opacity: isAnimated ? 1 : 0,
        }}
      />
      <Flame
        className="absolute top-[-20px] left-1/2 -translate-x-1/2 h-16 w-16 text-accent transition-all duration-500 delay-500"
        strokeWidth={1.5}
        style={{
          opacity: isAnimated ? 1 : 0,
          transform: isAnimated
            ? "translateY(0) translateX(-50%)"
            : "translateY(10px) translateX(-50%)",
          animation: isAnimated ? 'candle-flame 3s ease-in-out infinite' : 'none'
        }}
      />
    </div>
  );
}
