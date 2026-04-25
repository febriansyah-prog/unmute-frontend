"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed bottom-6 right-6 w-12 h-12 z-50" />; // Placeholder
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 z-[100] p-3 rounded-full bg-white dark:bg-gray-900 border-2 border-brand-purple/20 dark:border-brand-lime/20 text-brand-purple dark:text-brand-lime hover:scale-110 hover:shadow-[0_0_20px_rgba(79,38,166,0.5)] dark:hover:shadow-[0_0_20px_rgba(217,253,31,0.5)] transition-all duration-300 premium-shadow"
      aria-label="Toggle Theme"
      title="Ubah Mode Siang/Malam"
    >
      {theme === "dark" ? (
        <Sun className="w-6 h-6" />
      ) : (
        <Moon className="w-6 h-6" />
      )}
    </button>
  );
}
