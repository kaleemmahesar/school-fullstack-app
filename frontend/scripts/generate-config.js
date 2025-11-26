import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the school config file path from command line arguments
const configFilePath = process.argv[2];

if (!configFilePath) {
  console.error('Please provide a path to the school configuration JSON file');
  process.exit(1);
}

// Check if the config file exists
if (!fs.existsSync(configFilePath)) {
  console.error(`Configuration file not found: ${configFilePath}`);
  process.exit(1);
}

// Read and parse the configuration file
const configFile = fs.readFileSync(configFilePath, 'utf8');
const config = JSON.parse(configFile);

// Generate the JavaScript configuration file content
const configContent = `// School configuration - AUTO-GENERATED FILE
// This file is generated during the build process based on school configuration

export const SCHOOL_CONFIG = ${JSON.stringify(config, null, 2)};

export default SCHOOL_CONFIG;
`;

// Write the configuration to the src/config directory
const outputPath = path.join(__dirname, '..', 'src', 'config', 'schoolConfig.js');
fs.writeFileSync(outputPath, configContent);

console.log(`School configuration generated successfully at: ${outputPath}`);