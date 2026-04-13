const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const azdev = require('azure-devops-node-api');
const { WorkItemExpand } = require('azure-devops-node-api/interfaces/WorkItemTrackingInterfaces');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { fromIni } = require('@aws-sdk/credential-provider-ini');

const app = express();
const PORT = 3000;

// Check if Angular build exists
const distPath = path.join(__dirname, 'dist/pbi-pr-analyzer/browser/index.html');
if (!fs.existsSync(distPath)) {
  console.error('');
  console.error('============================================');
  console.error('  ERROR: Angular build not found!');
  console.error('============================================');
  console.error('');
  console.error('The Angular application has not been built yet.');
  console.error('');
  console.error('Please run: npm run build');
  console.error('');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const DEFAULT_ORG = 'https://dev.azure.com/gl-development';
const DEFAULT_PROJECT = 'Testwise';
const AZURE_DEVOPS_RESOURCE_ID = '499b84ac-1321-427f-aa17-267ca6975798';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_PROFILE = process.env.AWS_PROFILE || 'ai-tools-prod';
const BEDROCK_MODEL_ID = process.env.ANTHROPIC_DEFAULT_OPUS_MODEL || 'us.anthropic.claude-opus-4-6-v1';

// Helper function to get Azure CLI access token
function getAzureToken() {
  try {
    const result = execSync(`az account get-access-token --resource ${AZURE_DEVOPS_RESOURCE_ID}`, {
      encoding: 'utf-8',
      timeout: 10000
    });
    const tokenData = JSON.parse(result);
    return tokenData.accessToken;
  } catch (error) {
    throw new Error('Azure CLI not logged in. Please run "az login" first.');
  }
}

// Helper function to get Bedrock client
function getBedrockClient() {
  try {
    const client = new BedrockRuntimeClient({
      region: AWS_REGION,
      credentials: fromIni({ profile: AWS_PROFILE })
    });
    return client;
  } catch (error) {
    throw new Error('Failed to create Bedrock client. Ensure AWS credentials are configured.');
  }
}

// Helper function to call Claude via Bedrock
async function invokeClaudeOnBedrock(prompt) {
  const client = getBedrockClient();

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload)
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.content[0].text;
}

// Check Azure CLI authentication status
function checkAzureCliAuth() {
  try {
    execSync('az account show', { encoding: 'utf-8', timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// API Routes

// Get settings/status
app.get('/api/settings', (req, res) => {
  res.json({
    azureDevOpsOrg: DEFAULT_ORG,
    defaultProject: DEFAULT_PROJECT,
    defaultRepository: '',
    azureCliAuthenticated: checkAzureCliAuth(),
    claudeApiKeySource: 'bedrock',
    awsRegion: AWS_REGION,
    awsProfile: AWS_PROFILE,
    bedrockModelId: BEDROCK_MODEL_ID
  });
});

// Get Work Item
app.get('/api/workitem/:id', async (req, res) => {
  try {
    const workItemId = parseInt(req.params.id);
    const project = req.query.project || DEFAULT_PROJECT;

    console.log(`Fetching work item ${workItemId} from project ${project}...`);

    const token = getAzureToken();
    const authHandler = azdev.getBearerHandler(token);
    const connection = new azdev.WebApi(DEFAULT_ORG, authHandler);
    const witApi = await connection.getWorkItemTrackingApi(project);

    // getWorkItem(id, fields, asOf, expand)
    const workItem = await witApi.getWorkItem(
      workItemId,
      [], // fields - empty array to get all fields
      undefined, // asOf
      WorkItemExpand.All // expand
    );

    console.log(`Successfully fetched work item ${workItemId}`);
    res.json({ success: true, data: workItem });
  } catch (error) {
    console.error(`Error fetching work item ${req.params.id}:`, error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

// Get Pull Request
app.get('/api/pullrequest/:id', async (req, res) => {
  try {
    const prId = parseInt(req.params.id);
    const project = req.query.project || DEFAULT_PROJECT;
    const repositoryId = req.query.repositoryId;

    if (!repositoryId) {
      return res.status(400).json({ success: false, error: 'Repository ID is required' });
    }

    const token = getAzureToken();
    const authHandler = azdev.getBearerHandler(token);
    const connection = new azdev.WebApi(DEFAULT_ORG, authHandler);
    const gitApi = await connection.getGitApi();

    const pr = await gitApi.getPullRequest(repositoryId, prId, project);
    const commits = await gitApi.getPullRequestCommits(repositoryId, prId, project);
    const iterations = await gitApi.getPullRequestIterations(repositoryId, prId, project);

    res.json({
      success: true,
      data: {
        pullRequest: pr,
        commits: commits,
        iterations: iterations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze with Claude
app.post('/api/analyze', async (req, res) => {
  try {
    const { data, analysisType } = req.body;

    console.log(`Starting Claude analysis via Bedrock: ${analysisType}`);

    let prompt = '';
    switch (analysisType) {
      case 'testCases':
        prompt = buildTestCasesPrompt(data);
        break;
      case 'codeReview':
        prompt = buildCodeReviewPrompt(data);
        break;
      case 'impactAnalysis':
        prompt = buildImpactAnalysisPrompt(data);
        break;
      case 'documentation':
        prompt = buildDocumentationPrompt(data);
        break;
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }

    console.log(`Calling Claude via AWS Bedrock (${BEDROCK_MODEL_ID})...`);

    const result = await invokeClaudeOnBedrock(prompt);

    console.log('Claude response received from Bedrock');

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in Claude analysis:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message, details: error.toString() });
  }
});

// Prompt builders
function buildTestCasesPrompt(data) {
  return `Analyze the following PBI/PR and generate comprehensive test cases:

${JSON.stringify(data, null, 2)}

Please provide:
1. Unit test scenarios
2. Integration test scenarios
3. Edge cases to consider
4. Negative test cases
5. Performance test considerations

Format the response as a structured test plan.`;
}

function buildCodeReviewPrompt(data) {
  return `Review the following code changes from a pull request:

${JSON.stringify(data, null, 2)}

Please provide:
1. Potential bugs or issues
2. Code quality concerns
3. Best practice violations
4. Security considerations
5. Suggestions for improvement

Be specific and reference line numbers or code snippets where applicable.`;
}

function buildImpactAnalysisPrompt(data) {
  return `Analyze the impact of the following changes:

${JSON.stringify(data, null, 2)}

Please identify:
1. Which system components are affected
2. Potential breaking changes
3. Dependencies that might be impacted
4. Database schema changes
5. API contract changes
6. Risk assessment (low/medium/high)

Provide a structured impact analysis.`;
}

function buildDocumentationPrompt(data) {
  return `Generate documentation for the following PBI/PR:

${JSON.stringify(data, null, 2)}

Please create:
1. User-facing documentation (if applicable)
2. Technical documentation for developers
3. Release notes entry
4. API documentation changes (if applicable)

Use clear, professional language suitable for different audiences.`;
}

// Serve Angular app
app.use(express.static(path.join(__dirname, 'dist/pbi-pr-analyzer/browser')));

// Fallback to index.html for Angular routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/pbi-pr-analyzer/browser/index.html'));
});

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('');
  console.error('============================================');
  console.error('  UNCAUGHT EXCEPTION');
  console.error('============================================');
  console.error('');
  console.error(error);
  console.error('');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('');
  console.error('============================================');
  console.error('  UNHANDLED PROMISE REJECTION');
  console.error('============================================');
  console.error('');
  console.error(error);
  console.error('');
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('============================================');
  console.log('  PBI/PR Analyzer Server');
  console.log('============================================');
  console.log('');
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('  Opening browser...');
  console.log('============================================');
  console.log('');

  // Open browser automatically
  const openCommand = process.platform === 'win32' ? 'start' :
                     process.platform === 'darwin' ? 'open' : 'xdg-open';
  try {
    execSync(`${openCommand} http://localhost:${PORT}`, { stdio: 'ignore' });
  } catch (error) {
    console.log('  Please open: http://localhost:3000');
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('');
  console.error('============================================');
  console.error('  SERVER ERROR');
  console.error('============================================');
  console.error('');
  if (error.code === 'EADDRINUSE') {
    console.error(`  Port ${PORT} is already in use!`);
    console.error('');
    console.error('  Either:');
    console.error('  1. Stop the other application using port 3000');
    console.error('  2. Change the PORT in server.js');
  } else {
    console.error(error);
  }
  console.error('');
  process.exit(1);
});
