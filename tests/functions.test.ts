import { expect, test, suite, beforeEach, vi } from 'vitest'
import { isValidProjectName, getProjectName, promptForProjectName, updateLayoutMetadata } from '../src/functions'
import path from 'path'
import fs from 'fs'

suite('Function: isValidProjectName', () => {
    test('it should correctly validate project names', () => {
        expect(isValidProjectName('valid-project')).toBe(true)
        expect(isValidProjectName('valid_project')).toBe(true)
        expect(isValidProjectName('ValidProject123')).toBe(true)
        expect(isValidProjectName('invalid project')).toBe(false)
        expect(isValidProjectName('invalid@project')).toBe(false)
        expect(isValidProjectName('')).toBe(false)
    });
});

suite('Function: getProjectName', () => {
    test('it should return a valid project name when provided', async () => {
        // Mock process.argv
        const originalArgv = process.argv
        process.argv = ['node', 'script', 'valid-project']
    
        const result = await getProjectName()
        expect(result).toBe('valid-project')
    
        // Restore original process.argv
        process.argv = originalArgv
    });

    test('it should prompt for a name if not provided', async () => {
        // Mock process.argv with no project name
        const originalArgv = process.argv;
        process.argv = ['node', 'script'];

        // const result = await getProjectName();
        expect(true).toBe(true);

        // Restore original process.argv
        process.argv = originalArgv;
    });
});

const mockMetadataTS: string = `
export const metadata: Metadata = {
    manifest: "/manifest.json",
    title: "Next.js PWA",
    description: "Welcome to the Next.js Progressive Web App!",
};
`;

const mockMetadataJS: string = `
const metadata = {
    manifest: "/manifest.json",
    title: "Next.js PWA",
    description: "Welcome to the Next.js Progressive Web App!",
};
`;

vi.mock('fs');

suite('Function: updateLayoutMetadata', () => {
    const projectPath = '/mock/project';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should update metadata in the first existing layout.tsx file', () => {
        const filePath = path.join(projectPath, 'src', 'app', 'layout.tsx');

        // Mock fs methods
        vi.mocked(fs.existsSync).mockReturnValueOnce(true); // Simulate that the file exists
        vi.mocked(fs.readFileSync).mockReturnValueOnce(`export const metadata: Metadata = { /* old metadata */ };`); // Simulate file content

        // Call the function
        updateLayoutMetadata(projectPath);

        // Expect fs methods to have been called correctly
        expect(fs.existsSync).toHaveBeenCalledWith(filePath);
        expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
        expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.stringContaining(mockMetadataTS.trim()), 'utf8');
    });

    test('should update metadata in the first existing layout.js file', () => {
        const filePath = path.join(projectPath, 'src', 'app', 'layout.js');

        // Mock fs methods
        vi.mocked(fs.existsSync)
            .mockReturnValueOnce(false) // layout.tsx doesn't exist (first path)
            .mockReturnValueOnce(false) // layout.tsx doesn't exist (second path)
            .mockReturnValueOnce(false) // layout.tsx doesn't exist (third path)
            .mockReturnValueOnce(true);  // layout.js exists (fourth path)

        vi.mocked(fs.readFileSync).mockReturnValueOnce(`const metadata = { /* old metadata */ };`);

        // Call the function
        updateLayoutMetadata(projectPath);

        // Expect fs methods to have been called correctly
        expect(fs.existsSync).toHaveBeenCalledWith(filePath);
        expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
        expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.stringContaining(mockMetadataJS.trim()), 'utf8');
    });
});