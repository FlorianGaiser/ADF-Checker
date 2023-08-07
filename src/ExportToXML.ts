const { execSync } = require('child_process'); // https://nodejs.org/api/child_process.html
const fs = require('fs'); // https://nodejs.org/api/fs.html
const path = require('path'); // https://nodejs.org/api/path.html

/* Function which executes the konversion process to xml files */
export async function exportToXML(folderPath: string, savePath: string, drawioExePath: string) {
    function ensureDirectoryExists(directoryPath: string) {
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
            console.log(`Folder created: ${directoryPath}`);
        }
    }

    const xmlFolderPath = path.join(folderPath, 'xml');
    ensureDirectoryExists(xmlFolderPath);
    findDrawioSVGFiles(folderPath);

    /* Function which finds the .drawio.svg files and converts them */
    function findDrawioSVGFiles(folderPath: string) {
        const files = fs.readdirSync(folderPath);

        files.forEach((file: string) => {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                findDrawioSVGFiles(filePath); // Durchsuche den Unterordner rekursiv
            } else {
                if (file.endsWith('.drawio.svg')) {
                    const exportCommand = `"${drawioExePath}" --export "${filePath}" --format xml --output "${savePath}"`;
                    execSync(exportCommand);
                    console.log(`File exported: ${filePath}`);
                }
            }
        });
    }
}

