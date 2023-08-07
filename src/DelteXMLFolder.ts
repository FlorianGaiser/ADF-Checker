const fs = require('fs'); // https://nodejs.org/api/fs.html
const fsExtra = require('fs-extra'); // https://www.npmjs.com/package/fs-extra

/*Function to delete the folder with the xml files */
export async function deleteXMLFolder(xmlFolder: string) {
    if (fs.existsSync(xmlFolder)) {
        fsExtra.remove(xmlFolder)
            .then(() => {
                console.log('Folder successfully deleted.');
            })
            .catch((err: any) => {
                console.error('An error occurred while deleting the folder:', err);
            });
    }
}