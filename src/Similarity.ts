var stringSimilarity = require("string-similarity"); // https://www.npmjs.com/package/string-similarity
const config = require('./config.js'); // https://www.npmjs.com/package/config

const similarityPercentage = config.parameter.similarityPercentageParameter;

/* Interfaces */
interface Similarity {
  diagramName: string,
  element1: string,
  otherDiagramName: string,
  element2: string,
  similarity: number,
}

/* Function which executes checks the similarity */
export function findSimilarComponents(diagrams: { [key: string]: string[]; }[], toBeSkipped: String[]): Similarity[] {
  const similarComponents: Similarity[] = [];

  for (let i = 0; i < diagrams.length; i++) {
    const currentDiagram = diagrams[i];
    const diagramName: string = Object.keys(currentDiagram)[0];
    const components: string[] = currentDiagram[diagramName];

    for (let j = 0; j < components.length - 1; j++) {
      const element1: string = components[j];

      for (let o = i + 1; o < diagrams.length; o++) {
        const otherDiagram = diagrams[o];
        const otherDiagramName: string = Object.keys(otherDiagram)[0];
        const otherComponents: string[] = otherDiagram[otherDiagramName];

        for (let k = 0; k < otherComponents.length; k++) {
          const element2: string = otherComponents[k];

          if (!toBeSkipped.some(skip => skip.includes(element1)) && !toBeSkipped.some(skip => skip.includes(element2))) {
            const similarity: number = stringSimilarity.compareTwoStrings(element1, element2);

            if (similarity > similarityPercentage && similarity !== 1) {
              const alreadyAdded: boolean = similarComponents.some((item) => {
                return (
                  item.element1 === element1 &&
                  item.element2 === element2 &&
                  item.diagramName === diagramName &&
                  item.otherDiagramName === otherDiagramName
                );
              });

              if (!alreadyAdded) {
                similarComponents.push({
                  diagramName,
                  element1,
                  otherDiagramName,
                  element2,
                  similarity,
                });
              }
            }
          } else {
            console.log("Skipped: " + element1 + " and " + element2);
          }
        }
      }
    }
  }

  if (similarComponents.length > 0) {
    console.log("Similar components:");
    for (let i = 0; i < similarComponents.length; i++) {
      console.log(
        similarComponents[i].diagramName,
        "-",
        similarComponents[i].element1,
        "and",
        similarComponents[i].otherDiagramName,
        "-",
        similarComponents[i].element2,
        "with similarity:",
        similarComponents[i].similarity
      );
    }
  } else {
    console.log("No similar components found.");
  }

  return similarComponents;
}