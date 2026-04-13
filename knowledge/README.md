# Knowledge Base

This folder contains curated knowledge extracted from the GL Platform Knowledge Base to enhance test case generation with Claude AI.

## Purpose

The files in this folder provide context and standards that Claude uses when generating test cases for GL Assessment PBIs. This ensures test cases are:
- Aligned with GL's development standards
- Comprehensive and thorough
- Domain-aware (understanding GL/Testwise terminology)
- Technically accurate for the platform

## Files

### [testing-standards.md](testing-standards.md)
Contains GL Assessment's testing standards including:
- Definition of Ready (DoR) and Definition of Done (DoD)
- Acceptance criteria format (Given/When/Then)
- Required test types (Cypress, SpecFlow, Jest, TestContainers)
- Browser compatibility requirements
- Test case categories to consider

### [glossary.md](glossary.md)
GL/Testwise domain glossary with:
- Product acronyms (CAT4, NGRT, PASS, etc.)
- Technical terms (SAS, NPR, Stanine, Batman, Epoch, etc.)
- Infrastructure terms (DEVCI, PREB, PRODB, etc.)
- Repository names and their purposes

### [platform-overview.md](platform-overview.md)
Technical platform context including:
- Core products and architecture
- Technology stack (Angular, .NET, Azure services)
- Authentication and authorization patterns
- Integration points (Wonde, Clever)
- Environment structure

### [examples/](examples/)
Example PBIs and their high-quality test cases (Optional):
- Located in `examples/pbis/` (PBI JSON files) and `examples/test-cases/` (test case markdown files)
- Files must have matching names (e.g., `user-login.json` and `user-login.md`)
- Claude learns from these examples to generate similar quality test cases
- See [examples/README.md](examples/README.md) for detailed instructions on adding examples

### [examples/definition-of-done/](examples/definition-of-done/)
Definition of Done quality criteria (Optional):
- Markdown files defining what makes test cases "ready for use"
- Used by Claude for self-review and iterative improvement
- Enables automatic quality scoring (1-10) of generated test cases
- If empty, Claude generates without quality validation
- See [examples/definition-of-done/README.md](examples/definition-of-done/README.md) for detailed instructions

## How It's Used

When you click "Generate Test Cases" in the application, the server reads these knowledge files and includes them in the prompt sent to Claude AI. This gives Claude the context needed to generate relevant, comprehensive test cases that align with GL Assessment's standards.

## Maintenance

These files are curated extracts from the larger GL Platform Knowledge Base. They should be updated when:
- Testing standards change
- New products or technologies are added
- Significant architectural changes occur
- Terminology evolves

## Source

Original content sourced from:
- `gl-platform-kb/context/dev-and-standards.md`
- `gl-platform-kb/context/glossary.md`
- `gl-platform-kb/context/company-and-platform.md`

Last updated: April 2026
