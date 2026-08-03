const { execSync } = require('child_process');
const fs = require('fs');

// Get clean file from git
const headContent = execSync('git show HEAD:Smart-Kharcha-main/frontend/js/pages/profile.js', { encoding: 'utf8' });
const headLines = headContent.split('\n');

const currLines = fs.readFileSync('js/pages/profile.js', 'utf8').split('\n');

// The clean block from HEAD
const cleanStartLine = headLines.findIndex(l => l.includes(`icon.classList.remove('ph-eye-closed');`)) + 1;
const cleanEndLine = headLines.findIndex(l => l.includes(`document.getElementById('profile-member-since').textContent = memberSince;`));
const cleanBlock = headLines.slice(cleanStartLine, cleanEndLine);

// Find the garbled block in current file
const garbledStartLine = currLines.findIndex(l => l.includes(`icon.classList.remove('ph-eye-closed');`)) + 1;
const garbledEndLine = currLines.findIndex(l => l.includes(`document.getElementById('profile-member-since').textContent = memberSince;`));

// Replace the garbled block with the clean block
let newLines = [...currLines.slice(0, garbledStartLine), ...cleanBlock, ...currLines.slice(garbledEndLine)];

// Now revert the avatar update in save profile logic
const saveProfileAvatarBlockIndex = newLines.findIndex(l => l.includes(`const mainSpan = document.getElementById('profile-avatar-main');`));
if (saveProfileAvatarBlockIndex !== -1) {
    // Delete the 5 lines of new logic and replace with the original 1 line
    newLines.splice(saveProfileAvatarBlockIndex, 5, `            document.getElementById('profile-avatar').textContent = updated.name.charAt(0).toUpperCase();`);
}

fs.writeFileSync('js/pages/profile.js', newLines.join('\n'));
console.log('Restored profile.js successfully!');
