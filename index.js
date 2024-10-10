#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectName = process.argv[2] || 'my-next-pwa';

// Run the create-next-app command with prompts
console.log('Creating a new Next.js app with PWA setup...');
execSync(`npx create-next-app@latest ${projectName}`, { stdio: 'inherit' });

const projectPath = path.join(process.cwd(), projectName);

// Copy `next.config.js` from src to the new project
fs.copyFileSync(
    path.join(__dirname, 'src', 'next.config.mjs'),
    path.join(projectPath, 'next.config.mjs')
);

// Install @serwist/next and serwist as dependencies
console.log('Installing @serwist/next and serwist...');
execSync(`cd ${projectName} && npm install @serwist/next@latest`, { stdio: 'inherit' });
execSync(`cd ${projectName} && npm install -D serwist@latest`, { stdio: 'inherit' });

// Ensure the `public` directory exists, then copy the manifest file
const publicDir = path.join(projectPath, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Copy `manifest.json` from src to the public directory
fs.copyFileSync(
    path.join(__dirname, 'src', 'manifest.json'),
    path.join(publicDir, 'manifest.json')
);

// Copy `icon.svg` from src to the public directory
fs.copyFileSync(
    path.join(__dirname, 'src', 'icon.svg'),
    path.join(publicDir, 'icon.svg')
);

// Copy `sw.ts` from src to the root of the new project
fs.copyFileSync(
    path.join(__dirname, 'src', 'sw.ts'),
    path.join(projectPath, 'sw.ts')
);

// Function to update the layout.tsx file with new metadata
function updateLayoutMetadata() {
    const possiblePaths = [
        // Typescript
        path.join(projectPath, 'src', 'app', 'layout.tsx'),
        path.join(projectPath, 'app', 'layout.tsx'),
        path.join(projectPath, 'layout.tsx'),

        // Javascript
        path.join(projectPath, 'src', 'app', 'layout.js'),
        path.join(projectPath, 'app', 'layout.js'),
        path.join(projectPath, 'layout.js')
    ];

    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            let fileContent = fs.readFileSync(filePath, 'utf8');

            if (filePath.endsWith('.tsx')) {
                // Regex to find and replace the metadata export
                const newMetadata = `
export const metadata: Metadata = {
    manifest: "/manifest.json",
    title: "Next.js PWA",
    description: "Welcome to the Next.js Progressive Web App!",
};`;

                fileContent = fileContent.replace(/export const metadata: Metadata = \{[^}]*\};/, newMetadata.trim());

            } else if (filePath.endsWith('.js')) {
                const newMetadata = `
const metadata = {
    manifest: "/manifest.json",
    title: "Next.js PWA",
    description: "Welcome to the Next.js Progressive Web App!",
};`;

                fileContent = fileContent.replace(/const metadata = \{[^}]*\};/, newMetadata.trim());
            }

            fs.writeFileSync(filePath, fileContent, 'utf8');
            console.log(`Updated metadata in ${filePath}`);
            
            break; // Exit after the first match
        }
    }
}

// Update the layout.tsx metadata
updateLayoutMetadata();

console.log(`\nPWA setup complete! Your Next.js PWA is ready to go.`);
