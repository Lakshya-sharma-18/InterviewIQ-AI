const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const jsFiles = [
  'admin.js',
  'forgot-password.js',
  'history.js',
  'interview.js',
  'login.js',
  'main.js',
  'payment-history.js',
  'pricing.js',
  'reset-password.js',
  'signup.js'
];

jsFiles.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Clean up any mangled constants from previous bad replacement
  content = content.replace(/const API_BASE_URL = import\.meta\.env\.VITE_API_URL \|\| `\$\{API_BASE_URL\}`;/g, '');
  content = content.replace(/const API_BASE_URL = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:8080';\n/g, '');
  
  // Replace 'http://localhost:8080/...' with `${API_BASE_URL}/...`
  // Make sure not to replace localhost in the header, so inject header AFTER replace
  content = content.replace(/'http:\/\/localhost:8080([^']*)'/g, '`${API_BASE_URL}$1`');
  
  // Inject the API_BASE_URL definition at the very top
  const header = `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';\n`;
  content = header + content.trim();
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
