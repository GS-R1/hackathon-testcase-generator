# GL Assessment Platform Overview

> Extracted from GL Platform Knowledge Base for test case generation
> Source: gl-platform-kb/context/company-and-platform.md

This document provides platform context to understand technical requirements when generating test cases.

---

## Company & Product Overview

GL Assessment (GL) is a UK-based digital assessment company that develops and delivers standardised educational assessments for schools. The core delivery platform is called **Testwise** (internally also referred to as **Epoch** in its v2.0 incarnation).

**Key selling point:** GL uses **Standardised Age Scores (SAS)**, putting results in context against a national sample. A student performing at the expected level receives SAS 100; 50% of scores fall between 90–110.

### Core Products on Testwise

| Product | Full Name | Format |
|---|---|---|
| CAT4 | Cognitive Ability Test v4 | Digital + Paper |
| PTE | Progress Test in English (Forms A, B) | Digital + Paper |
| PTM | Progress Test in Maths (Forms A, B) | Digital + Paper |
| PTS | Progress Test in Science (Forms A, B) | Digital + Paper |
| NGRT | New Group Reading Test (Forms A, B, C) | Digital + Paper |
| NGST | New Group Spelling Test (Forms A, B, C) | Digital |
| NGMT | New Group Maths Test | Digital (Trial) |
| PASS | Pupil Attitudes to Self and School | Digital |
| Dyscalculia | Dyscalculia Screener | Digital |
| Dyslexia | Dyslexia Screener | Digital |
| EXACT | Assessment (4 subtests) | Digital |
| ISEB → AAT | Admissions assessment (rebranding) | Digital |
| KRS | Kirkland Rowell Surveys | Digital |
| Placement | Placement test | Digital |
| Wellcomm | Communication/language assessment | Digital |

## Core Platform Architecture (Testwise / Epoch)

### Epoch (Administrative Platform)

"Epoch" is the back-office of Testwise — responsible for school/student onboarding, sittings, and test management.

| Component | Repo | Stack | Role |
|---|---|---|---|
| Epoch UI (legacy) | `gl.platform.ui` | Angular 9.2.4 | Admin SPA |
| Epoch UI (current) | `gl.epoch.ui` | Angular (newer) | Team Mightier |
| Services API | `gl.platform.service` | .NET Core 3.1 | Controllers → Services → Repositories (Dapper) |
| Repositories API | `gl.platform.repositories` | .NET Core 3.1 | IdentityServer4 + EntityFramework to Epoch DB |
| Epoch DB | `gl.platform.database` | SQL (.NET 4.5.2 / DBUP 3.2.1) | dacpac + DBUP migration scripts |

Three-layer pattern: Controllers → Services → Repositories. Repositories use **Dapper** ORM to communicate with Epoch SQL database.

### Testwise API (Entry Point)
- Repo: `gl.testwise`, .NET 7.0
- Routes requests to Services API or Reporting API
- Handles Blob Storage communication and SignalR connections
- **Azure SignalR Service** for real-time updates (test lobby, sitting progress, report availability)

### Testplayers

Angular SPAs built on shared `gl.testplayer.core` npm library.

**Batman testplayers (product-specific):** CAT4, Dyscalculia (Robin), Dyslexia (Robin), Exact, ISEB, NGRT, NGST, PASS, PTE, PTM, PTS

**Dynamic Testplayer** (`gl.testplayer.dynamic`): Single manifest-driven repo; currently used for NGMT Trial on Epoch.

**Key testplayer behaviours:**
- Offline mode supported during a test
- On completion: response uploaded to Azure Blob Storage (`epoch-test-responses` container), Testwise API notified
- Students: 10-hour access token, no refresh token
- Standard users: 5-minute access token, 1-hour refresh token

### Scoring Architecture

Azure Functions (.NET Core 3.1), one per product:
- `scoring.{product}` — scoring calculation
- `scoring.{product}.testresponse.resolver` — error recovery (reformats test response if scoring fails)
- `scoring.common` — shared dependency used by all scoring functions

Scoring triggered via Azure Storage Queue (`testwise-productscoring-storage-queue-X`).

### Reporting Architecture
- Reporting UI: `gl.report.ui`, Angular 16.2.5
- Reporting API: `gl.reporting`, .NET 7.0 — Controllers/Services/Repositories pattern
- Reporting DB: `reporting.db`, managed with DbUp
- Legacy TRS: `gl.reporting.trs`, Java 8 (Apache Tomcat, Spring 2.5, Hibernate 3, Apache FOP for PDF)
- HTML reports: generated in Reporting API
- PDF/Excel/CSV: generated via eTRS (Java service)

## Technology Stack

### Front-End
- **Angular** (v5.x legacy testplayers → v9.x platform UI → v12–v16+ newer repos)
- **NgRx** (state management in Epoch UI)
- **Angular Material** (primary UI component set)
- **Tailwind CSS** + **Sass** (Epoch UI and Reporting UI)
- **SignalR** (`@microsoft/signalr` for real-time updates)
- **Application Insights JS SDK** (`@microsoft/applicationinsights-web`)
- **ngx-translate** (internationalisation; `en-GB` and `en-US` locale files)
- **FontAwesome Pro** (icons)

### Back-End
- **.NET Core 3.1** and **.NET 7.0** (C# APIs)
- **IdentityServer4** — OUT OF SUPPORT since Nov 2022; active replacement work ongoing
- **Dapper** (ORM for SQL queries in Services API)
- **EntityFramework** (used in Repositories API with IdentityServer)
- **AutoMapper**, **FluentValidation**, **Polly**, **Newtonsoft.Json** (common NuGet dependencies)
- **Azure Functions** (.NET Core 3.1) for scoring
- **Java 8** — `gl.reporting.trs` (Spring 2.5, Hibernate 3, Apache FOP for PDF generation)

### Databases & Storage
- **Azure SQL Server** (primary: Epoch DB, Reporting DB, scoring lookup DBs, watermark DB, ingestion pipeline DB)
- **Azure Blob Storage** (test responses, scoring lookup CSVs, branding assets, GLDD metrics)
- **Azure Cosmos DB** (referenced in scoring.common dependencies)
- **Azure Storage Queue** for scoring message dispatch
- **Azurite** (local Azure Storage emulator for development/testing)

### Data & Reporting
- **Power BI** (Premium capacity workspace required for embedding reports)
- **Azure Data Factory (ADF)** (ETL/ingestion pipelines)
- **SQL Server Management Studio (SSMS)**

### Infrastructure / DevOps
- **Azure** (primary cloud provider)
- **Azure DevOps** (Boards, Repos, Pipelines, Test Plans, Artifacts)
- **Azure Front Door** (entry-point WAF)
- **Azure App Configuration** (feature flag management)
- **Azure Key Vault** (secrets management)
- **Azure Container Registry (ACR)**
- **Azure Kubernetes Service (AKS)** (hosts self-hosted build agents with KEDA autoscaling)
- **Terraform** (IaC)
- **Docker / Docker Compose** (local development and CI testing)
- **NGINX** (serving Angular apps in containers)
- **Cloudflare** (DNS management and ACME challenge responses for SSL certs)

### Testing Tools
- **Cypress** + Cucumber (E2E testing)
- **SpecFlow** (BDD regression)
- **Jest** (Angular unit tests — replaced Karma April 2024)
- **XUnit** (.NET integration tests)
- **TestContainers** (.NET — Docker containers in integration tests)
- **Mend Bolt** (open-source security and licence scanning)
- **SonarCloud / SonarLint** (static code analysis)
- **Application Insights** (monitoring/telemetry)

### Environments

| Environment | Purpose |
|---|---|
| DEVCI | Continuous integration / developer (auto-deploys on PR merge) |
| QA | Quality assurance testing |
| PREB | Pre-production B environment |
| PRODB | Production B environment |
| BAUB | Business As Usual B environment (DBA access) |

### Authentication Framework
- **IdentityServer4** (OpenID Connect / OAuth 2.0 for ASP.NET Core)
- **OUT OF SUPPORT** since November 2022
- MFA: ASP.NET Core Identity with TOTP

### Token Lifecycle

| User Type | Access Token | Refresh Token |
|---|---|---|
| Standard users | 5 minutes | 1 hour |
| Students | 10 hours | None (refresh attempt logs student out) |

### Password Policy
- Length: 8 to 100 characters
- Must contain: lowercase letter, uppercase letter, and a number
- No special character requirement
- Max login attempts: **3** → **5-minute lockout**

---

## Integration Points

### SIS Integrations
- **Wonde** — UK MIS/SIS bridge for school/student data sync
- **Clever** — US education SSO provider (Clever SIS integration)

### Common Integration Patterns
- **REST APIs** for external systems
- **Azure Storage Queues** for asynchronous processing
- **Azure SignalR** for real-time updates
- **OAuth 2.0** for authentication

---

*Use this platform context to understand the technical environment when generating test cases.*
