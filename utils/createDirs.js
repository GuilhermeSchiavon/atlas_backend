const fs = require('fs');
const path = require('path');

const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/publications',
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Diretório criado: ${dir}`);
    }
  });
};

module.exports = { createUploadDirs };