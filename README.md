# PBI/PR Analyzer

A web application for analyzing Product Backlog Items (PBIs) and Pull Requests (PRs) from Azure DevOps using Claude AI.

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

**That's it!** Start analyzing PBIs and PRs.

## Features

- **Fetch PBIs and PRs** from Azure DevOps automatically
- **AI-Powered Analysis** using Claude Opus 4.6:
  - Generate comprehensive test cases
  - Perform detailed code reviews
  - Conduct impact analysis
  - Create documentation
- **Azure CLI Authentication** - Uses your existing `az login` session
- **Simple Web App** - Runs in your browser, no desktop app issues

## How to Use

### Analyzing a PBI

1. Select **Product Backlog Item (PBI)**
2. Enter PBI ID (e.g., `95962`) and Project (e.g., `Testwise`)
3. Click **Fetch Item**
4. Select analysis types (Test Cases, Impact Analysis, Documentation)
5. Click **Analyze with Claude**
6. Review and copy results

### Analyzing a PR

1. Select **Pull Request (PR)**
2. Enter PR ID, Project, and Repository ID
3. Click **Fetch Item**
4. Select analysis types (Code Review, Test Cases, Impact Analysis, Documentation)
5. Click **Analyze with Claude**
6. Review and copy results

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
pbi-pr-analyzer/
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
