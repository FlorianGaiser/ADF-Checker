const xml2js = require('xml2js'); // https://www.npmjs.com/package/xml2js
const striptags = require('striptags'); // https://www.npmjs.com/package/striptags
import { promises as fsPromises } from 'fs';
import { findSimilarComponents } from './Similarity';

/* Interfaces */
interface Diagram {
  name: string;
  components: any[];
}

interface Similarity {
  diagramName: string;
  element1: string;
  otherDiagramName: string;
  element2: string;
  similarity: number;
}

/* Function which executes the component similarity check */
export async function getComponentenList(folderPath: string, toBeSkipped: String[]): Promise<Similarity[]> {
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
        const componentenList: String[] = [];

        cells.forEach(function (cell: { $: { vertex: string; parent: string; value: any } }) {
          if (cell.$.vertex === '1' && cell.$.parent === '1') {
            const cleanedValue = striptags(cell.$.value);
            if (cleanedValue) {
              componentenList.push(cleanedValue);
            }
          }
        });

        const diagram: Diagram = {
          name: file,
          components: componentenList
        };
        diagrams.push(diagram);
      }
    }
    diagrams.sort((a: Diagram, b: Diagram) => a.name.localeCompare(b.name));
    console.log("Meta Component:");
    const metaComponents = diagrams.map((diagram: Diagram) => ({
      [diagram.name]: diagram.components
    }));
    console.log(metaComponents);
    returnValue = findSimilarComponents(metaComponents, toBeSkipped);
  } catch (err) {
    console.error(err);
  }
  return returnValue;
}