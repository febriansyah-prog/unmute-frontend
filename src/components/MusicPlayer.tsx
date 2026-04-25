"use client";

import { useState, useEffect, useRef } from "react";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt to autoplay on mount (might be blocked by browser)
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set volume to 30%
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch((e) => {
          console.log("Autoplay blocked by browser. User needs to interact first.");
          
          // Add a global one-time interaction listener to start the music smoothly
          const startAudioOnInteract = () => {
            if (audioRef.current) {
              audioRef.current.play().then(() => {
                setIsPlaying(true);
              }).catch(() => {});
            }
            document.removeEventListener("click", startAudioOnInteract);
            document.removeEventListener("touchstart", startAudioOnInteract);
            document.removeEventListener("scroll", startAudioOnInteract);
          };

          document.addEventListener("click", startAudioOnInteract);
          document.addEventListener("touchstart", startAudioOnInteract);
          document.addEventListener("scroll", startAudioOnInteract, { once: true });
        });
      }
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} loop src="/bgm.mp3" preload="auto" />
      
      <button 
        onClick={togglePlay}
        className={`fixed bottom-6 right-6 z-[9999] p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center gap-2 border-2 ${
          isPlaying 
            ? "bg-brand-purple text-white border-brand-purple/50 animate-pulse-slow" 
            : "bg-white text-brand-purple-dark border-gray-100 opacity-70 hover:opacity-100"
        }`}
        title={isPlaying ? "Jeda Musik" : "Putar Musik Semangat"}
      >
        <span className="text-xl">
          {isPlaying ? "🎵" : "🔇"}
        </span>
        {isPlaying && (
          <div className="flex items-end h-4 gap-0.5 ml-1">
            <span className="w-1 h-3 bg-brand-lime rounded-full animate-[bounce_1s_infinite] delay-75"></span>
            <span className="w-1 h-4 bg-brand-lime rounded-full animate-[bounce_1s_infinite] delay-150"></span>
            <span className="w-1 h-2 bg-brand-lime rounded-full animate-[bounce_1s_infinite] delay-300"></span>
          </div>
        )}
      </button>
    </>
  );
}
