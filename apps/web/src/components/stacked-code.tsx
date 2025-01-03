"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StackedCode() {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalLayers = 5;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev < totalLayers - 1 ? prev + 1 : 0));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-3xl">
      {[...Array(totalLayers)].map((_, i) => {
        const isActive = i === activeIndex;
        const zIndex = isActive ? totalLayers : totalLayers - i;
        const scale = 1 - i * 0.02;
        const y = i * 4;
        const rotate = i * 2;
        const opacity = 1 - i * 0.15;

        return (
          <motion.div
            key={`card-${i}`}
            className="absolute w-full origin-center"
            animate={{
              y,
              scale,
              rotate,
              zIndex,
              opacity,
            }}
            initial={false}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              transformOrigin: "center center",
            }}
          >
            <div className="bg-zinc-900 rounded-md h-12 shadow-lg border border-zinc-800">
              <div className="text-gray-400 font-mono text-sm p-2.5 whitespace-nowrap overflow-hidden">
                Word → es: &apos;Ayuda&apos;, fr: &apos;Aide&apos;, de:
                &apos;Hilfe&apos;, it: &apos;Aiuto&apos;, ja: &apos;ヘルプ&apos;
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
