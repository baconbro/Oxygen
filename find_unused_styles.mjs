import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir, []).filter(f => f.match(/\.(js|jsx|ts|tsx)$/));
const stylesFiles = allFiles.filter(f => f.endsWith('Styles.js') || f.endsWith('Styles.ts'));

console.log(`Analyzing ${stylesFiles.length} Styles.js/ts files for usage...`);

let unusedFiles = [];
for (const styleFile of stylesFiles) {
    const dir = path.dirname(styleFile);
    const dirName = path.basename(dir);

    let isImported = false;

    for (const otherFile of allFiles) {
        if (otherFile === styleFile) continue;
        const content = fs.readFileSync(otherFile, 'utf8');

        // If the file is in the same directory, check if it imports './Styles'
        if (path.dirname(otherFile) === dir) {
            if (content.includes("from './Styles'") ||
                content.includes('from "./Styles"') ||
                content.includes("import * as Styles from './Styles'") ||
                content.includes("import Styles from './Styles'")) {
                isImported = true;
                break;
            }
        } else {
            // If it's outside, it might import it via 'components/common/Button/Styles'
            if (content.includes(`${dirName}/Styles`)) {
                isImported = true;
                break;
            }
        }
    }

    if (!isImported) {
        unusedFiles.push(styleFile);
    }
}

console.log(`Found ${unusedFiles.length} completely unreferenced Styles.js/ts files.`);
for (const file of unusedFiles) {
    console.log('Deleting:', file);
    fs.unlinkSync(file);
}
console.log('Done.');
