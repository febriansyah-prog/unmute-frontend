"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type CardContent = {
  id: number;
  value: string;
  type: "emoji" | "image";
};

type CardItem = CardContent & {
  uniqueId: number;
  isFlipped: boolean;
  isMatched: boolean;
};

const INITIAL_CARDS: CardContent[] = [
  { id: 1, value: "🎙️", type: "emoji" },
  { id: 2, value: "💻", type: "emoji" },
  { id: 3, value: "🚀", type: "emoji" },
  { id: 4, value: "🏛️", type: "emoji" },
  { id: 5, value: "🌟", type: "emoji" },
  { id: 6, value: "📈", type: "emoji" },
  { id: 7, value: "/logo.png", type: "image" },
  { id: 8, value: "/logo-unifa.png", type: "image" },
  { id: 9, value: "/logo-sulsel.png", type: "image" },
  { id: 10, value: "/logo-kbb.png", type: "image" },
];

export function MemoryMatchGame() {
  const [isOpen, setIsOpen] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Initialize game
  const initializeGame = () => {
    const shuffled = [...INITIAL_CARDS, ...INITIAL_CARDS]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        ...card,
        uniqueId: index,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (index: number) => {
    // Prevent clicking if two cards are already flipped, or if it's already flipped/matched
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Update the card to be flipped visually
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstIndex = newFlipped[0];
      const secondIndex = newFlipped[1];

      if (newCards[firstIndex].id === newCards[secondIndex].id) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatches((m) => {
            const newMatches = m + 1;
            if (newMatches === INITIAL_CARDS.length) {
              setIsWon(true);
            }
            return newMatches;
          });
        }, 500);
      } else {
        // No match, flip back
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => {
          if (!isOpen) initializeGame();
          setIsOpen(true);
        }}
        className="fixed bottom-6 left-4 sm:left-6 z-[90] p-4 rounded-full bg-brand-lime text-brand-purple-dark border-2 border-brand-purple/10 hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-[0_0_20px_rgba(217,253,31,0.4)] animate-bounce-slow flex items-center justify-center group"
        title="Mainkan Mini Game Asah Otak"
      >
        <span className="text-2xl leading-none">🎮</span>
        <span className="absolute left-14 bg-black/80 text-brand-lime text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Main Game!
        </span>
      </button>

      {/* Game Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Modal Container */}
          <div className="glass-card dark:bg-gray-900/90 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative z-10 premium-shadow border border-white/20 dark:border-gray-700 flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-brand-purple-dark dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <span>🧠</span> Memory <span className="text-brand-purple dark:text-brand-lime">Match</span>
                </h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cocokkan kartu ikon dan logo Unmute by Unifers!</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Stats Bar */}
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-8">
              <div className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Langkah: <span className="text-brand-purple dark:text-white text-lg">{moves}</span>
              </div>
              <button 
                onClick={initializeGame}
                className="px-4 py-2 bg-brand-purple/10 dark:bg-brand-purple/20 text-brand-purple dark:text-brand-lime rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-colors"
              >
                Ulangi
              </button>
              <div className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Cocok: <span className="text-brand-lime dark:text-brand-lime text-lg">{matches}/10</span>
              </div>
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 flex-1">
              {cards.map((card, index) => {
                const isRevealed = card.isFlipped || card.isMatched;
                return (
                  <div 
                    key={card.uniqueId}
                    className="relative aspect-square cursor-pointer group perspective-1000"
                    onClick={() => handleCardClick(index)}
                  >
                    <div 
                      className={`w-full h-full transition-all duration-500 transform-style-3d ${isRevealed ? 'rotate-y-180' : ''}`}
                    >
                      {/* Front of card (Hidden State) */}
                      <div className="absolute w-full h-full bg-brand-purple dark:bg-gray-800 rounded-xl sm:rounded-2xl border-2 border-brand-purple-light dark:border-gray-700 flex items-center justify-center backface-hidden shadow-md group-hover:scale-105 transition-transform">
                        <span className="text-2xl sm:text-3xl opacity-50">❓</span>
                      </div>
                      
                      {/* Back of card (Revealed State) */}
                      <div className={`absolute w-full h-full bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center backface-hidden rotate-y-180 shadow-lg ${card.isMatched ? 'border-brand-lime shadow-brand-lime/20' : 'border-brand-purple dark:border-brand-purple'}`}>
                        {card.type === "emoji" ? (
                          <span className="text-3xl sm:text-5xl">{card.value}</span>
                        ) : (
                          <div className="w-3/4 h-3/4 relative flex items-center justify-center">
                            <Image src={card.value} alt="Logo" fill className="object-contain p-1" />
                          </div>
                        )}
                        {/* Matched overlay */}
                        {card.isMatched && (
                          <div className="absolute inset-0 bg-brand-lime/10 dark:bg-brand-lime/20 rounded-xl sm:rounded-2xl z-10 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Win Overlay */}
            {isWon && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-[2rem] animate-fade-in flex-col text-center p-8">
                <div className="text-6xl mb-6 animate-bounce">🏆</div>
                <h2 className="text-4xl font-black text-brand-purple-dark dark:text-white uppercase tracking-tight mb-4">Luar Biasa!</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-8">
                  Anda berhasil menyelesaikan tantangan memori dalam <strong className="text-brand-purple dark:text-brand-lime">{moves} langkah</strong>! 
                  Ingatan Anda setajam visi Unmute by Unifers.
                </p>
                <button 
                  onClick={initializeGame}
                  className="px-8 py-4 bg-brand-lime text-brand-purple-dark rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 hover:shadow-[0_0_20px_rgba(217,253,31,0.5)] transition-all"
                >
                  Main Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
