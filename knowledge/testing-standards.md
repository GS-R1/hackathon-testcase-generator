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

## PBI Quality Assessment Criteria

When assessing PBI quality before test case generation, check for these gaps:

### Critical Gaps (Must Address)
- Missing or vague acceptance criteria
- No description or insufficient detail
- Undefined success criteria
- Missing affected components/systems
- No specification for validation rules (e.g., password complexity)

### Important Gaps (Should Address)
- No defined user personas or roles
- Missing non-functional requirements (performance, security)
- Unclear edge cases or error handling
- No mention of data requirements
- Missing integration points or API contracts

### Nice-to-Have Information
- Missing UI/UX designs or mockups
- No performance benchmarks specified
- Missing API specifications or contracts
- No test data availability information
- Missing browser/device compatibility requirements

---

## Test Type Selection Guide

### Core Test Types (Always Consider)

#### Functional Testing - Positive Paths (Priority: CRITICAL)
- Verify features work as intended with valid inputs
- Cover core user workflows and business logic
- Ensure acceptance criteria are met
- Test standard use cases

#### Functional Testing - Negative Paths (Priority: HIGH)
- Verify error handling and invalid inputs
- Test validation rules and constraints
- Ensure system fails gracefully
- Test unauthorized access scenarios

#### Edge Cases (Priority: MEDIUM)
- Boundary conditions and limits
- Unusual but valid scenarios
- Special characters and unicode
- Concurrent operations
- Extremely long or empty inputs

#### Regression Testing (Priority: HIGH)
- Ensure existing functionality isn't broken
- Risk-based selection (use risk matrix below)
- Focus on high-impact areas
- Related features and integrations

### Additional Test Types (Context-Dependent)

#### Integration Testing (Priority: HIGH)
**When to use:** Multiple systems/components interact
- API integrations with external services
- Database connectivity and operations
- Message queue processing
- Service-to-service communication

#### Performance Testing (Priority: MEDIUM-HIGH)
**When to use:** Speed, load, or scalability matters
- Response time under normal load
- System behavior under peak load
- Resource usage and optimization
- Database query performance

#### Security Testing (Priority: CRITICAL)
**When to use:** Handling sensitive data, authentication, or authorization
- SQL injection prevention
- XSS and CSRF protection
- Authentication and authorization checks
- Data encryption and secure storage
- Session management and timeout

#### Accessibility Testing (Priority: HIGH for user-facing)
**When to use:** User-facing interfaces
- WCAG 2.2 AA compliance
- Screen reader compatibility
- Keyboard-only navigation
- Color contrast and visual clarity
- Focus indicators and tab order

#### Responsiveness Testing (Priority: MEDIUM-HIGH for web)
**When to use:** Web applications across devices/resolutions
- Mobile (320px-768px)
- Tablet (768px-1024px)
- Desktop (1024px+)
- Orientation changes (portrait/landscape)

#### UI/Visual Testing (Priority: MEDIUM)
**When to use:** Visual validation against designs
- Layout and positioning
- Style consistency (colors, fonts, spacing)
- Visual elements (buttons, icons, images)
- Loading states and animations

#### API Contract Testing (Priority: HIGH)
**When to use:** API changes or new endpoints
- Request/response schema validation
- Breaking change detection
- Backward compatibility
- Version management

#### Data Testing (Priority: HIGH)
**When to use:** Data seeding, migration, or external data consumption
- Data migration validation
- Data integrity checks
- External data source integration
- Data transformation accuracy

---

## Risk Assessment for Regression Testing

Use **Probability × Severity** matrix to prioritize regression areas:

### Probability Levels
- **High**: Change directly modifies this area OR tightly coupled component
- **Medium**: Indirect dependency OR shared data structures
- **Low**: Loosely coupled OR different domain

### Severity Levels
- **Critical**: System unusable, data loss, security breach, financial impact
- **High**: Major feature broken, significant user impact, workflow blocked
- **Medium**: Minor feature affected, workaround available
- **Low**: Cosmetic issue, minimal impact

### Risk Priority Calculation
- **Critical Priority**: High Probability + Critical/High Severity
- **High Priority**: High Probability + Medium Severity OR Medium Probability + Critical/High Severity
- **Medium Priority**: Medium Probability + Medium Severity OR Low Probability + Critical/High Severity
- **Low Priority**: All other combinations

### Risk Assessment Process
1. Identify all areas potentially affected by the change
2. For each area, assess Probability and Severity
3. Calculate Risk Priority
4. Recommend testing for Critical and High risk areas
5. Consider Medium risk areas based on available time/resources

---

## Test Case Quality Standards

All generated test cases must meet these criteria:

### Clarity
- **Titles are descriptive and unique** - No generic names like "Test login"
- **Steps are numbered and actionable** - Each step is executable
- **Expected results are specific and measurable** - No ambiguous language
- **No vague terms** - Avoid "should work", "properly", "correctly"

### Completeness
- **All fields populated** - No TBD or placeholder values
- **Prerequisites clearly stated** - Required setup or state defined
- **Test data specified** - Exact data values provided
- **Pass/fail criteria defined** - Objective success criteria

### Traceability
- **Linked to acceptance criteria** - Maps to specific AC
- **Linked to PBI/work item** - Clear parent relationship
- **Related test cases cross-referenced** - Dependencies noted

### Testability
- **Executable by anyone** - Given prerequisites, anyone can run it
- **Results are objectively verifiable** - No subjective judgment needed
- **Independent where possible** - Doesn't rely on other tests
- **Repeatable** - Same inputs produce same results

### Maintainability
- **Structured format** - Easy to update and modify
- **Automation tags included** - Where applicable
- **Clear notes** - On risks, dependencies, limitations
- **Version controlled** - Tracked in test management system

---

## Automation Feasibility Criteria

### High Priority for Automation
**Characteristics:**
- Repetitive tests executed frequently
- Regression test candidates
- Tests with clear, deterministic outcomes
- Tests requiring multiple data sets
- Performance/load tests
- Security tests (injection attempts, etc.)
- API/integration tests

**Tools:** Selenium, Playwright, Cypress, RestAssured, Pytest, OWASP ZAP

### Medium Priority for Automation
**Characteristics:**
- UI tests with stable elements
- Tests requiring moderate setup
- Cross-browser/device tests
- Data validation tests
- Visual regression tests

**Tools:** Selenium with screenshot comparison, Percy, Applitools

### Low Priority for Automation
**Characteristics:**
- Tests requiring subjective judgment
- Tests with frequently changing UI
- Visual design validation (without visual testing tools)
- Complex user workflows with many variations

**Tools:** Manual testing with assistance from automation for repetitive parts

### Not Recommended for Automation
**Characteristics:**
- Exploratory testing scenarios
- Usability tests requiring human judgment
- Ad-hoc testing
- Tests where automation cost exceeds value

**Approach:** Manual testing only

---

## Test Data Categories

### Valid Test Data
- Typical user inputs that should succeed
- Represent common usage patterns
- Cover different user roles/personas
- Examples: Standard email formats, valid phone numbers, expected date ranges

### Invalid Test Data
- Malformed inputs (invalid email format)
- Missing required fields
- Wrong data types (letters in numeric field)
- Out-of-range values (negative quantity)

### Edge Case Test Data
- Boundary values (minimum/maximum lengths)
- Special characters (!@#$%^&*)
- Unicode and internationalization (中文, العربية)
- Extremely long inputs (SQL injection length)
- Empty strings and null values

### Security Test Data
- SQL injection payloads: `' OR '1'='1`, `admin'--`, `1; DROP TABLE users`
- XSS payloads: `<script>alert('xss')</script>`, `<img src=x onerror=alert('xss')>`
- CSRF tokens and session hijacking attempts
- Authentication bypass attempts
- Path traversal: `../../etc/passwd`

---

## Work Item Type Decision Matrix

Quick reference for test type recommendations based on work item type:

| Work Item Type | Core Tests | Additional Tests (if applicable) |
|----------------|------------|----------------------------------|
| **User Story** | Functional (pos/neg), Edge Cases, Regression | UI, UX, Accessibility, Responsiveness |
| **Bug Fix** | Functional (negative), Regression | Related feature tests, root cause validation |
| **New Feature** | Functional (pos/neg), Edge Cases, Integration | Performance, Security, UI, Accessibility |
| **API Change** | Functional, Integration, Regression | Performance, Security, Contract Testing |
| **UI Change** | UI, Responsiveness, Accessibility | Functional, Visual Regression |
| **Security Feature** | Security, Functional | Penetration Testing, Compliance Validation |
| **Performance Improvement** | Performance, Functional | Load, Stress, Scalability |
| **Data Migration** | Data Testing, Functional | Integration, Regression, Rollback Testing |
| **Infrastructure** | Integration, Performance | Availability, Disaster Recovery, Failover |

---

*Use these standards when generating test cases to ensure comprehensive coverage and alignment with GL Assessment's quality expectations.*
