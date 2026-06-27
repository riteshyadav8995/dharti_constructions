const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace single-quote strings: 'http://localhost:5000/api/...' -> `${import.meta.env.VITE_API_URL}/...`
  content = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, '`${import.meta.env.VITE_API_URL}$1`');
  
  // Replace double-quote strings: "http://localhost:5000/api/..." -> `${import.meta.env.VITE_API_URL}/...`
  content = content.replace(/"http:\/\/localhost:5000\/api([^"]*)"/g, '`${import.meta.env.VITE_API_URL}$1`');
  
  // Replace backtick strings: `http://localhost:5000/api/...` -> `${import.meta.env.VITE_API_URL}/...`
  content = content.replace(/`http:\/\/localhost:5000\/api([^`]*)`/g, '`${import.meta.env.VITE_API_URL}$1`');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
};

const walkSync = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkSync(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      replaceInFile(filePath);
    }
  });
};

walkSync(directoryPath);
console.log('Replacement complete.');
