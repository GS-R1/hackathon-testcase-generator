# PBI Manual Test Case Generator

A web application for generating manual test cases for Product Backlog Items (PBIs) from Azure DevOps using Claude AI.

## Quick Start

### 1. First Time Setup

```bash
# Install dependencies
npm install

# Login to Azure CLI
az login
```

That's it! The app uses AWS Bedrock (already configured) for Claude AI.

### 2. Launch

**Double-click:** `Launch PBI-PR Analyzer.bat`

The application will automatically:
- Build the Angular frontend (first run only)
- Start the server on port 3000
- Open your browser

**That's it!** Start generating test cases for PBIs.

## Features

- **Fetch PBIs** from Azure DevOps automatically
- **AI-Powered Manual Test Case Generation** using Claude Opus 4.6:
  - Generate comprehensive manual test cases following GL Assessment standards
  - Context-aware using embedded knowledge base
  - Includes functional, UAT, accessibility, and security test scenarios
  - Step-by-step instructions ready for manual testers
  - **Happy Path first** - Test Case #1 is always the successful scenario
- **Iterative Quality Improvement**:
  - Claude self-reviews generated test cases against your Definition of Done
  - Automatically iterates (up to 3 times) to improve quality
  - Provides quality score (1-10) with justification
  - Shows how many iterations were needed
- **User Feedback Loop**:
  - Provide specific feedback if test cases need improvement
  - Regenerate with your feedback incorporated
  - Iterative refinement until you're satisfied
- **Embedded Knowledge Base** - No external dependencies required:
  - GL Assessment testing standards (DoR/DoD)
  - Platform architecture and tech stack
  - Domain glossary (CAT4, NGRT, SAS, etc.)
  - Example PBIs and test cases (optional)
  - Definition of Done criteria (optional)
- **Azure CLI Authentication** - Uses your existing `az login` session
- **Simple Web App** - Runs in your browser, no desktop app issues

## How to Use

1. Enter PBI ID (e.g., `95962`) and Project (e.g., `Testwise`)
2. Click **Fetch PBI**
3. Review the PBI details displayed
4. Click **Generate Manual Test Cases**
5. **Claude generates and self-reviews** (with iterative improvement if Definition of Done is provided):
   - Generates initial test cases
   - Reviews against quality criteria
   - Improves and refines (up to 3 iterations)
   - Provides quality score and feedback
6. **Review the results**:
   - View quality score (if Definition of Done is provided)
   - See how many iterations were needed
   - Read comprehensive manual test cases
7. **Optional**: Provide feedback and regenerate:
   - Enter specific feedback in the textarea
   - Click "Regenerate with Feedback"
   - Claude incorporates your feedback and generates improved version
8. Copy final test cases to clipboard for your test plan

## Architecture

```
Browser (Angular) → Express Server → Azure DevOps API
                                   → Claude API
```

Simple web application with:
- **Frontend**: Angular running in your browser
- **Backend**: Express.js server handling API calls
- **Authentication**: Azure CLI for DevOps, environment variable for Claude

## Prerequisites

- Node.js (v18+)
- npm (v9+)
- Azure CLI (`az`) with active login
- AWS credentials configured (for Bedrock access to Claude)

## Configuration

The application automatically uses:
- **Azure CLI token** from `az login` for Azure DevOps access
- **AWS Bedrock** with your configured AWS credentials for Claude AI access
  - Region: `us-east-1`
  - Profile: `ai-tools-prod`
  - Model: `us.anthropic.claude-opus-4-6-v1`

View current status in the Settings page:
- Azure DevOps Organization (default: `https://dev.azure.com/gl-development`)
- Default Project (e.g., `Testwise`)
- AWS Bedrock configuration
- Authentication status

## Embedded Knowledge Base

This application includes a curated knowledge base in the `knowledge/` folder that enhances test case generation:

### What's Included

- **[testing-standards.md](knowledge/testing-standards.md)** - GL Assessment testing standards:
  - Definition of Ready (DoR) and Definition of Done (DoD)
  - Acceptance criteria format (Given/When/Then)
  - Required test types (Cypress, SpecFlow, Jest, TestContainers)
  - Browser compatibility requirements

- **[glossary.md](knowledge/glossary.md)** - Domain terminology:
  - Product acronyms (CAT4, NGRT, PASS, etc.)
  - Technical terms (SAS, NPR, Stanine, Batman, Epoch, etc.)
  - Infrastructure and repository names

- **[platform-overview.md](knowledge/platform-overview.md)** - Technical context:
  - Platform architecture and components
  - Technology stack (Angular, .NET, Azure)
  - Authentication patterns
  - Integration points

- **[examples/](knowledge/examples/)** - Example PBIs and test cases (Optional):
  - Place example PBI JSON files in `knowledge/examples/pbis/`
  - Place corresponding test case markdown files in `knowledge/examples/test-cases/`
  - Files must have matching names (e.g., `login.json` and `login.md`)
  - Claude learns from these examples to match your quality and format
  - See [examples/README.md](knowledge/examples/README.md) for instructions

- **[definition-of-done/](knowledge/examples/definition-of-done/)** - Quality criteria (Optional):
  - Place Definition of Done markdown files in this folder
  - Defines what makes test cases "ready for use"
  - Claude uses these for self-review and iterative improvement
  - Enables quality scoring (1-10) of generated test cases
  - See [definition-of-done/README.md](knowledge/examples/definition-of-done/README.md) for instructions

### How It Works

When you generate test cases:

1. **Context Loading**: Claude receives the knowledge base, examples (if any), and Definition of Done (if any)

2. **Initial Generation**: Claude creates test cases using all available context

3. **Self-Review** (if Definition of Done exists):
   - Claude reviews its own output against quality criteria
   - Identifies issues and areas for improvement

4. **Iterative Improvement** (up to 3 iterations):
   - Claude generates improved version addressing issues
   - Process repeats until quality standards are met or max iterations reached

5. **Quality Scoring** (if Definition of Done exists):
   - Claude provides quality score (1-10) with justification
   - Lists strengths and areas for improvement

6. **User Feedback** (optional):
   - You can provide specific feedback
   - Claude regenerates incorporating your feedback
   - Process can repeat as needed

**No external dependencies required** - everything is self-contained in this repository.

## Troubleshooting

### Application won't start
- Check Node.js is installed: `node --version`
- Ensure dependencies are installed: `npm install`

### "Azure CLI not logged in"
```bash
az login
```

### Claude analysis fails
Check that your AWS credentials are configured and you have access to Bedrock:
```bash
aws sts get-caller-identity --profile ai-tools-prod
```

### Port 3000 already in use
Change the `PORT` variable in `server.js` (line 9)

### Build fails
```bash
npm install
npm run build
```

## Project Structure

```
pbi-test-case-generator/
├── Launch PBI-PR Analyzer.bat    # Launcher
├── server.js                     # Express backend
├── package.json                  # Dependencies
├── src/app/
│   ├── components/
│   │   ├── analysis/             # Analysis UI
│   │   └── settings/             # Settings page
│   └── services/
│       └── api.service.ts        # HTTP API client
└── dist/                         # Built Angular app
```

## Scripts

```bash
npm run start:web    # Start the server
npm run build        # Build Angular app
npm run build:prod   # Production build
npm run start        # Angular dev server (for development)
```

## Technologies

- **Angular 20** - Frontend framework
- **Express.js** - Backend server
- **Azure DevOps Node API** - DevOps integration
- **Anthropic Claude SDK** - AI analysis

## Benefits

✅ No antivirus conflicts  
✅ Faster startup (~1-2 seconds)  
✅ Smaller size (~230MB vs ~550MB for desktop apps)  
✅ Better debugging with browser DevTools  
✅ Works on any machine with Node.js  

## Support

For issues or questions, contact the development team.

---

**Ready to start?** → Double-click `Launch PBI-PR Analyzer.bat`
