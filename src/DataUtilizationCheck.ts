const xml2js = require('xml2js'); // https://www.npmjs.com/package/xml2js   
const fs = require('fs'); // https://nodejs.org/api/fs.html 
const striptags = require('striptags'); // https://www.npmjs.com/package/striptags
import { promises as fsPromises } from 'fs';

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

interface MatrixArray2D {
  name: string;
  rows: string[][];
}

/* Function which executes the dataflow/usage check */
export async function getConnectionsList(folderPath: string, validConnection: string[]): Promise<MatrixArray2D[]> {
  const diagramsConnection: Diagram[] = [];

  try {
    const files = await fsPromises.readdir(folderPath);
    for (const file of files) {
      if (file.endsWith('.xml')) {
        if (!validConnection.includes(file)) {
          const filePath: string = folderPath + file;
          const data: string = await fsPromises.readFile(filePath, 'utf8');
          const result = await xml2js.parseStringPromise(data);

          let connectionSourceErrors: Connection[] = [];
          let connectionTargetErrors: Connection[] = [];
          let connectionTextErrors: Connection[] = [];
          let validConnection: Connection[] = [];

          const cells = result.mxfile.diagram[0].mxGraphModel[0].root[0].mxCell;

          cells.forEach(function (cell: { $: { vertex: string; edge: string; parent: string; value: string; source: string; target: string; id: string }; }) {
            if (cell.$.edge === '1') { // To check for all edges
              let targetCellId = cell.$.target;
              let cleanedTargetValue;
              let cleanedSourceValue;
              let sourceCellId = cell.$.source; // The ID of the source node is stored in sourceCellId 

              if (cell.$.source !== undefined && cell.$.source !== null) {
                do { // To fix an error in the Functions@Runtime because of the lifeline 
                  const sourceCell = cells.find((c: { $: { id: string }; }) => c.$.id === sourceCellId);
                  cleanedSourceValue = striptags(sourceCell.$.value);

                  const parentCell = cells.find((c: { $: { id: any }; }) => c.$.id === sourceCell.$.parent); // Find the parent node of the current cell
                  if (parentCell) {
                    sourceCellId = parentCell.$.id; // Update the ID of the parent node
                  } else {
                    break; // Exit the loop if no parent node is found
                  }
                } while (sourceCellId !== '1');
              }

              if (cell.$.target !== undefined && cell.$.target !== null) {
                do {
                  const targetCell = cells.find((c: { $: { id: string }; }) => c.$.id === targetCellId);
                  cleanedTargetValue = striptags(targetCell.$.value);

                  const parentCell = cells.find((c: { $: { id: any }; }) => c.$.id === targetCell.$.parent); // Find the parent node of the current cell
                  if (parentCell) {
                    targetCellId = parentCell.$.id; // Update the ID of the parent node
                  } else {
                    break; // Exit the loop if no parent node is found
                  }
                } while (targetCellId !== '1');
              }

              const edgeId = cell.$.id;
              const sourceCells = cells.find((c: { $: { parent: string; vertex: string }; }) => c.$.parent === edgeId && c.$.vertex === '1');
              let cleanedValueUsage;

              if (sourceCells !== undefined) {
                cleanedValueUsage = striptags(sourceCells.$.value);
                const splittedValue = cleanedValueUsage.split('%'); //If there is the metadata saved in the value (happend in an example), it will be removed
                cleanedValueUsage = splittedValue[0];
              }

              const connection: Connection = {
                source: cleanedSourceValue,
                target: cleanedTargetValue,
                description: cleanedValueUsage,
              };

              if (cleanedSourceValue === undefined) {
                connectionSourceErrors.push(connection);
              } else if (cleanedTargetValue === undefined) {
                connectionTargetErrors.push(connection);
              } else if (cleanedValueUsage === undefined) {
                connectionTextErrors.push(connection);
              } else {
                validConnection.push(connection);
              }
            }
          });

          if (validConnection.length > 0) {
            const diagram = {
              name: file,
              components: validConnection,
            };
            diagramsConnection.push(diagram);
          }
        }
      } else {
        console.log('Skipped: ' + file);
      }
    }

  } catch (err) {
    console.error(err);
  }
  const returnValue: MatrixArray2D[] = await checkSameConnectionDirection(diagramsConnection);

  return returnValue;
}



/* Function which checks, if there is a "use" or "dataflow" usage in the diagram
   If this is the case, the matrix will be created and updated in this function
*/
function checkSameConnectionDirection(diagramsConnection: Diagram[]): MatrixArray2D[] {
  let diagramsWithDifferentDirection: MatrixArray2D[] = [];

  for (const diagram of diagramsConnection) {
    let hasUse: boolean = false;
    let hasDataflow: boolean = false;

    for (const component of diagram.components) {
      if (component.description.includes("use")) {
        hasUse = true;
      }

      if (component.description.includes("dataflow")) {
        hasDataflow = true;
      }
    }

    if (hasUse || hasDataflow) {
      const matrix: string[][] = createMatrix([diagram]);
      const extractedData: ExtractedData[] = extractData(matrix, diagram);
      const updatedMatrix: Matrix = updateMatrix(matrix, extractedData);

      diagramsWithDifferentDirection.push({ name: diagram.name, rows: updatedMatrix });

    }
  }
  console.log(JSON.stringify(diagramsWithDifferentDirection));
  return diagramsWithDifferentDirection;
}

/* Function which creates the Matrix for the diagrams */
function createMatrix(diagramsConnection: Diagram[]) { //Hier wird die Matrix erstellt, anhand der Größe
  const matrix: string[][] = [];
  const components: Connection[] = diagramsConnection[0].components;
  const sources: string[] = [];
  const targets: string[] = [];

  components.forEach((diagram) => {
    const { source, target } = diagram;
    if (source && !sources.includes(source)) {
      sources.push(source);
    }
    if (target && !targets.includes(target)) {
      targets.push(target);
    }
  });

  sources.sort(); //Sodass die Reihenfolge immer gleich ist
  targets.sort();
  const combinedSet: Set<string> = new Set([...sources, ...targets]);
  const combined: string[] = Array.from(combinedSet);
  combined.sort();
  const size: number = combined.length;

  if (size === 2) {
    const component = components[0];
    matrix.push(["", component.source, component.target]);
    matrix.push([component.source, "", ""]);
    matrix.push([component.target, "", ""]);
    console.log(matrix);
  } else {
    const combinedSet: Set<string> = new Set([...sources, ...targets]);
    const combined: string[] = Array.from(combinedSet);
    combined.sort();
    for (let i = 0; i <= size; i++) {
      const row: string[] = [];
      for (let j = 0; j <= size; j++) {
        if (i === 0) {
          if (j === 0) {
            row.push("");
          } else {
            row.push(combined[j - 1]);
          }
        } else if (i > 0 && i <= size) {
          if (j === 0) {
            row.push(combined[i - 1]);
          } else {
            row.push("");
          }
        } else {
          row.push("");
        }
      }
      matrix.push(row);
    }
  }
  return matrix;
}

interface ExtractedData {
  x: number;
  y: number;
  string: string;
}

/* Function which updates the Matrix with the usages */
function extractData(firstData: string[][], secondData: Diagram): ExtractedData[] {
  const extractedData: ExtractedData[] = [];

  for (const component of secondData.components) {
    if (component.description.includes("dataflow")) {
      const x: number = firstData[0].indexOf(component.target);
      const y: number = firstData.findIndex(row => row[0] === component.source);

      if (x !== -1 && y !== -1) {
        extractedData.push({
          x,
          y,
          string: "dataflow"
        });
      }
    }
    if (component.description.includes("use")) {
      const x: number = firstData[0].indexOf(component.target);
      const y: number = firstData.findIndex(row => row[0] === component.source);

      if (x !== -1 && y !== -1) {
        extractedData.push({
          x,
          y,
          string: "use"
        });
      }
    }
  }

  return extractedData;
}
type Matrix = string[][];

function updateMatrix(matrix: Matrix, extractedData: ExtractedData[]): Matrix {
  const updatedMatrix: string[][] = [...matrix];

  extractedData.forEach((data) => {
    const { x, y, string } = data;
    if (x >= 0 && x < matrix[0].length && y >= 0 && y < matrix.length) {
      updatedMatrix[y][x] = string;
    }
  });

  return updatedMatrix;
}