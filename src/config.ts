module.exports = {
  /* Parameter */
  parameter: {
    similarityPercentageParameter: 0.90, // Enter the percentage of similarity between two components to be considered similar
    drawioexePathParameter: "C:/Program Files/draw.io/draw.io.exe", // Enter the path to the draw.io executable like "C:/Program Files/draw.io/draw.io.exe"
    diagrammsFolderPathParameter: "C:/Users/.../ADF-Checker/diagrams", //Enter the path to the folder containing the diagrams like "C:/Users/.../ADF-Checker/diagrams"
    xmlFolderPathParameter: "C:/Users/.../ADF-Checker/diagrams", // Enter the path to the folder containing the XML files like "C:/Users/.../ADF-Checker/diagrams/xml/"
    openHTMLFileParameter: true, // Enter true if you want to open the HTML file after the checks, otherwise enter false
  },

  /* Checks */
  keepXMLFilesCheck: {
    enabled: true //Enter true if you want to keep the XML files after the comparison, otherwise enter false
  },

  componentSimilarityCheck: {
    enabled: true, //Enter true if you want to compare the component names, otherwise enter false
    skip: [] //Enter the name of the componente you want to skip the component similarity check like ["component1", "component2]
  },

  usageSimilarityCheck: {
    enabled: true, //Enter true if you want to compare the usage names, otherwise enter false
    skip: []// Enter the name of the usage you want to skip the usage similarity check like ["usage1", "usage2]
  },

  validConnectionCheck: {
    enabled: true, //Enter true if you want to check if the connections are valid, otherwise enter false
    skip: [], //Enter the name of the diagramm you want to skip the valid connection check like ["diagramm1", "diagramm2]
  },

  connectionListCheck: {
    enabled: true, //Enter true if you want to create a List of the dataflow and use connections, otherwise enter false
    skip: []//Enter the name of the diagramm you want to skip the connection list check like ["diagramm1", "diagramm2]
  }
};