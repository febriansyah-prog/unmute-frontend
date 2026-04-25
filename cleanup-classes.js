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
  content = content.replace(/dark:text-gray-400 dark:text-gray-500/g, 'dark:text-gray-400');
  content = content.replace(/className="bg-white w-full max-w-md/g, 'className="bg-white dark:bg-gray-900 w-full max-w-md');
  content = content.replace(/className="w-full bg-gray-50/g, 'className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white');
  content = content.replace(/className="mb-6 p-4 rounded-2xl bg-gray-50/g, 'className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800');
  fs.writeFileSync(f, content);
});
