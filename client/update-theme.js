// Script to batch update theme colors across all component files
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Color replacements
const replacements = [
    // Replace old green gradient with brand-gradient class
    {
        from: /bg-gradient-to-br from-\[#14532d\] to-\[#166534\]/g,
        to: 'bg-brand-gradient'
    },
    // Replace old green color references with accent
    {
        from: /text-\[#14532d\]/g,
        to: 'text-accent'
    },
    {
        from: /bg-\[#14532d\]/g,
        to: 'bg-accent'
    },
    {
        from: /border-\[#14532d\]/g,
        to: 'border-accent'
    },
    // Replace old teal color
    {
        from: /#26A69A/g,
        to: '#059669' // Darker emerald for gradient end
    }
];

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
        if (content.match(from)) {
            content = content.replace(from, to);
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && file !== 'node_modules') {
            walkDir(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            updateFile(filePath);
        }
    });
}

console.log('Starting theme update...');
walkDir(srcDir);
console.log('Theme update complete!');
