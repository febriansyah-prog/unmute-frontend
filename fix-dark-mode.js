const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src/app/admin').concat(walk('./src/app/pengumuman'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/<main className="min-h-screen pb-20 overflow-x-hidden">/g, '<main className="min-h-screen pb-20 overflow-x-hidden dark:bg-black transition-colors duration-500">');
  content = content.replace(/<div className="min-h-screen pb-20">/g, '<div className="min-h-screen pb-20 dark:bg-black transition-colors duration-500">');
  content = content.replace(/className="bg-brand-purple\/5 text-brand-purple/g, 'className="bg-brand-purple/5 dark:bg-brand-purple/20 text-brand-purple dark:text-brand-lime');
  content = content.replace(/<tbody className="divide-y divide-gray-50">/g, '<tbody className="divide-y divide-gray-50 dark:divide-gray-800">');
  content = content.replace(/className="hover:bg-brand-purple\/\[0\.01\] transition-colors group"/g, 'className="glass-row-hover dark:hover:bg-gray-800 transition-colors group"');
  content = content.replace(/className="hover:bg-gray-50 transition-colors"/g, 'className="glass-row-hover dark:hover:bg-gray-800 transition-colors"');
  content = content.replace(/className="hover:bg-gray-50\/50 transition-colors"/g, 'className="glass-row-hover dark:hover:bg-gray-800 transition-colors"');
  content = content.replace(/className="hover:bg-gray-50 transition-colors group"/g, 'className="glass-row-hover dark:hover:bg-gray-800 transition-colors group"');
  content = content.replace(/text-gray-800/g, 'text-gray-800 dark:text-gray-200');
  content = content.replace(/text-gray-600/g, 'text-gray-600 dark:text-gray-400');
  content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
  content = content.replace(/text-gray-400/g, 'text-gray-400 dark:text-gray-500');
  content = content.replace(/text-gray-300/g, 'text-gray-300 dark:text-gray-600');
  content = content.replace(/glass-card rounded/g, 'glass-card dark:bg-gray-900/50 rounded');
  content = content.replace(/glass-card bg-white/g, 'glass-card bg-white dark:bg-gray-900/50 dark:border-gray-800');
  content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-gray-800');
  content = content.replace(/text-brand-purple-dark/g, 'text-brand-purple-dark dark:text-white');
  fs.writeFileSync(f, content);
});
