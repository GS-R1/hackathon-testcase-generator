/**
 * Fetch PBI Example
 *
 * This script fetches a PBI from Azure DevOps and saves it to the examples folder.
 * It uses the running server's API to fetch the work item, so the server must be running.
 *
 * Usage:
 *   node fetch-pbi-example.js <workItemId> [qualityLevel]
 *
 * Examples:
 *   node fetch-pbi-example.js 98067 good
 *   node fetch-pbi-example.js 12345 bad
 *   node fetch-pbi-example.js 67890 okay
 *
 * Quality Levels:
 *   good - Exemplary PBIs (well-written, clear, complete)
 *   okay - Acceptable PBIs (usable but could be improved)
 *   bad  - Poor PBIs (missing info, vague, unclear)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://localhost:3000';
const DEFAULT_PROJECT = 'Testwise';

async function fetchWorkItem(workItemId, qualityLevel = 'good') {
  return new Promise((resolve, reject) => {
    console.log(`Fetching work item ${workItemId} from project ${DEFAULT_PROJECT}...`);

    const url = `${SERVER_URL}/api/workitem/${workItemId}?project=${DEFAULT_PROJECT}`;

    http.get(url, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (!response.success || !response.data) {
            reject(new Error('Failed to fetch work item from server'));
            return;
          }

          const workItem = response.data;
          console.log(`✓ Successfully fetched work item ${workItemId}`);

          // Extract title for filename
          const title = workItem.fields['System.Title'] || 'untitled';
          const briefDescription = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50);

          const filename = `pbi-${workItemId}-${briefDescription}.json`;
          const filepath = path.join(__dirname, 'knowledge', 'examples', 'pbis', qualityLevel, filename);

          // Ensure directory exists
          const dir = path.dirname(filepath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(filepath, JSON.stringify(workItem, null, 2));

          console.log(`\n✓ Saved to: knowledge/examples/pbis/${qualityLevel}/${filename}`);
          console.log(`✓ Title: ${title}`);
          console.log(`✓ Quality Level: ${qualityLevel}`);
          console.log(`\nYou can now use this PBI as an example for quality assessment.`);

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error('Server is not running. Please start the server first: npm start'));
      } else {
        reject(error);
      }
    });
  });
}

// Get work item ID from command line argument
const workItemId = parseInt(process.argv[2]);
const qualityLevel = process.argv[3] || 'good';

if (!workItemId) {
  console.error('Usage: node fetch-pbi-example.js <workItemId> [qualityLevel]');
  console.error('');
  console.error('Examples:');
  console.error('  node fetch-pbi-example.js 98067 good');
  console.error('  node fetch-pbi-example.js 12345 bad');
  console.error('  node fetch-pbi-example.js 67890 okay');
  console.error('');
  console.error('Quality Levels:');
  console.error('  good - Exemplary PBIs (well-written, clear, complete)');
  console.error('  okay - Acceptable PBIs (usable but could be improved)');
  console.error('  bad  - Poor PBIs (missing info, vague, unclear)');
  process.exit(1);
}

if (!['good', 'okay', 'bad'].includes(qualityLevel)) {
  console.error(`Error: Invalid quality level '${qualityLevel}'`);
  console.error('Valid quality levels: good, okay, bad');
  process.exit(1);
}

fetchWorkItem(workItemId, qualityLevel)
  .catch(error => {
    console.error('\nError:', error.message);
    process.exit(1);
  });
