var xml2js = require('xml2js'); // https://www.npmjs.com/package/xml2js
var striptags = require('striptags'); // https://www.npmjs.com/package/striptags
import { promises as fsPromises } from 'fs';
import { findSimilarComponents } from './Similarity';

/* Interfaces */
interface Diagram {
    name: string;
    usage: any[];
}

interface Similarity {
    diagramName: string,
    element1: string,
    otherDiagramName: string,
    element2: string,
    similarity: number,
}

/* Function which executes the usage similarity check */
export async function getUsageList(folderPath: string, toBeSkipped: String[]): Promise<Similarity[]> {
    const diagrams: Diagram[] = [];
    let returnValue: Similarity[] = [];

    try {
        const files = await fsPromises.readdir(folderPath);

        for (const file of files) {
            if (file.endsWith('.xml')) {
                const filePath: string = folderPath + file;
                const data: string = await fsPromises.readFile(filePath, 'utf8');
                const result = await xml2js.parseStringPromise(data);

                const cells = result.mxfile.diagram[0].mxGraphModel[0].root[0].mxCell;
                const usageList: String[] = [];

                cells.forEach(function (cell: { $: { vertex: string; parent: string; value: string; }; }) {
                    if (cell.$.vertex === '1' && cell.$.parent !== '1') { //Alle Knoten werden ausgegeben, welche als Parent-Knoten die ID 1 haben. ID 1 ist der Root-Knoten
                        const cleanedValue = striptags(cell.$.value); //Das Value-Attribut der Knoten wird von dem HTML-Tags bereinigt
                        if (cleanedValue) { //Das keine leeren Zeilen ausgegeben werden
                            const splittedValue = cleanedValue.split('%'); //Falls langer Text, warum auch immer
                            usageList.push(splittedValue[0]);
                        }
                    }
                });
                const diagram: Diagram = {
                    name: file,
                    usage: usageList
                };
                diagrams.push(diagram);
            }
        }
        diagrams.sort((a: Diagram, b: Diagram) => a.name.localeCompare(b.name));
        console.log("Meta Usage :");
        const metaUsage = diagrams.map((diagram: Diagram) => ({
            [diagram.name]: diagram.usage
        }));
        console.log(metaUsage);
        returnValue = findSimilarComponents(metaUsage, toBeSkipped);
    } catch (err) {
        console.error(err);
    }
    return returnValue;
}