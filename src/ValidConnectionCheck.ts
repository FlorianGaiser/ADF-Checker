const xml2js = require('xml2js'); // https://www.npmjs.com/package/xml2js
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

/* Function which executes the valid Connection check */
export async function getValidConnection(folderPath: string, validConnection: string[]): Promise<Diagram[]> {
  const diagramsError: Diagram[] = [];

  try {
    const files: string[] = await fsPromises.readdir(folderPath);
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
            if (cell.$.edge === '1') { // Alle Kanten werden ausgegeben
              let targetCellId: string = cell.$.target;
              let sourceCellId: string = cell.$.source; // Die ID des Quellknotens wird in sourceCellId gespeichert
              let cleanedTargetValue;
              let cleanedSourceValue;

              if (cell.$.source !== undefined && cell.$.source !== null) {
                do { // Das muss gemacht werden, da im Functions@Runtime auf der Lifeline eine Linie ist, welche ansonsten als Parent erkannt wird, welche keine Value hat. Anosnten kommt undefined raus
                  const sourceCell = cells.find((cell: { $: { id: string }; }) => cell.$.id === sourceCellId); // Der Value des Quellknoten wird anhand der ID gesucht und gespeichert
                  cleanedSourceValue = striptags(sourceCell.$.value); // Der gespeicherte Value wird von HTML-Tags bereinigt

                  const parentCell = cells.find((cell: { $: { id: string }; }) => cell.$.id === sourceCell.$.parent); // Den Elternknoten der aktuellen Zelle suchen
                  if (parentCell) {
                    sourceCellId = parentCell.$.id; // Die ID des Elternknotens aktualisieren
                  } else {
                    break; // Schleife beenden, wenn kein Elternknoten gefunden wurde
                  }
                } while (sourceCellId !== '1');
              }

              if (cell.$.target !== undefined && cell.$.target !== null) {
                do {
                  const targetCell = cells.find((cell: { $: { id: string }; }) => cell.$.id === targetCellId);
                  cleanedTargetValue = striptags(targetCell.$.value);

                  const parentCell = cells.find((cell: { $: { id: string }; }) => cell.$.id === targetCell.$.parent); // Den Elternknoten der aktuellen Zelle suchen
                  if (parentCell) {
                    targetCellId = parentCell.$.id; // Die ID des Elternknotens aktualisieren
                  } else {
                    break; // Schleife beenden, wenn kein Elternknoten gefunden wurde
                  }
                } while (targetCellId !== '1');
              }

              /*
              Dadruch das die Usage beziehungen nicht direkt an der Kante/dem Pfeil ist, kann auf diese nicht direkt zugegriffen werden.
              Das Textfeld hat aber als Parent die ID der Kante. Diese nutzen wir, um die Usage zu finden.
              Außerdem hat jedes Textfeld vertex="1", was ebenfalls geprüft wird.
              */

              const edgeId: string = cell.$.id; // Die ID der Kante wird in edgeId gespeichert
              const sourceCells = cells.find((c: { $: { parent: string; vertex: string }; }) => c.$.parent === edgeId && c.$.vertex === '1');
              let cleanedValueUsage;

              if (sourceCells !== undefined) {
                cleanedValueUsage = striptags(sourceCells.$.value);
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

          if (connectionSourceErrors.length > 0 || connectionTargetErrors.length > 0 || connectionTextErrors.length > 0) {
            const diagram: Diagram = {
              name: file,
              components: [...connectionSourceErrors, ...connectionTargetErrors, ...connectionTextErrors],
            };
            diagramsError.push(diagram);
          }
        }
      } else {
        console.log('Skipped: ' + file);
      }
    }

    console.log('Errors:');
    diagramsError.forEach((diagram) => {
      console.log('The Error is in ' + diagram.name);
      diagram.components.forEach((connection) => {
        console.log('Source: ' + connection.source + ' | Target: ' + connection.target + ' | Missing connection description: ' + connection.description);
      });
      console.log('---');
    });
  } catch (err) {
    console.error(err);
  }

  return diagramsError;
}
