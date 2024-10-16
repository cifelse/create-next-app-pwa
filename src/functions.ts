import readline from 'readline';
import fs from 'fs';
import path from 'path';

export const metadataTS: string = `
export const metadata: Metadata = {
    manifest: "/manifest.json",
    title: "Next.js PWA",
    description: "Welcome to the Next.js Progressive Web App!",
};
`;

export const metadataJS: string = `
const metadata = {
    manifest: "/manifest.json",
    title: "Next.js PWA",
    description: "Welcome to the Next.js Progressive Web App!",
};
`;

// Function to check if the project name is valid
export function isValidProjectName(name: string): boolean {
    return /^[a-zA-Z0-9-_]+$/.test(name);
}

// Function to prompt for project name
export function promptForProjectName(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Please enter a project name: ', (answer: string) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

export async function getProjectName(): Promise<string> {
    // Get the project name from the command line arguments and convert it to lowercase
    let projectName: string | undefined = process.argv[2];

    while (!projectName || !isValidProjectName(projectName)) {
        if (projectName) {
            console.log('Invalid project name. Please use only letters, numbers, hyphens, and underscores.');
        }
        projectName = await promptForProjectName();
    }

    projectName = projectName.toLowerCase();

    console.clear();
    console.log(`Creating Next.js PWA project: ${projectName} \n`);

    return projectName;
}

// Function to update the layout.tsx file with new metadata
export async function updateLayoutMetadata(projectPath: string): Promise<void> {
    const possiblePaths: string[] = [
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
            let fileContent: string = fs.readFileSync(filePath, 'utf8');

            // Regex to find and replace the metadata export
            if (filePath.endsWith('.tsx')) {
                fileContent = fileContent.replace(/export const metadata: Metadata = \{[^}]*\};/, metadataTS.trim());
            } 
            else if (filePath.endsWith('.js')) {
                fileContent = fileContent.replace(/const metadata = \{[^}]*\};/, metadataJS.trim());
            }

            fs.writeFileSync(filePath, fileContent, 'utf8');
            console.log(`Updated metadata in ${filePath}`);
            
            break; // Exit after the first match
        }
    }
}
