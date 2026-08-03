const fs = require('fs');
const headLines = fs.readFileSync('profile_head.js', 'utf8').split('\n');
const currLines = fs.readFileSync('js/pages/profile.js', 'utf8').split('\n');

const startIdx = 41;
const endIdx = 164;
const missingBlock = headLines.slice(startIdx, endIdx);

const modifiedBlock = [];
for (let line of missingBlock) {
    if (line.includes(`const avatarImg = document.getElementById('profile-avatar-img');`)) {
        modifiedBlock.push(`    const avatarImg = document.getElementById('profile-avatar-main-img');`);
    } else if (line.includes(`const avatarSpan = document.getElementById('profile-avatar');`)) {
        modifiedBlock.push(`    const avatarSpan = document.getElementById('profile-avatar-main');`);
        modifiedBlock.push(`    const navAvatarSpan = document.getElementById('profile-avatar');`);
    } else if (line.includes(`if (res.avatar) {`)) {
        modifiedBlock.push(line);
    } else if (line.includes(`avatarImg.src = \`http://localhost:5000\${res.avatar}\`;`)) {
        modifiedBlock.push(`                    if (avatarImg) { avatarImg.src = \`http://localhost:5000\${res.avatar}\`; avatarImg.classList.remove('hidden'); }`);
    } else if (line.includes(`avatarImg.classList.remove('hidden');`)) {
        // pass
    } else if (line.includes(`avatarSpan.classList.add('hidden');`)) {
        modifiedBlock.push(`                    if (avatarSpan) avatarSpan.classList.add('hidden');`);
        modifiedBlock.push(`                    if (navAvatarSpan) {`);
        modifiedBlock.push(`                        navAvatarSpan.style.backgroundImage = \`url(http://localhost:5000\${res.avatar})\`;`);
        modifiedBlock.push(`                        navAvatarSpan.style.backgroundSize = 'cover';`);
        modifiedBlock.push(`                        navAvatarSpan.style.backgroundPosition = 'center';`);
        modifiedBlock.push(`                        navAvatarSpan.textContent = '';`);
        modifiedBlock.push(`                    }`);
    } else if (line.includes(`const profileAvatarImg = document.getElementById('profile-avatar-img');`)) {
        modifiedBlock.push(`        const mainAvatarImg = document.getElementById('profile-avatar-main-img');`);
    } else if (line.includes(`const profileAvatarSpan = document.getElementById('profile-avatar');`)) {
        modifiedBlock.push(`        const mainAvatarSpan = document.getElementById('profile-avatar-main');`);
        modifiedBlock.push(`        const navAvatarSpan = document.getElementById('profile-avatar');`);
    } else if (line.includes(`if (user.avatar && profileAvatarImg && profileAvatarSpan) {`)) {
        modifiedBlock.push(`        if (user.avatar) {`);
    } else if (line.includes(`profileAvatarImg.src = \`http://localhost:5000\${user.avatar}\`;`)) {
        modifiedBlock.push(`            if (mainAvatarImg) { mainAvatarImg.src = \`http://localhost:5000\${user.avatar}\`; mainAvatarImg.classList.remove('hidden'); }`);
    } else if (line.includes(`profileAvatarImg.classList.remove('hidden');`)) {
        // pass
    } else if (line.includes(`profileAvatarSpan.classList.add('hidden');`)) {
        modifiedBlock.push(`            if (mainAvatarSpan) mainAvatarSpan.classList.add('hidden');`);
        modifiedBlock.push(`            if (navAvatarSpan) {`);
        modifiedBlock.push(`                navAvatarSpan.style.backgroundImage = \`url(http://localhost:5000\${user.avatar})\`;`);
        modifiedBlock.push(`                navAvatarSpan.style.backgroundSize = 'cover';`);
        modifiedBlock.push(`                navAvatarSpan.style.backgroundPosition = 'center';`);
        modifiedBlock.push(`                navAvatarSpan.textContent = '';`);
        modifiedBlock.push(`            }`);
    } else if (line.includes(`} else if (profileAvatarSpan) {`)) {
        modifiedBlock.push(`        } else {`);
        modifiedBlock.push(`            const initial = (user.name || 'U').charAt(0).toUpperCase();`);
    } else if (line.includes(`profileAvatarSpan.textContent = (user.name || 'U').charAt(0).toUpperCase();`)) {
        modifiedBlock.push(`            if (mainAvatarSpan) {`);
        modifiedBlock.push(`                mainAvatarSpan.textContent = initial;`);
        modifiedBlock.push(`                mainAvatarSpan.classList.remove('hidden');`);
        modifiedBlock.push(`            }`);
    } else if (line.includes(`if (profileAvatarImg) profileAvatarImg.classList.add('hidden');`)) {
        modifiedBlock.push(`            if (mainAvatarImg) mainAvatarImg.classList.add('hidden');`);
    } else if (line.includes(`profileAvatarSpan.classList.remove('hidden');`)) {
        modifiedBlock.push(`            if (navAvatarSpan) {`);
        modifiedBlock.push(`                navAvatarSpan.textContent = initial;`);
        modifiedBlock.push(`                navAvatarSpan.style.backgroundImage = 'none';`);
        modifiedBlock.push(`                navAvatarSpan.classList.remove('hidden');`);
        modifiedBlock.push(`            }`);
    } else {
        modifiedBlock.push(line);
    }
}

// In currLines, we need to find the correct index to insert.
// Line 41 is '                icon.classList.add('ph-eye');'
// But what is index 41 in currLines right now?
const insertIdx = currLines.findIndex(l => l.includes(`icon.classList.remove('ph-eye-closed');`)) + 1;

const newLines = [...currLines.slice(0, insertIdx), ...modifiedBlock, ...currLines.slice(insertIdx)];
fs.writeFileSync('js/pages/profile.js', newLines.join('\\n'));
console.log('Done!');
