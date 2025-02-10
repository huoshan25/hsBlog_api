const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/migrations');
const destDir = path.join(__dirname, '../dist/migrations');

// 创建目标目录
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 复制文件
fs.readdirSync(srcDir).forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file.replace('.ts', '.js'));
  fs.copyFileSync(srcFile, destFile);
});

console.log('Migrations copied successfully!');