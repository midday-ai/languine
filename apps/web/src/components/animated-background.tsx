"use client";

export function AnimatedBackground() {
  return (
    <div className="relative overflow-hidden bg-muted">
      <div className="absolute inset-0 flex flex-col opacity-30">
        <div className="animate-slide-left-1 whitespace-nowrap text-xl">
          Hello World • Bonjour le Monde • 你好世界 • Hola Mundo •
          こんにちは世界 • 안녕하세요 세계 • Hallo Welt • Ciao Mondo • Olá Mundo
          • Привет мир
        </div>
        <div className="animate-slide-right-1 whitespace-nowrap text-2xl mt-8">
          Здравствуйте • שָׁלוֹם עוֹלָם • مرحبا بالعالم • Γεια σας Κόσμε • Xin chào
          Thế giới • Hej Verden • Hei maailma • Halló heimur
        </div>
        <div className="animate-slide-left-2 whitespace-nowrap text-lg mt-8">
          Sawubona Mhlaba • Salut Lume • Hallo Wereld • Witaj Świecie • Merhaba
          Dünya • Pozdravljen svet • Ahoj svete • Здраво свете
        </div>
        <div className="animate-slide-right-2 whitespace-nowrap text-xl mt-8">
          Dia duit ar domhan • Hej världen • Sveika pasaule • Tere maailm •
          Labas pasauli • Здравей свят • Përshëndetje Botë • Hei verden
        </div>
        <div className="animate-slide-left-3 whitespace-nowrap text-2xl mt-8">
          Hello World • Bonjour le Monde • 你好世界 • Hola Mundo •
          こんにちは世界 • 안녕하세요 세계 • Hallo Welt • Ciao Mondo • Olá Mundo
          • Привет мир
        </div>
      </div>
    </div>
  );
}
