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
    max_tokens: 16384, // Increased from 4096 to allow for comprehensive test plans
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

// Analyze with Claude
app.post('/api/analyze', async (req, res) => {
  try {
    const { data, analysisType, userFeedback, previousTestCases } = req.body;

    console.log('');
    console.log('============================================');
    console.log(`  Starting Analysis: ${analysisType}`);
    console.log('============================================');

    if (analysisType === 'testCases') {
      // If user provided feedback, use direct improvement flow
      if (userFeedback && previousTestCases) {
        console.log('🔄 User Feedback Mode - Improving existing test cases...');
        console.log(`   Feedback: "${userFeedback.substring(0, 100)}${userFeedback.length > 100 ? '...' : ''}"`);
        const result = await improveTestCasesWithFeedback(data, previousTestCases, userFeedback);

        res.json({
          success: true,
          data: result.testCases,
          qualityScore: result.qualityScore,
          iterations: 1 // Single improvement iteration
        });
      } else {
        // Use iterative quality generation for initial test cases
        const result = await generateTestCasesWithQuality(data);

        res.json({
          success: true,
          data: result.testCases,
          qualityScore: result.qualityScore,
          iterations: result.iterations
        });
      }
    } else {
      // Other analysis types use simple generation
      let prompt = '';
      switch (analysisType) {
        case 'impactAnalysis':
          prompt = buildImpactAnalysisPrompt(data);
          break;
        case 'documentation':
          prompt = buildDocumentationPrompt(data);
          break;
        default:
          throw new Error(`Unknown analysis type: ${analysisType}`);
      }

      console.log(`🤖 Calling Claude via AWS Bedrock (${BEDROCK_MODEL_ID})...`);

      const result = await invokeClaudeOnBedrock(prompt);

      console.log('✓ Claude response received from Bedrock');
      console.log('============================================');
      console.log('');

      res.json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    console.error('Error in Claude analysis:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message, details: error.toString() });
  }
});

// Knowledge Base Cache
let knowledgeCache = null;

// Examples Cache
let examplesCache = null;

function loadExamples() {
  if (examplesCache !== null) {
    return examplesCache; // Return cached (even if empty array)
  }

  const examples = [];
  const pbisPath = path.join(__dirname, 'knowledge/examples/pbis');
  const testCasesPath = path.join(__dirname, 'knowledge/examples/test-cases');

  try {
    // Check if directories exist
    if (!fs.existsSync(pbisPath) || !fs.existsSync(testCasesPath)) {
      console.log('ℹ Examples folders not found - skipping examples');
      examplesCache = [];
      return examplesCache;
    }

    // Read all files from both directories
    const pbiFiles = fs.readdirSync(pbisPath).filter(f => f.endsWith('.json') && f !== '.gitkeep');
    const testCaseFiles = fs.readdirSync(testCasesPath).filter(f => f.endsWith('.md') && f !== '.gitkeep');

    if (pbiFiles.length === 0 && testCaseFiles.length === 0) {
      console.log('ℹ No example files found in examples folders');
      examplesCache = [];
      return examplesCache;
    }

    console.log('');
    console.log('📝 Loading Examples...');
    console.log('--------------------------------------------');

    // Match PBI files with their corresponding test case files
    pbiFiles.forEach(pbiFile => {
      const baseName = path.basename(pbiFile, '.json');
      const testCaseFile = `${baseName}.md`;

      if (testCaseFiles.includes(testCaseFile)) {
        try {
          const pbiContent = fs.readFileSync(path.join(pbisPath, pbiFile), 'utf-8');
          const testCaseContent = fs.readFileSync(path.join(testCasesPath, testCaseFile), 'utf-8');

          examples.push({
            name: baseName,
            pbi: pbiContent,
            testCases: testCaseContent
          });

          console.log(`✓ Loaded example pair: ${baseName}`);
          console.log(`  → PBI: ${pbiFile} (${(pbiContent.length / 1024).toFixed(1)} KB)`);
          console.log(`  → Test Cases: ${testCaseFile} (${(testCaseContent.length / 1024).toFixed(1)} KB)`);
        } catch (error) {
          console.log(`✗ Error loading example pair ${baseName}:`, error.message);
        }
      } else {
        console.log(`⚠ PBI file ${pbiFile} has no matching test case file (expected: ${testCaseFile})`);
      }
    });

    // Warn about orphaned test case files
    testCaseFiles.forEach(testCaseFile => {
      const baseName = path.basename(testCaseFile, '.md');
      const pbiFile = `${baseName}.json`;
      if (!pbiFiles.includes(pbiFile)) {
        console.log(`⚠ Test case file ${testCaseFile} has no matching PBI file (expected: ${pbiFile})`);
      }
    });

    console.log('--------------------------------------------');
    if (examples.length > 0) {
      console.log(`✓ Loaded ${examples.length} example pair(s)`);
    } else {
      console.log('ℹ No matching example pairs found');
    }
    console.log('');

    examplesCache = examples;
    return examplesCache;
  } catch (error) {
    console.error('✗ Error loading examples:', error.message);
    console.log('');
    examplesCache = [];
    return examplesCache;
  }
}

// Definition of Done Cache
let definitionOfDoneCache = null;

function loadDefinitionOfDone() {
  if (definitionOfDoneCache !== null) {
    return definitionOfDoneCache; // Return cached (even if empty array)
  }

  const definitions = [];
  const dodPath = path.join(__dirname, 'knowledge/examples/definition-of-done');

  try {
    // Check if directory exists
    if (!fs.existsSync(dodPath)) {
      console.log('ℹ Definition of Done folder not found - skipping quality criteria');
      definitionOfDoneCache = [];
      return definitionOfDoneCache;
    }

    // Read all markdown files
    const dodFiles = fs.readdirSync(dodPath).filter(f => f.endsWith('.md') && !f.includes('README'));

    if (dodFiles.length === 0) {
      console.log('ℹ No Definition of Done files found - skipping quality criteria');
      definitionOfDoneCache = [];
      return definitionOfDoneCache;
    }

    console.log('');
    console.log('📋 Loading Definition of Done...');
    console.log('--------------------------------------------');

    dodFiles.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(dodPath, file), 'utf-8');
        definitions.push({
          name: file,
          content: content
        });
        console.log(`✓ Loaded: ${file}`);
        console.log(`  → ${(content.length / 1024).toFixed(1)} KB - Quality criteria for self-review`);
      } catch (error) {
        console.log(`✗ Error loading ${file}:`, error.message);
      }
    });

    console.log('--------------------------------------------');
    if (definitions.length > 0) {
      console.log(`✓ Loaded ${definitions.length} Definition of Done file(s)`);
      console.log('  → Claude will use these for self-review and quality scoring');
    } else {
      console.log('ℹ No Definition of Done files loaded');
    }
    console.log('');

    definitionOfDoneCache = definitions;
    return definitionOfDoneCache;
  } catch (error) {
    console.error('✗ Error loading Definition of Done:', error.message);
    console.log('');
    definitionOfDoneCache = [];
    return definitionOfDoneCache;
  }
}

function loadKnowledgeBase() {
  if (knowledgeCache) {
    console.log('📚 Using cached knowledge base');
    return knowledgeCache;
  }

  console.log('');
  console.log('📚 Loading Knowledge Base...');
  console.log('--------------------------------------------');

  try {
    const testingStandards = fs.readFileSync(path.join(__dirname, 'knowledge/testing-standards.md'), 'utf-8');
    console.log('✓ Loaded: testing-standards.md');
    console.log(`  → ${(testingStandards.length / 1024).toFixed(1)} KB - GL Assessment testing standards (DoR/DoD, test types)`);

    const glossary = fs.readFileSync(path.join(__dirname, 'knowledge/glossary.md'), 'utf-8');
    console.log('✓ Loaded: glossary.md');
    console.log(`  → ${(glossary.length / 1024).toFixed(1)} KB - Domain terminology (CAT4, NGRT, SAS, etc.)`);

    const platformOverview = fs.readFileSync(path.join(__dirname, 'knowledge/platform-overview.md'), 'utf-8');
    console.log('✓ Loaded: platform-overview.md');
    console.log(`  → ${(platformOverview.length / 1024).toFixed(1)} KB - Platform architecture & tech stack`);

    knowledgeCache = {
      testingStandards,
      glossary,
      platformOverview
    };

    const totalSize = (testingStandards.length + glossary.length + platformOverview.length) / 1024;
    console.log('--------------------------------------------');
    console.log(`✓ Knowledge base loaded successfully (${totalSize.toFixed(1)} KB total)`);
    console.log('');

    return knowledgeCache;
  } catch (error) {
    console.error('✗ Error loading knowledge base:', error);
    console.log('');
    return null;
  }
}

// Prompt builders
function buildTestCasesPrompt(data) {
  console.log('');
  console.log('🧠 Building test case generation prompt...');
  console.log('--------------------------------------------');

  const knowledge = loadKnowledgeBase();
  const examples = loadExamples();

  let knowledgeContext = '';
  if (knowledge) {
    console.log('📖 Applying knowledge base context:');
    console.log('  ✓ Testing standards (DoR/DoD, acceptance criteria format)');
    console.log('  ✓ Domain glossary (product names, technical terms)');
    console.log('  ✓ Platform overview (architecture, tech stack, products)');
    console.log('');
    console.log('🎯 Test Generation Strategy:');
    console.log('  → Test Case #1: Happy Path (mandatory first test)');
    console.log('  → Followed by: Edge cases, negative tests, accessibility, etc.');

    if (examples.length > 0) {
      console.log('');
      console.log('📋 Using Example Test Cases:');
      examples.forEach((example, index) => {
        console.log(`  ${index + 1}. ${example.name}`);
      });
      console.log('  → Claude will learn from these examples');
    } else {
      console.log('');
      console.log('ℹ No examples provided - generating without reference examples');
    }

    console.log('--------------------------------------------');
    console.log('✓ Prompt ready with full GL Assessment context');
    console.log('');

    knowledgeContext = `
# CONTEXT: GL Assessment Testing Standards and Platform Knowledge

You are generating test cases for GL Assessment's Testwise platform. Use the following knowledge to inform your test case generation:

${knowledge.testingStandards}

---

${knowledge.glossary}

---

${knowledge.platformOverview}

---

${examples.length > 0 ? `
# EXAMPLES: Learn from High-Quality Test Cases

Below are examples of well-written PBIs and their corresponding test cases. Use these as references for format, structure, quality, and level of detail when generating test cases.

${examples.map((example, index) => `
## Example ${index + 1}: ${example.name}

### Example PBI:
${example.pbi}

### Example Test Cases:
${example.testCases}

---
`).join('\n')}

` : ''}
# YOUR TASK

Now, using the standards, context${examples.length > 0 ? ', and examples' : ''} above, analyze the following Product Backlog Item (PBI) and generate comprehensive test cases${examples.length > 0 ? ' in the same high-quality format as the examples' : ''}.
`;
  } else {
    console.log('⚠ Warning: Knowledge base not loaded - generating without GL context');
    console.log('--------------------------------------------');
    console.log('');
  }

  return `${knowledgeContext}

## PBI Details

${JSON.stringify(data, null, 2)}

## Requirements

Generate a comprehensive **MANUAL TEST PLAN** that includes:

**IMPORTANT: The very first test case (Test Case #1) MUST be the Happy Path scenario - the ideal, successful user journey with valid inputs and expected successful outcomes.**

1. **Happy Path Test (TEST CASE #1 - MANDATORY)**
   - This MUST be the first test case in your test plan
   - Cover the primary, successful user journey
   - Use valid data and expected inputs
   - Verify all steps complete successfully
   - Format in Given/When/Then structure
   - Include clear step-by-step instructions
   - Specify expected successful results

2. **Additional Acceptance Criteria Tests** (Given/When/Then format)
   - Cover all remaining acceptance criteria from the PBI
   - Include variations and alternative paths
   - Provide clear step-by-step instructions
   - Specify expected results for each test

3. **Functional Test Scenarios**
   - Core functionality tests
   - User workflows and journeys
   - UI interactions and navigation
   - Data input and validation
   - Form submissions
   - Search and filtering functionality

4. **Edge Cases and Boundary Tests**
   - Boundary values (minimum/maximum)
   - Empty/null data scenarios
   - Special characters and unusual inputs
   - Large data sets
   - Concurrent user scenarios (if applicable)

5. **Negative Test Cases**
   - Invalid inputs
   - Incorrect data formats
   - Unauthorized access attempts
   - Error message validation
   - System behavior under failure conditions

6. **User Acceptance Testing (UAT) Scenarios**
   - Real-world user scenarios
   - Business process validation
   - End-to-end user journeys

7. **Cross-Browser Testing**
   - Chrome (primary browser)
   - Edge, Firefox, Safari (sanity checks)
   - Responsive design on different screen sizes
   - Mobile device testing (if applicable)

8. **Accessibility Testing** (Manual checks)
   - Keyboard navigation (Tab, Enter, Escape)
   - Screen reader compatibility testing
   - Color contrast verification
   - Focus indicators visibility
   - Alt text for images

9. **Performance and Usability**
   - Page load time observations
   - Response time for actions
   - UI responsiveness
   - Error handling and user feedback

10. **Security Testing** (Manual verification)
    - Authentication and authorization checks
    - Data validation
    - Session management
    - Sensitive data handling

11. **Exploratory Testing Suggestions**
    - Areas to explore freely
    - Potential risk areas
    - Integration points to verify

## Test Case Format

For each test case, provide:
- **Test Case ID**: Unique identifier (e.g., TC-001, TC-002, etc.)
- **Test Scenario**: Brief description
- **Preconditions**: What must be set up or true before testing
- **Test Steps**: Numbered, clear, step-by-step instructions
- **Test Data**: Specific data values to use
- **Expected Result**: What should happen
- **Notes**: Any additional context or considerations

**REMINDER: Test Case #1 (TC-001) MUST be the Happy Path - the successful, ideal scenario with valid inputs.**

Format the response as a structured, detailed manual test plan organized by category. Use markdown formatting with clear headings, numbered steps, and bullet points. Make it easy for a manual tester to execute.`;
}

function buildImpactAnalysisPrompt(data) {
  return `Analyze the impact of the following Product Backlog Item (PBI):

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
  return `Generate documentation for the following Product Backlog Item (PBI):

${JSON.stringify(data, null, 2)}

Please create:
1. User-facing documentation (if applicable)
2. Technical documentation for developers
3. Release notes entry
4. API documentation changes (if applicable)

Use clear, professional language suitable for different audiences.`;
}

// Self-Review and Quality Functions
function buildSelfReviewPrompt(testCases, definitionOfDone) {
  const dodContext = definitionOfDone.length > 0 ? `
# Definition of Done Criteria

Review the test cases against these quality standards:

${definitionOfDone.map(dod => `
## ${dod.name}
${dod.content}
`).join('\n')}
` : '';

  return `${dodContext}

# Test Cases to Review

${testCases}

---

# Your Task

Review the test cases above and evaluate them against ${definitionOfDone.length > 0 ? 'the Definition of Done criteria' : 'general quality standards'}.

Provide a structured review in this format:

## Overall Assessment
[Brief summary of quality level]

## Strengths
- [What's good about these test cases]

## Issues Found
1. **[Issue Category]**: [Specific problem and location]
2. **[Issue Category]**: [Specific problem and location]
[Continue for all issues]

## Recommended Improvements
1. [Specific actionable improvement]
2. [Specific actionable improvement]
[Continue for all recommendations]

## Ready for Use?
[YES or NO] - If NO, explain what critical issues must be addressed.

Be specific about test case IDs and exact issues. Focus on actionable feedback.`;
}

function buildImprovedTestCasesPrompt(originalTestCases, reviewFeedback, pbiData, knowledgeContext, definitionOfDone) {
  return `${knowledgeContext}

## PBI Details

${JSON.stringify(pbiData, null, 2)}

## Previous Test Cases

${originalTestCases}

## Review Feedback

${reviewFeedback}

---

# Your Task

Generate IMPROVED test cases that address all the issues identified in the review feedback.

${definitionOfDone.length > 0 ? `Ensure the improved test cases fully comply with the Definition of Done criteria provided earlier.` : ''}

Maintain the same structure and categories, but fix all identified issues. The improved version should be ready for immediate use by manual testers.

**REMINDER: Test Case #1 (TC-001) MUST be the Happy Path.**

Generate the complete improved test plan now.`;
}

function buildQualityScoringPrompt(testCases, definitionOfDone) {
  const dodContext = definitionOfDone.length > 0 ? `using the Definition of Done criteria provided earlier` : `using general quality standards for manual test cases`;

  return `# Test Cases to Score

${testCases}

---

# Your Task

Evaluate the quality of these test cases ${dodContext}.

Provide your assessment in this EXACT format:

## Quality Score: [X]/10

## Justification
[2-3 sentences explaining the score]

## Strengths
- [Key strength 1]
- [Key strength 2]
- [Key strength 3]

## Areas for Improvement (if any)
- [Improvement area 1]
- [Improvement area 2]

Keep your response concise and focused.`;
}

async function improveTestCasesWithFeedback(pbiData, previousTestCases, userFeedback) {
  const knowledge = loadKnowledgeBase();
  const definitionOfDone = loadDefinitionOfDone();

  console.log('');
  console.log('--------------------------------------------');

  // Build knowledge context
  let knowledgeContext = '';
  if (knowledge) {
    knowledgeContext = `
# CONTEXT: GL Assessment Testing Standards and Platform Knowledge

${knowledge.testingStandards}

---

${knowledge.glossary}

---

${knowledge.platformOverview}

---
`;
  }

  // Build improvement prompt
  const improvementPrompt = `${knowledgeContext}

## PBI Details

${JSON.stringify(pbiData, null, 2)}

---

## Previous Test Cases

${previousTestCases}

---

## User Feedback

The user has reviewed the test cases above and provided the following feedback:

"${userFeedback}"

---

# Your Task

Generate IMPROVED test cases that address the user's feedback while maintaining all the good aspects of the previous version.

**Instructions:**
- Keep the same structure and format
- Address the specific feedback provided
- Maintain quality and completeness
- **IMPORTANT: Test Case #1 (TC-001) MUST remain the Happy Path**
- Only make changes related to the user's feedback
- If the user asks for specific changes (e.g., "only give me one test"), follow that instruction exactly

Generate the complete improved test plan now.`;

  console.log('🤖 Calling Claude to improve test cases with user feedback...');
  const improvedTestCases = await invokeClaudeOnBedrock(improvementPrompt);
  console.log('✓ Improved test cases generated');

  // Generate quality score if DoD exists
  let qualityScore = null;
  if (definitionOfDone.length > 0) {
    console.log('📊 Generating quality score...');
    const scoringPrompt = buildQualityScoringPrompt(improvedTestCases, definitionOfDone);
    qualityScore = await invokeClaudeOnBedrock(scoringPrompt);
    console.log('✓ Quality score generated');
  }

  console.log('============================================');
  console.log('');

  return {
    testCases: improvedTestCases,
    qualityScore: qualityScore
  };
}

async function generateTestCasesWithQuality(pbiData) {
  const MAX_ITERATIONS = 3;
  const knowledge = loadKnowledgeBase();
  const examples = loadExamples();
  const definitionOfDone = loadDefinitionOfDone();

  console.log('');
  console.log('🔄 Starting Iterative Test Generation with Quality Review...');
  console.log('--------------------------------------------');

  // Build knowledge context once
  let knowledgeContext = '';
  if (knowledge) {
    knowledgeContext = `
# CONTEXT: GL Assessment Testing Standards and Platform Knowledge

You are generating test cases for GL Assessment's Testwise platform. Use the following knowledge to inform your test case generation:

${knowledge.testingStandards}

---

${knowledge.glossary}

---

${knowledge.platformOverview}

---

${examples.length > 0 ? `
# EXAMPLES: Learn from High-Quality Test Cases

Below are examples of well-written PBIs and their corresponding test cases. Use these as references for format, structure, quality, and level of detail when generating test cases.

${examples.map((example, index) => `
## Example ${index + 1}: ${example.name}

### Example PBI:
${example.pbi}

### Example Test Cases:
${example.testCases}

---
`).join('\n')}

` : ''}`;
  }

  let currentTestCases = '';
  let iteration = 0;
  let isReadyForUse = false;

  // Iteration loop
  while (iteration < MAX_ITERATIONS && !isReadyForUse) {
    iteration++;
    console.log(`\n📝 Iteration ${iteration}/${MAX_ITERATIONS}`);

    if (iteration === 1) {
      // First generation
      console.log('  → Generating initial test cases...');
      const initialPrompt = buildTestCasesPrompt(pbiData);
      currentTestCases = await invokeClaudeOnBedrock(initialPrompt);
      console.log('  ✓ Initial test cases generated');
    } else {
      // Improvement iteration
      console.log('  → Generating improved test cases based on review...');
      const improvementPrompt = buildImprovedTestCasesPrompt(
        currentTestCases,
        lastReview,
        pbiData,
        knowledgeContext,
        definitionOfDone
      );
      currentTestCases = await invokeClaudeOnBedrock(improvementPrompt);
      console.log('  ✓ Improved test cases generated');
    }

    // Only do self-review if we have DoD and we're not on the last iteration
    if (definitionOfDone.length > 0 && iteration < MAX_ITERATIONS) {
      console.log('  → Performing self-review against Definition of Done...');
      const reviewPrompt = buildSelfReviewPrompt(currentTestCases, definitionOfDone);
      const lastReview = await invokeClaudeOnBedrock(reviewPrompt);
      console.log('  ✓ Self-review complete');

      // Check if ready
      isReadyForUse = lastReview.toLowerCase().includes('ready for use?\nyes') ||
                      lastReview.toLowerCase().includes('ready for use? yes');

      if (isReadyForUse) {
        console.log('  ✅ Test cases meet quality standards!');
      } else {
        console.log('  ⚠ Issues found - will iterate');
      }
    } else {
      // No DoD or last iteration - accept the output
      isReadyForUse = true;
      if (definitionOfDone.length === 0) {
        console.log('  ℹ No Definition of Done - skipping self-review');
      }
    }
  }

  console.log(`\n✓ Test generation complete after ${iteration} iteration(s)`);

  // Generate quality score
  let qualityScore = null;
  if (definitionOfDone.length > 0) {
    console.log('📊 Generating quality score...');
    const scoringPrompt = buildQualityScoringPrompt(currentTestCases, definitionOfDone);
    qualityScore = await invokeClaudeOnBedrock(scoringPrompt);
    console.log('✓ Quality score generated');
  } else {
    console.log('ℹ No Definition of Done - skipping quality scoring');
  }

  console.log('============================================');
  console.log('');

  return {
    testCases: currentTestCases,
    qualityScore: qualityScore,
    iterations: iteration
  };
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
  console.log('  PBI Manual Test Case Generator Server');
  console.log('============================================');
  console.log('');
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log('');

  // Check knowledge base availability
  const knowledgeFiles = [
    'knowledge/testing-standards.md',
    'knowledge/glossary.md',
    'knowledge/platform-overview.md'
  ];

  let allFilesExist = true;
  knowledgeFiles.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, file))) {
      allFilesExist = false;
    }
  });

  if (allFilesExist) {
    console.log('  📚 Knowledge Base: Ready');
    console.log('     • Testing Standards');
    console.log('     • Domain Glossary');
    console.log('     • Platform Overview');
  } else {
    console.log('  ⚠  Knowledge Base: Missing files!');
  }
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
