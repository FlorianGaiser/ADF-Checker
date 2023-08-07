/* In this class the code will be started */

/* Imports */
const config = require('./config.js');
import { exportToXML } from './ExportToXML.js';
import { deleteXMLFolder } from './DelteXMLFolder.js';
import { getComponentenList } from './ComponentSimilarityCheck.js';
import { getUsageList } from './UsageSimilarityCheck.js';
import { getValidConnection } from './ValidConnectionCheck.js';
import { exportToHTML } from './CreateHTMLFile.js';
import { getConnectionsList } from './DataUtilizationCheck.js';

/* checks */
const keepXMLFilesCheck: boolean = config.keepXMLFilesCheck.enabled;
const componentSimilarityCheck: boolean = config.componentSimilarityCheck.enabled;
const usageSimilarityCheck: boolean = config.usageSimilarityCheck.enabled;
const validConnectionCheck: boolean = config.validConnectionCheck.enabled;
const connectionListCheck: boolean = config.connectionListCheck.enabled;

/* Interfaces */

interface Diagram {
    name: string;
    components: Connection[];
}

interface Connection {
    source: string;
    target: string;
    description: string;
}

interface Similarity {
    diagramName: string,
    element1: string,
    otherDiagramName: string,
    element2: string,
    similarity: number,
}

interface MatrixArray2D {
    name: string;
    rows: string[][];
}

/* All variables */
const folderPath: string = config.parameter.diagrammsFolderPathParameter;
const savePath: string = config.parameter.xmlFolderPathParameter;
const drawioExePath: string = config.parameter.drawioexePathParameter;
const openHTMLFile: string = config.parameter.openHTMLFileParameter;

const skipComponentSimilarityCheck: string[] = config.componentSimilarityCheck.skip;
const skipUsageSimilarityCheck: string[] = config.usageSimilarityCheck.skip;
const skipValidConnectionCheck: string[] = config.validConnectionCheck.skip;
const skipConnectionCheck: string[] = config.connectionListCheck.skip;
const xmlFolder: string = config.parameter.xmlFolderPathParameter;

let componentList: Similarity[];
let usageList: Similarity[];
let connectionList: MatrixArray2D[];
let invalidConnectionList: Diagram[];


/* Function to start the programm */
async function main() {
    console.log("Started the program");
    console.log("Exporting the diagrams to XML files")
    await exportToXML(folderPath, savePath, drawioExePath); // Export the diagrams to XML files in the folder "xml"
    console.log("Exporting the diagrams to XML files finished")

    if (componentSimilarityCheck) {
        console.log("Component similarity will be checked");
        componentList = await getComponentenList(xmlFolder, skipComponentSimilarityCheck); // Get the components from the XML files
    } else {
        console.log("Component similarity will not be checked");
        componentList = [];
    }

    if (usageSimilarityCheck) {
        console.log("Usage similarity will be checked");
        usageList = await getUsageList(xmlFolder, skipUsageSimilarityCheck)
    } else {
        console.log("Usage similarity will not be checked");
        usageList = [];
    }

    if (validConnectionCheck) {
        console.log("Valid connection will be checked");
        invalidConnectionList = await getValidConnection(xmlFolder, skipValidConnectionCheck);
    } else {
        console.log("Valid connection will not be checked");
        invalidConnectionList = [];
    }

    if (connectionListCheck) {
        console.log("Valid connection will be checked");
        connectionList = await getConnectionsList(xmlFolder, skipConnectionCheck);
    } else {
        console.log("Valid connection will not be checked");
        connectionList = [];
    }

    if (keepXMLFilesCheck) { // Check if the XML files should be kept or deleted
        console.log("XML files will be kept");
    } else {
        console.log("XML files will be deleted");
        await deleteXMLFolder(xmlFolder);
    }

    const variables = {
        xmlFolderPath: xmlFolder,
        similarComponents: componentList,
        similarUsage: usageList,
        similarConnections: connectionList,
        invalidConnections: invalidConnectionList
    }

    await exportToHTML(variables, openHTMLFile); // Create the HTML file with the results
    console.log("Finished the program");
}

main(); // Start the program