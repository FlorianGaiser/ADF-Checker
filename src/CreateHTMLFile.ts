import { writeFile } from 'fs'; // https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
import { promisify } from 'util'; // https://nodejs.org/api/util.html#util_util_promisify_original
import { exec } from 'child_process'; // https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
const writeFileAsync = promisify(writeFile);

/* Function which executes the export process */
export async function exportToHTML(variables: Record<string, any>, openFileCheck: string): Promise<void> {
  const currentTimeStamp: string = getCurrentTimestamp();
  const html: string = generateHTML(variables, currentTimeStamp);
  const filePath: string = `./results/${currentTimeStamp}.html`;
  await saveHTMLToFile(html, filePath);
  if (openFileCheck) {
    await openFile(filePath);
  }
}

/* Function to create the HTML file */
function generateHTML(variables: Record<string, any>, currentTimeStamp: string): string {
  const folderPath: string = variables.xmlFolderPath;
  const similarComponents = variables.similarComponents;
  const similarUsage = variables.similarUsage;
  const similarConnections = variables.similarConnections;
  const invalidConnections = variables.invalidConnections;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>ADF-Check</title>
        <style>
    table {
      border-collapse: collapse;
      width: 100%;
    }
    
    th, td {
      border: 1px solid black;
      padding: 8px;
      text-align: left;
    }
    
    tbody tr:nth-child(even) {
      background-color: #f2f2f2;
    }
  </style>
      </head>
      <body>
        <h1>ADF-Check from ${currentTimeStamp}</h1>
        <p>The diagrams are saved in: ${folderPath}</p>
        <h1>Similarity Report</h1>
  
  <h2>Component Similarities:</h2>
  <table>
    <thead>
      <tr>
        <th>Diagram Name</th>
        <th>Element 1</th>
        <th>Other Diagram Name</th>
        <th>Element 2</th>
        <th>Similarity</th>
      </tr>
    </thead>
    <tbody>
      ${similarComponents.map((similarity: { diagramName: string; element1: string; otherDiagramName: string; element2: string; similarity: string; }) => `
        <tr>
          <td>${similarity.diagramName}</td>
          <td>${similarity.element1}</td>
          <td>${similarity.otherDiagramName}</td>
          <td>${similarity.element2}</td>
          <td>${similarity.similarity}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>



  <h2>Usage Similarities:</h2>
  <table>
    <thead>
      <tr>
        <th>Diagram Name</th>
        <th>Element 1</th>
        <th>Other Diagram Name</th>
        <th>Element 2</th>
        <th>Similarity</th>
      </tr>
    </thead>
    <tbody>
      ${similarUsage.map((similarity: { diagramName: string; element1: string; otherDiagramName: string; element2: string; similarity: string; }) => `
        <tr>
          <td>${similarity.diagramName}</td>
          <td>${similarity.element1}</td>
          <td>${similarity.otherDiagramName}</td>
          <td>${similarity.element2}</td>
          <td>${similarity.similarity}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Invalid Connections:</h2>
  ${invalidConnections.map((diagram: { name: string; components: { source: string; target: string; description: string; }[]; }) => `
    <h3>${diagram.name}</h3>  
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Target</th>
              <th>Missing connection description</th>
            </tr>
          </thead>
          <tbody>

              ${diagram.components.map((connection: { source: string, target: string; description: string }) => `
                <tr>
                  <td>${connection.source}</td>
                  <td>${connection.target}</td>
                  <td>${connection.description}</td>
                </tr>
              `).join('')}

          </tbody>
        </table>
        `).join('')}


        <h2>Connection Similarities:</h2>
        ${similarConnections.map((similarConnection: { name: string; rows: string[][]; }) => `
          <h3>${similarConnection.name}</h3>  
          <table>
            <tbody>
              ${similarConnection.rows.map((row) => `
                <tr>
                  ${row.map((cell) => `
                    <td>${cell || ''}</td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}

        
      </body>
    </html>
  `;
}

/* Function to create the Timestamp */
function getCurrentTimestamp(): string {
  const date: Date = new Date();
  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, '0');
  const day: string = String(date.getDate()).padStart(2, '0');
  const hours: string = String(date.getHours()).padStart(2, '0');
  const minutes: string = String(date.getMinutes()).padStart(2, '0');
  const seconds: string = String(date.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
}

/* Function to save he HTML file */
async function saveHTMLToFile(html: string, filePath: string): Promise<void> {
  try {
    await writeFileAsync(filePath, html);
    console.log(`HTML file saved successfully at ${filePath}`);
  } catch (error) {
    console.error('Failed to save HTML file:', error);
    throw error;
  }
}

/* Function to automatically open the HTML file in the browser */
async function openFile(filePath: string): Promise<void> {
  try {
    const command = process.platform === 'win32' ? 'start' : 'open';
    exec(`${command} ${filePath}`);
    console.log(`HTML file opened successfully.`);
  } catch (error) {
    console.error('Failed to open HTML file:', error);
    throw error;
  }
}
