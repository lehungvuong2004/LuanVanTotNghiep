const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    let filepath = path.join(dir, file);
    let stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (file !== 'node_size' && file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        walk(filepath, callback);
      }
    } else if (stat.isFile() && /\.(tsx|ts|js|jsx)$/.test(file)) {
      callback(filepath);
    }
  });
}

const targetDir = path.join(__dirname, 'src');
console.log(`Starting to comment out console statements in: ${targetDir}`);

let updatedCount = 0;

walk(targetDir, (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let lines = content.split(/\r?\n/);
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Match line that has console.log, console.error, console.warn, console.info, console.debug
    // but is not already commented out with //
    const match = line.match(/^(\s*)(console\.(log|error|warn|info|debug)\b.*)/);
    if (match) {
      const indent = match[1];
      const restOfLine = match[2];
      
      // Only comment out if it doesn't already start with // or /*
      const trimmed = restOfLine.trim();
      if (!trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        lines[i] = `${indent}// ${restOfLine}`;
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
    console.log(`Commented consoles in: ${path.relative(__dirname, filepath)}`);
    updatedCount++;
  }
});

console.log(`Done! Commented out consoles in ${updatedCount} files.`);
