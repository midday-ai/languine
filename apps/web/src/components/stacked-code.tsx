"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StackedCode() {
  const [activeIndex, setActiveIndex] = useState(4);
  const totalLayers = 5;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev < totalLayers - 1 ? prev + 1 : 0));
    }, 2000);

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
            className="absolute w-full bg-background"
            initial={{ y: 20 }}
            animate={{
              y: position * -10,
              scale: 1 - position * 0.02,
              zIndex: totalLayers - position,
              rotateX: position * -2,
            }}
            transition={{
              duration: isActive ? 1 : 0.8,
              ease: isActive ? [0.34, 1.56, 0.64, 1] : [0.43, 0.13, 0.23, 0.96],
            }}
            whileHover={
              isActive
                ? {
                    scale: 1.03,
                    y: position * -10 - 5,
                    transition: {
                      duration: 0.3,
                      ease: "easeOut",
                    },
                  }
                : undefined
            }
          >
            <div className="bg-[#121212] border border-border">
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
