# GL Assessment Testing Standards

> Extracted from GL Platform Knowledge Base for test case generation
> Source: gl-platform-kb/context/dev-and-standards.md

## Definition of Ready (PBI level)

A PBI must meet these criteria before development:
- Can be completed in one sprint
- Technical dependencies resolved
- **Acceptance criteria documented, clear, testable**
- Refined at least once by a suitable quorum
- UX considered for customer-facing changes
- Assessment integrity changes agreed with Product Content and Stats team
- Non-functional requirements (performance, browser support) documented

## Definition of Done (PBI level)

A PBI is not complete until:
- Requirements and Acceptance Criteria met in full
- Communication requirements agreed with impacted teams
- No further refactoring required
- **Test execution complete, all tests passing**
- **ALL associated bugs addressed**
- **New automated tests introduced**
- **Existing automated tests updated if impacted**
- Performance testing requirements agreed
- Successfully deployed to DEV-CI and QA (Tardis: also PREB if appropriate)
- **Browser compatibility: Chrome primary; sanity-check on other browsers/devices**

## Acceptance Criteria Format

Team Mightier uses **Given/When/Then** format (BDD style):

- **Given** - Initial context or preconditions
- **When** - The action or event
- **Then** - Expected outcome or result

Example:
```
Given a teacher has logged into Testwise
When they navigate to the Create Sitting page
Then they should see a list of available assessments
```

## Testing Approach

### Testing Philosophy
**Shift-left testing**: testing activities begin before development (test cases written during PBI refinement). Aim: avoid testing blockages at end of sprint.

### Test Types Required

#### 1. Cypress (E2E / UI Testing)
Used for Epoch UI, Reporting UI, and component library.

**Key rules:**
- **Cucumber preprocessor** with Gherkin syntax (Given/When/Then feature files)
- All network calls **mocked via `cy.intercept`** — tests run standalone (no live server)
- UI elements referenced via `data-cy` attributes (not CSS class selectors)
- Steps reusable across feature files; maximise step reuse
- **Accessibility tests:** Cypress Axe with standards: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`

#### 2. SpecFlow (Regression / Integration Testing)
- BDD automation regression suite
- Runs against three test suites: Testwise API, Reporting API, Testplayer API
- Reports stored in Azure Blob Storage

#### 3. Jest (Angular Unit Testing)
- Jasmine-compatible API
- Scripts: `test:ci` for CI pipeline (includes coverage)

#### 4. TestContainers (.NET Integration Testing)
- For managing Docker containers directly from test code
- Allows SQL Server and Azurite containers to spin up before tests
- Tests must run on **Linux/Ubuntu build agents**

## Browser Compatibility Requirements

- **Chrome** is the primary browser
- Must perform **sanity-check** on other browsers/devices
- All front-end changes must be tested across supported browsers

## Test Case Categories to Consider

When generating test cases, include:

1. **Happy Path / Positive Tests**
   - Standard user flows
   - Expected inputs and outputs
   - Normal system behavior

2. **Negative Tests**
   - Invalid inputs
   - Unauthorized access attempts
   - Error handling scenarios

3. **Edge Cases**
   - Boundary values
   - Empty/null data
   - Maximum/minimum values
   - Special characters

4. **Integration Tests**
   - API interactions
   - Database operations
   - External service integrations (Wonde, Clever)

5. **Performance Tests**
   - Load scenarios
   - Response time expectations
   - Resource usage

6. **Accessibility Tests**
   - WCAG 2.2 AA compliance
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast

7. **Security Tests**
   - Authentication/authorization
   - Data validation
   - SQL injection prevention
   - XSS prevention

## Work Item Hierarchy

Epics → Features → PBIs (Product Backlog Items) → Tasks / Bugs / Impediments

**PBI States:** New → Refined → Development In Progress → Development Done → Testing In Progress → Testing Done → UAT In Progress → Done

## Team Mightier Process (Shift-Left)

PBIs: New → Approved (Dev+Tester pair write ACs in Given/When/Then) → Committed (ready for refinement) → **Refined (test cases created, then estimated)** → Dev In Progress → Dev Done (PR raised, peer review) → Testing In Progress (local testing, PR approval) → Done (artefact promoted to PREB then PROD).

---

*Use these standards when generating test cases to ensure comprehensive coverage and alignment with GL Assessment's quality expectations.*
