import { FeedCard } from "./feed-card";

export async function Feed() {
  const translations = [
    {
      source: "Hello",
      content:
        "es: 'Hola', fr: 'Bonjour', de: 'Hallo', it: 'Ciao', ja: 'こんにちは'",
    },
    {
      source: "Thank you",
      content:
        "es: 'Gracias', fr: 'Merci', de: 'Danke', it: 'Grazie', ja: 'ありがとう'",
    },
    {
      source: "Welcome",
      content:
        "es: 'Bienvenido', fr: 'Bienvenue', de: 'Willkommen', it: 'Benvenuto', ja: 'ようこそ'",
    },
    {
      source: "Goodbye",
      content:
        "es: 'Adiós', fr: 'Au revoir', de: 'Auf Wiedersehen', it: 'Arrivederci', ja: 'さようなら'",
    },
    {
      source: "Please",
      content:
        "es: 'Por favor', fr: 'S'il vous plaît', de: 'Bitte', it: 'Per favore', ja: 'お願いします'",
    },
    {
      source: "Good morning",
      content:
        "es: 'Buenos días', fr: 'Bonjour', de: 'Guten Morgen', it: 'Buongiorno', ja: 'おはようございます'",
    },
    {
      source: "Good night",
      content:
        "es: 'Buenas noches', fr: 'Bonne nuit', de: 'Gute Nacht', it: 'Buonanotte', ja: 'おやすみなさい'",
    },
    {
      source: "How are you?",
      content:
        "es: '¿Cómo estás?', fr: 'Comment allez-vous?', de: 'Wie geht es dir?', it: 'Come stai?', ja: 'お元気ですか？'",
    },
    {
      source: "Nice to meet you",
      content:
        "es: 'Encantado/a', fr: 'Enchanté(e)', de: 'Freut mich', it: 'Piacere', ja: 'はじめまして'",
    },
    {
      source: "Excuse me",
      content:
        "es: 'Perdón', fr: 'Excusez-moi', de: 'Entschuldigung', it: 'Scusi', ja: 'すみません'",
    },
    {
      source: "Yes",
      content: "es: 'Sí', fr: 'Oui', de: 'Ja', it: 'Sì', ja: 'はい'",
    },
    {
      source: "No",
      content: "es: 'No', fr: 'Non', de: 'Nein', it: 'No', ja: 'いいえ'",
    },
    {
      source: "Maybe",
      content:
        "es: 'Quizás', fr: 'Peut-être', de: 'Vielleicht', it: 'Forse', ja: 'たぶん'",
    },
    {
      source: "See you later",
      content:
        "es: 'Hasta luego', fr: 'À plus tard', de: 'Bis später', it: 'A dopo', ja: 'また後で'",
    },
    {
      source: "Have a nice day",
      content:
        "es: 'Que tengas un buen día', fr: 'Bonne journée', de: 'Schönen Tag', it: 'Buona giornata', ja: '良い一日を'",
    },
  ];

  return (
    <div className="p-8">
      <h2 className="text-lg font-normal">Feed</h2>

      <div className="flex flex-col gap-4 mt-6">
        {translations.map((translation, i) => (
          <FeedCard
            key={i.toString()}
            source={translation.source}
            content={translation.content}
          />
        ))}
      </div>
    </div>
  );
}
