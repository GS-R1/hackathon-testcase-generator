# PBI Manual Test Case Generator

## Project Overview

This is a web application that generates comprehensive manual test cases for Product Backlog Items (PBIs) from Azure DevOps using Claude AI via AWS Bedrock. It's specifically designed for GL Assessment's Testwise platform.

### Purpose
- Fetch PBI details from Azure DevOps
- Assess PBI quality and identify missing information
- Generate high-quality manual test cases using Claude Opus 4.6
- Iterate and self-review test cases for quality assurance
- Allow users to provide feedback and regenerate improved test cases

### Key Features
1. **PBI Quality Assessment**: Automatically evaluates PBI quality and identifies gaps
2. **Iterative Quality Improvement**: Self-reviews and iterates up to 3 times to meet quality standards
3. **Knowledge Base Integration**: Uses GL Assessment-specific context (testing standards, glossary, platform overview)
4. **Example-Based Learning**: References example PBIs and test cases when available
5. **Definition of Done**: Optional quality criteria for test case generation
6. **User Feedback Loop**: Users can request regeneration with specific feedback
7. **Happy Path First**: Always generates the happy path as the first test case (TC-001)

## Technology Stack

### Frontend (Angular 20)
- **Location**: `src/app/`
- **Component**: `components/analysis/` - Main UI for PBI fetching and test generation
- **Service**: `services/api.service.ts` - HTTP client for backend API
- **Build**: `ng build` produces output in `dist/`

### Backend (Node.js/Express)
- **Location**: `server.js`
- **Port**: 3000
- **Key Dependencies**:
  - `@aws-sdk/client-bedrock-runtime` - Claude AI integration via AWS Bedrock
  - `azure-devops-node-api` - Azure DevOps API client
  - `marked` - Markdown parsing for rendering test cases

### AI Integration
- **Model**: Claude Opus 4.6 (`us.anthropic.claude-opus-4-6-v1`)
- **Platform**: AWS Bedrock
- **Authentication**: AWS SSO (requires `aws sso login`)
- **Token Limit**: 16,384 tokens (allows comprehensive test case generation)

### Azure DevOps Integration
- **Authentication**: Personal Access Token (PAT) from environment variable
- **API**: Work Item Tracking API with `WorkItemExpand.All`
- **Key Fields Retrieved**:
  - `System.Title`
  - `System.Description`
  - `Microsoft.VSTS.Common.AcceptanceCriteria` (critical for test generation)
  - `System.State`, `System.WorkItemType`, `System.AssignedTo`

## Project Structure

```
├── server.js                          # Backend Express server
├── pbi-quality-assessor.js           # PBI quality assessment logic
├── src/
│   └── app/
│       ├── components/
│       │   └── analysis/              # Main UI component
│       │       ├── analysis.component.ts
│       │       ├── analysis.component.html
│       │       └── analysis.component.scss
│       └── services/
│           └── api.service.ts         # Backend API client
├── knowledge/                         # Knowledge base (GL Assessment context)
│   ├── testing-standards.md          # DoR/DoD, test types, formats
│   ├── glossary.md                   # Domain terminology
│   ├── platform-overview.md          # Architecture, tech stack
│   └── examples/
│       ├── pbis/                     # Example PBI JSON files
│       ├── test-cases/               # Example test case markdown files
│       └── definition-of-done/       # Quality criteria files
└── package.json
```

## Key Concepts

### 1. Iterative Quality Improvement
The system generates test cases in iterations (max 3):
1. Generate initial test cases
2. Self-review against knowledge base, examples, and Definition of Done
3. If issues found → improve and repeat
4. Generate final quality score (1-10)

**Code**: `generateTestCasesWithQuality()` in server.js

### 2. PBI Quality Assessment
Before generating test cases, the system can assess PBI quality:
- Checks for missing acceptance criteria
- Identifies unclear requirements
- Provides context to improve test generation

**Code**: `pbi-quality-assessor.js` and `PBIQualityAssessor` class

### 3. Knowledge Base System
All prompts include GL Assessment-specific context:
- **Testing Standards**: Given/When/Then format, test types (functional, edge, negative, accessibility)
- **Glossary**: Product names (CAT4, NGRT, SAS), technical terms (Batman, Epoch)
- **Platform Overview**: Architecture, tech stack, products

**Code**: `loadKnowledgeBase()` in server.js

### 4. Structured PBI Data
The system explicitly extracts and highlights key PBI fields:
- Title, Description, **Acceptance Criteria** (most important)
- State, Type, Assigned To

This prevents Claude from missing critical information in the JSON dump.

**Code**: `buildTestCasesPrompt()` lines 534-550 in server.js

### 5. Happy Path Requirement
**CRITICAL RULE**: Test Case #1 (TC-001) MUST always be the Happy Path scenario.
- Enforced in prompts with multiple reminders
- Represents the ideal successful user journey
- Uses valid inputs and expects successful outcomes

### 6. User Feedback Flow
Two distinct generation modes:
1. **Initial Generation**: Uses iterative quality improvement loop
2. **Feedback Mode**: Takes existing test cases + user feedback → single improvement pass

**Code**: `/api/analyze` endpoint routing logic (lines 152-192)

## Environment Setup

### Required Environment Variables
Create a `.env` file:
```
AZURE_ORG=https://dev.azure.com/your-org
AZURE_TOKEN=your-azure-devops-pat
DEFAULT_PROJECT=Testwise
AWS_PROFILE=your-aws-profile
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=us.anthropic.claude-opus-4-6-v1
```

### AWS Authentication
```bash
aws sso login --profile your-profile-name
```
SSO tokens expire after 8-12 hours and must be refreshed.

## API Endpoints

### `GET /api/workitem/:id`
Fetch PBI from Azure DevOps
- Query param: `project` (defaults to DEFAULT_PROJECT)
- Returns: Complete work item with all fields

### `POST /api/analyze`
Generate test cases or perform analysis
- Body:
  - `data`: PBI data object
  - `analysisType`: `'testCases'` | `'pbiQualityAssessment'` | `'impactAnalysis'` | `'documentation'`
  - `userFeedback` (optional): User's improvement request
  - `previousTestCases` (optional): Existing test cases to improve
  - `additionalContext` (optional): Context from PBI quality assessment
- Returns:
  - `testCases`: Generated markdown
  - `qualityScore`: Quality assessment (1-10)
  - `iterations`: Number of iterations performed

### `GET /api/settings`
Get application settings (project, org)

## Common Development Tasks

### Adding New Knowledge
1. Add markdown file to `knowledge/`
2. Update `loadKnowledgeBase()` to include it
3. Add to prompt building functions

### Adding Example PBIs/Test Cases
1. Add PBI JSON to `knowledge/examples/pbis/example-name.json`
2. Add test cases to `knowledge/examples/test-cases/example-name.md`
3. System auto-loads matching pairs

### Adding Definition of Done
1. Add markdown file to `knowledge/examples/definition-of-done/`
2. System auto-loads all files in this folder
3. Used for self-review and quality scoring

### Modifying Prompt Logic
Key functions in server.js:
- `buildTestCasesPrompt()` - Initial test case generation
- `buildSelfReviewPrompt()` - Quality review
- `buildImprovedTestCasesPrompt()` - Iteration improvements
- `buildQualityScoringPrompt()` - Final quality score

### Adjusting Iteration Limits
Change `MAX_ITERATIONS` in `generateTestCasesWithQuality()` (currently 3)

### Modifying Token Limits
Change `max_tokens` in `invokeClaudeOnBedrock()` (currently 16,384)

## Important Conventions

### Test Case Format
All test cases must follow Given/When/Then format:
```
**Given:** [Preconditions/Setup]
**When:** [Action/Trigger]
**Then:** [Expected Result]
```

### Test Case Numbering
- TC-001: Happy Path (MANDATORY first test)
- TC-002+: Other test types (edge cases, negative, accessibility, etc.)

### PBI Field Names (Azure DevOps)
- `System.Title` - PBI title
- `System.Description` - Main description
- `Microsoft.VSTS.Common.AcceptanceCriteria` - **Critical field for test generation**
- `System.State` - PBI state (New, Active, Resolved, etc.)
- `System.WorkItemType` - Type (Product Backlog Item, Bug, etc.)

### Console Logging
The system uses detailed console logging for debugging:
- `🔄` - Iteration progress
- `✓` - Success
- `⚠` - Warnings
- `✗` - Errors
- `📚`, `📝`, `📊` - Context indicators

## Troubleshooting

### "Token is expired" Error
Run `aws sso login` to refresh AWS credentials

### Test Cases Cut Off
Increase `max_tokens` in `invokeClaudeOnBedrock()`

### Missing Acceptance Criteria
The system now explicitly extracts and highlights this field. If missing, Claude is warned to infer from description.

### Build Failures (CSS Budget)
Adjust budget in `angular.json` under `budgets` section

### Feedback Regenerating Completely New Tests
The system now has separate flows:
- Initial: Iterative improvement
- Feedback: Direct improvement of existing tests

## Testing

### Manual Testing Workflow
1. Start server: `npm start` (runs `node server.js`)
2. Angular dev server: `ng serve` (if developing frontend)
3. Fetch a PBI (e.g., 98067)
4. Run quality assessment
5. Generate test cases
6. Provide feedback if needed
7. Check console logs for iteration details

### Example PBIs for Testing
- 98067 - Should have acceptance criteria
- 95962 - Test case used during development

## Future Enhancements

### Potential Improvements
- Add more test types (performance, security, usability)
- Support for bulk PBI processing
- Export to Azure DevOps test cases
- Integration with test management tools
- Custom quality scoring models
- Historical test case reuse

## Additional Notes

### Why Manual Testing Focus
The system generates MANUAL test cases only (not automated):
- For human testers to execute
- Includes detailed steps, preconditions, expected results
- No code generation (no Cypress, Jest, SpecFlow)

### GL Assessment Context
This tool is specifically designed for GL Assessment products:
- Testwise (online testing platform)
- CAT4, NGRT, SAS (assessment products)
- Batman (backend API), Epoch (data platform)
- References GL-specific standards and terminology

### Self-Review Without DoD
Even without Definition of Done files, the system:
- Still performs self-review
- Uses knowledge base and examples as quality standards
- Generates a quality score based on general best practices
