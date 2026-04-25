const fs = require('fs');

const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix duplicates
content = content.replace(/(dark:text-[a-zA-Z0-9-]+\s*)+/g, (match) => {
  const parts = match.trim().split(/\s+/);
  return [...new Set(parts)].join(' ') + ' ';
});
content = content.replace(/(dark:bg-[a-zA-Z0-9-\/]+\s*)+/g, (match) => {
  const parts = match.trim().split(/\s+/);
  return [...new Set(parts)].join(' ') + ' ';
});
content = content.replace(/(dark:border-[a-zA-Z0-9-]+\s*)+/g, (match) => {
  const parts = match.trim().split(/\s+/);
  return [...new Set(parts)].join(' ') + ' ';
});

// Structural fixes
content = content.replace(/<main className="min-h-screen pb-20 overflow-x-hidden">/g, '<main className="min-h-screen pb-20 overflow-x-hidden dark:bg-black transition-colors duration-500">');

content = content.replace(/<nav className="sticky top-0 z-50 glass-card px-4 py-3 sm:px-6 mb-8 border-b border-white\/50">/g, '<nav className="sticky top-0 z-50 glass-card dark:bg-black/50 px-4 py-3 sm:px-6 mb-8 border-b border-white/50 dark:border-gray-800 transition-colors duration-500">');

content = content.replace(/<Image src="\/logo.png" alt="Unmute by Unifers" width={150} height={50} className="h-10 sm:h-12 w-auto object-contain" priority \/>/g, 
  `<div className="absolute inset-0 bg-transparent dark:bg-white/60 blur-md rounded-full z-0 transition-colors duration-500"></div>\n            <Image src="/logo.png" alt="Unmute by Unifers" width={150} height={50} className="h-10 sm:h-12 w-auto object-contain relative z-10" priority />`);

content = content.replace(/<div className="flex items-center gap-3">/g, '<div className="flex items-center gap-3 relative">');

// Apply dark mode to cards
content = content.replace(/className="glass-card/g, 'className="glass-card dark:bg-gray-900/50');
content = content.replace(/bg-white\/60/g, 'bg-white/60 dark:bg-gray-800/50');
content = content.replace(/bg-white border-white\/60/g, 'bg-white dark:bg-gray-900/50 border-white/60 dark:border-gray-800');

content = content.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-300');
content = content.replace(/text-gray-600/g, 'text-gray-600 dark:text-gray-400');
content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
content = content.replace(/text-gray-400/g, 'text-gray-400 dark:text-gray-500');

// Hero background
content = content.replace(/bg-gradient-to-br from-brand-purple\/10 to-brand-lime\/10/g, 'bg-gradient-to-br from-brand-purple/10 to-brand-lime/10 dark:from-brand-purple/20 dark:to-brand-lime/20');

// Table list text
content = content.replace(/text-gray-800/g, 'text-gray-800 dark:text-gray-200');

// Cleanup again
content = content.replace(/(dark:text-[a-zA-Z0-9-]+\s*)+/g, (match) => {
  const parts = match.trim().split(/\s+/);
  return [...new Set(parts)].join(' ') + ' ';
});

fs.writeFileSync(file, content);
console.log("Done");
