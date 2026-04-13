# GL Assessment — Glossary / Jargon

> Extracted from GL Platform Knowledge Base for test case generation
> Source: gl-platform-kb/context/glossary.md

This glossary helps understand domain-specific terms that may appear in PBI descriptions.

---

| Term / Acronym | Meaning |
|---|---|
| Testwise | Core GL SaaS assessment platform (branded name) |
| Epoch | Internal name for Testwise v2.0 administrative platform |
| GLDD | GL Data Dashboard — Power BI embedded analytics in Testwise |
| SAS | Standard Age Score — primary normalised score metric (100 = at expected level) |
| NPR | National Percentile Rank |
| Stanine | Standard nine-point scoring scale |
| TRS / eTRS | Legacy Java report generation service (`gl.reporting.trs`) |
| Batman | Product-specific Angular testplayer framework |
| Robin | Batman variant for Dyslexia/Dyscalculia (uses embedded Othello engine) |
| Othello | Legacy JavaScript testplayer (pre-Hyve platform, now obsolete) |
| CAT4 | Cognitive Ability Test version 4 |
| PTE / PTM / PTS | Progress Tests in English / Maths / Science |
| NGRT | New Group Reading Test (Forms A, B, C) |
| NGST | New Group Spelling Test |
| NGMT | New Group Maths Test |
| PASS | Pupil Attitudes to Self and School |
| CBSE | Central Board of Secondary Education (India) |
| KRS | Kirkland Rowell Surveys |
| ISEB | Independent Schools Examinations Board (assessment; rebranding to AAT) |
| AAT | New name for rebranded ISEB assessment (Team Ghost) |
| CDS | Complete Digital Solution/Service — all-products sales bundle |
| TWUS | Testwise US — US-market version |
| Clever | US education SSO provider (Clever SIS integration) |
| Wonde | UK MIS/SIS bridge for school/student data sync |
| MIS | Management Information System (school student data system) |
| SIS | Student Information System |
| PBI | Product Backlog Item |
| DoD | Definition of Done |
| DoR | Definition of Ready |
| UAT | User Acceptance Testing |
| DEVCI | Development CI environment |
| PREB | Pre-production B environment |
| PRODB | Production B environment |
| BAUB | Business As Usual B environment (DBA access) |
| USPRE / USProd / USBau | US equivalents of PREB / PRODB / BAUB |
| ADF | Azure Data Factory (ETL/ingestion pipeline service) |
| ACR | Azure Container Registry |
| AKS | Azure Kubernetes Service |
| KEDA | Kubernetes Event Driven Autoscaling |
| VNet | Azure Virtual Network |
| PIM | Privileged Identity Management (Azure AD) |
| SIEM | Security Information and Event Management |
| IaC | Infrastructure as Code (Terraform at GL) |
| PR | Pull Request |
| IdentityServer4 | OpenID Connect/OAuth 2.0 auth framework (out of support since Nov 2022) |
| Dapper | Lightweight .NET ORM used for DB access in GL services |
| DBUP | Database migration tool for SQL schema changes |
| NuGet feed | Internal feed: `testwise-nuget-feed` in Azure DevOps Artifacts |
| `gl.testwise` | Testwise entry-point API repository |
| `gl.platform.service` | Services API (core business logic) |
| `gl.platform.repositories` | Repositories API (auth + data access) |
| `gl.platform.database` | Epoch database project |
| `gl.platform.sis` | SIS integration repo (Wonde + Clever) |
| `gl.testplayer.core` | Shared Angular library for all Batman testplayers |
| `gl.testplayer.dynamic` | Dynamic testplayer (manifest-driven; currently NGMT Trial) |
| `scoring.common` | Shared .NET library for all scoring Azure Functions |
| `scoring.lookups.*` | CSV lookup files per product for scoring reference data |
| `GL.AutomationSpecflow` | SpecFlow regression test suite repo |
| `dockerised-development` | Full local Testwise stack via Docker Compose |
| `gl.tf.featureflags` | Terraform repo managing feature flags |
| `gl.tf.modules` | Private monorepo of reusable Terraform modules |
| `gl.tf.core` | Main Terraform consumer repo |
| `testwise-branding` | Repo for brand assets and icons (single source of truth) |
| `gl.component.lib` | Custom Angular component library (`@gl/component.lib` npm package) |
| `gl.pipelines.templates` | Shared Azure Pipeline YAML template repository |
| `local-setup-scripts` | Developer bootstrapper scripts for local environment setup |
| `local-container-setup` | Docker Compose config for local Testwise stack |
| `paper.data.matching.*` | Azure Functions for paper assessment data matching |
| `paper.data.scoring.*` | Azure Functions for paper assessment data scoring |
| Launchpad | Confluence knowledge hub at illuminate.atlassian.net (introduced Aug 2024) |
| Architecture Guild | Fortnightly cross-team tech meeting run by Team Athena |
| Delivery Guild | Fortnightly delivery process meeting (from Oct 2024) |
| DORA metrics | DevOps Research & Assessment metrics used as KPIs |
| Conway's Law | System design reflects organisational communication structure |
| Team Topologies | Book influencing GL's team structure and ownership model |
| `rgl` | CLI tool for dockerised-development stack (e.g. `rgl start epoch-dev`) |
| Azurite | Microsoft local Azure Storage emulator |
| Chromatic | Visual testing/snapshot service for Storybook component library |
| Mend Bolt | Open-source dependency security and licence scanning in CI pipelines |
| SonarCloud | Cloud static code analysis (budget approved Oct 2024) |
| SonarLint | IDE plugin version of SonarCloud |
| TestContainers | .NET library for managing Docker containers in integration tests |
| Renovate | Automated dependency management tool (introduced Feb 2024) |
| Snyk | Security tool for code and containers (presented May 2024) |
| `gl.templates` | .NET CLI project scaffolding templates (introduced Jan 2024) |
| LastPass | Secure credential and certificate material store |
| Barracuda WAF | Production web application firewalls for Hyve/testwise.net platform |
| Cloudflare | DNS management and ACME challenge provider for SSL certs |
| DPIA | Data Protection Impact Assessment |
| UPN | Unique Pupil Number (UK school student identifier) |
| MIS ID | Management Information System student identifier |
| `AspNetUsersLegacyPasswords` | Table for paper assessment users' TRS credentials (cleared on first Testwise login) |
| `SchoolSisDataExtension` | Table storing Wonde/Clever IDs and sync state per school |
| `WondeEvent` | Table tracking Wonde integration event state |
| `IsInitialCleverSyncComplete` | Flag in `SchoolSisDataExtension`; `false` until first Clever onboard completes |
| `tw-paperdata-storage-queue-*` | Azure Storage Queues for paper assessment data processing |
| `testwise-productscoring-storage-queue-*` | Azure Storage Queues for digital scoring |
| `epoch-test-responses` | Blob container for digital test response uploads |
| `gl-data-dashboard` | Blob container for GLDD user metrics (Data Lake) |

---

*Use this glossary to understand domain-specific terminology in PBI descriptions when generating test cases.*
