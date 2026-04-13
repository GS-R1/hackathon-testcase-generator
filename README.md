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
- **Embedded Knowledge Base** - No external dependencies required:
  - GL Assessment testing standards (DoR/DoD)
  - Platform architecture and tech stack
  - Domain glossary (CAT4, NGRT, SAS, etc.)
- **Azure CLI Authentication** - Uses your existing `az login` session
- **Simple Web App** - Runs in your browser, no desktop app issues

## How to Use

1. Enter PBI ID (e.g., `95962`) and Project (e.g., `Testwise`)
2. Click **Fetch PBI**
3. Review the PBI details displayed
4. Click **Generate Manual Test Cases**
5. Claude AI generates comprehensive manual test cases using the embedded knowledge base
6. Review the step-by-step test instructions and copy to clipboard for your test plan

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

### How It Works

When you generate test cases, Claude AI automatically receives this knowledge as context, ensuring:
- Test cases follow GL Assessment standards
- Domain terminology is understood correctly
- Tests are appropriate for the technical stack
- All required test types are included

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
