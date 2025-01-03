"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StackedCode() {
  const [activeIndex, setActiveIndex] = useState(4);
  const totalLayers = 5;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev < totalLayers - 1 ? prev + 1 : 0));
    }, 2000); // Reduced from 3000ms to 2000ms for faster animation

    return () => clearInterval(timer);
  }, []);

  const translations = [
    "Hello → es: 'Hola', fr: 'Bonjour', de: 'Hallo', it: 'Ciao', ja: 'こんにちは'",
    "Thank you → es: 'Gracias', fr: 'Merci', de: 'Danke', it: 'Grazie', ja: 'ありがとう'",
    "Welcome → es: 'Bienvenido', fr: 'Bienvenue', de: 'Willkommen', it: 'Benvenuto', ja: 'ようこそ'",
    "Goodbye → es: 'Adiós', fr: 'Au revoir', de: 'Auf Wiedersehen', it: 'Arrivederci', ja: 'さようなら'",
    "Please → es: 'Por favor', fr: 'S'il vous plaît', de: 'Bitte', it: 'Per favore', ja: 'お願いします'",
  ];

  return (
    <div className="relative">
      {[...Array(totalLayers)].map((_, i) => {
        const position = (i - activeIndex + totalLayers) % totalLayers;
        const isActive = position === 0;

        return (
          <motion.div
            key={translations[i]}
            className="absolute w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1 - position * 0.15,
              y: position * -20,
              scale: 1 - position * 0.02,
              zIndex: totalLayers - position,
              rotateX: position * -2,
            }}
            transition={{
              duration: isActive ? 1 : 0.8, // Reduced from 1.6/1.2 to 1/0.8
              ease: isActive ? [0.34, 1.56, 0.64, 1] : [0.43, 0.13, 0.23, 0.96],
              opacity: { duration: 0.5 }, // Reduced from 0.8 to 0.5
            }}
            whileHover={
              isActive
                ? {
                    scale: 1.03,
                    y: position * -20 - 5,
                    transition: {
                      duration: 0.3, // Reduced from 0.5 to 0.3
                      ease: "easeOut",
                    },
                  }
                : undefined
            }
          >
            <div
              className={cn(
                "bg-background border",
                isActive
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
                  : "border-border",
              )}
            >
              <div className="text-secondary font-mono text-xs text-center whitespace-nowrap overflow-hidden p-6">
                {translations[i]}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
