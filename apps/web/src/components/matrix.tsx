"use client";

import React, { useState, useEffect, useCallback } from "react";

const words = [
  {
    en: "Dashboard",
    es: "Panel",
    fr: "Tableau de bord",
    de: "Dashboard",
    it: "Cruscotto",
    ja: "ダッシュボード",
  },
  {
    en: "Settings",
    es: "Ajustes",
    fr: "Paramètres",
    de: "Einstellungen",
    it: "Impostazioni",
    ja: "設定",
  },
  {
    en: "Profile",
    es: "Perfil",
    fr: "Profil",
    de: "Profil",
    it: "Profilo",
    ja: "プロフィール",
  },
  {
    en: "Notifications",
    es: "Notificaciones",
    fr: "Notifications",
    de: "Benachrichtigungen",
    it: "Notifiche",
    ja: "通知",
  },
  {
    en: "Analytics",
    es: "Análisis",
    fr: "Analytique",
    de: "Analytik",
    it: "Analisi",
    ja: "分析",
  },
  {
    en: "Transactions",
    es: "Transacciones",
    fr: "Transactions",
    de: "Transaktionen",
    it: "Transazioni",
    ja: "取引",
  },
  {
    en: "Reports",
    es: "Informes",
    fr: "Rapports",
    de: "Berichte",
    it: "Rapporti",
    ja: "レポート",
  },
  {
    en: "Users",
    es: "Usuarios",
    fr: "Utilisateurs",
    de: "Benutzer",
    it: "Utenti",
    ja: "ユーザー",
  },
  {
    en: "Products",
    es: "Productos",
    fr: "Produits",
    de: "Produkte",
    it: "Prodotti",
    ja: "製品",
  },
  {
    en: "Inventory",
    es: "Inventario",
    fr: "Inventaire",
    de: "Inventar",
    it: "Inventario",
    ja: "在庫",
  },
  {
    en: "Orders",
    es: "Pedidos",
    fr: "Commandes",
    de: "Bestellungen",
    it: "Ordini",
    ja: "注文",
  },
  {
    en: "Customers",
    es: "Clientes",
    fr: "Clients",
    de: "Kunden",
    it: "Clienti",
    ja: "顧客",
  },
  {
    en: "Logout",
    es: "Cerrar sesión",
    fr: "Déconnexion",
    de: "Abmelden",
    it: "Esci",
    ja: "ログアウト",
  },
  {
    en: "Search",
    es: "Buscar",
    fr: "Rechercher",
    de: "Suchen",
    it: "Cerca",
    ja: "検索",
  },
  {
    en: "Help",
    es: "Ayuda",
    fr: "Aide",
    de: "Hilfe",
    it: "Aiuto",
    ja: "ヘルプ",
  },
];

const languages = ["en", "es", "fr", "de", "it", "ja"];

type WordState = {
  word: string;
  scrambledWord: string;
  isScrambling: boolean;
};

function getRandomWord() {
  const word = words[Math.floor(Math.random() * words.length)];
  const lang = languages[Math.floor(Math.random() * languages.length)];
  return word[lang as keyof typeof word];
}

function scrambleWord(word: string): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|;:,.<>?";
  return word
    .split("")
    .map((char) =>
      Math.random() > 0.5
        ? chars[Math.floor(Math.random() * chars.length)]
        : char,
    )
    .join("");
}

const MatrixWord: React.FC<WordState> = React.memo(
  ({ word, scrambledWord, isScrambling }) => {
    return (
      <span className="p-1 transition-colors duration-300 ease-in-out text-[#242424]">
        {isScrambling ? scrambledWord : word}
      </span>
    );
  },
);

MatrixWord.displayName = "MatrixWord";

export default function MatrixTextWall() {
  const [matrix, setMatrix] = useState<WordState[][]>([]);

  useEffect(() => {
    setMatrix(
      Array.from({ length: 30 }, () =>
        Array.from({ length: 30 }, () => {
          const word = getRandomWord();
          return {
            word,
            scrambledWord: scrambleWord(word),
            isScrambling: false,
          };
        }),
      ),
    );
  }, []);

  const updateMatrix = useCallback(() => {
    setMatrix((prevMatrix) =>
      prevMatrix.map((row) =>
        row.map((cell) => {
          if (Math.random() < 0.01) {
            const newWord = getRandomWord();
            return {
              word: newWord,
              scrambledWord: scrambleWord(newWord),
              isScrambling: true,
            };
          }
          if (cell.isScrambling) {
            return {
              ...cell,
              scrambledWord: scrambleWord(cell.word),
              isScrambling: Math.random() > 0.2,
            };
          }
          return cell;
        }),
      ),
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(updateMatrix, 100);
    return () => clearInterval(interval);
  }, [updateMatrix]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none -z-1 opacity-40">
      <div className="text-[0.4rem] sm:text-[0.5rem] md:text-xs lg:text-sm absolute inset-0 flex flex-col justify-between">
        {matrix.map((row, i) => (
          <div key={i.toString()} className="flex whitespace-nowrap">
            {row.map((cell, j) => (
              <MatrixWord key={j.toString()} {...cell} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
