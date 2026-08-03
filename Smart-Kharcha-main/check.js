const fs = require('fs');
const html = fs.readFileSync('frontend/calendar.html', 'utf8');
const js = fs.readFileSync('frontend/js/pages/calendar.js', 'utf8');
const regex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const missing = [];
while ((match = regex.exec(js)) !== null) {
  if (!html.includes('id="' + match[1] + '"') && !html.includes("id='" + match[1] + "'") && !html.includes(match[1])) {
    missing.push(match[1]);
  }
}
console.log([...new Set(missing)]);
