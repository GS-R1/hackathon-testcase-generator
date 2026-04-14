const fs = require('fs');
const path = require('path');

/**
 * PBI Quality Assessment Agent
 *
 * This module provides AI-powered quality assessment for Product Backlog Items (PBIs)
 * using Claude AI with few-shot learning from example PBIs.
 *
 * Based on principles from "How to Guide Your Agent for High-Quality Results"
 */

class PBIQualityAssessor {
  constructor() {
    this.examples = this.loadExamples();
    this.knowledge = this.loadKnowledgeBase();
  }

  /**
   * Load knowledge base files (testing standards, glossary, platform overview)
   */
  loadKnowledgeBase() {
    try {
      const testingStandards = fs.readFileSync(path.join(__dirname, 'knowledge/testing-standards.md'), 'utf-8');
      const glossary = fs.readFileSync(path.join(__dirname, 'knowledge/glossary.md'), 'utf-8');
      const platformOverview = fs.readFileSync(path.join(__dirname, 'knowledge/platform-overview.md'), 'utf-8');

      console.log('📚 PBI Quality Assessor loaded knowledge base:');
      console.log(`  ✓ testing-standards.md (${(testingStandards.length / 1024).toFixed(1)} KB)`);
      console.log(`  ✓ glossary.md (${(glossary.length / 1024).toFixed(1)} KB)`);
      console.log(`  ✓ platform-overview.md (${(platformOverview.length / 1024).toFixed(1)} KB)`);

      return {
        testingStandards,
        glossary,
        platformOverview
      };
    } catch (error) {
      console.log('⚠ PBI Quality Assessor: Could not load knowledge base:', error.message);
      return null;
    }
  }

  /**
   * Load example PBIs from knowledge base or fallback to hard-coded synthetic examples
   */
  loadExamples() {
    const examples = {
      good: [],
      ok: [],
      bad: []
    };

    // Try to load from knowledge base subdirectories
    const pbisBaseDir = path.join(__dirname, 'knowledge', 'examples', 'pbis');

    let loadedFromKnowledgeBase = false;

    if (fs.existsSync(pbisBaseDir)) {
      try {
        // Load from good/ subdirectory
        const goodDir = path.join(pbisBaseDir, 'good');
        if (fs.existsSync(goodDir)) {
          const goodFiles = fs.readdirSync(goodDir).filter(f => f.endsWith('.json'));
          for (const file of goodFiles) {
            try {
              const content = fs.readFileSync(path.join(goodDir, file), 'utf8');
              const pbi = JSON.parse(content);
              examples.good.push(this.formatPBIForPrompt(pbi));
              console.log(`  ✓ Loaded good example: ${file}`);
            } catch (error) {
              console.log(`  ⚠ Could not load ${file}:`, error.message);
            }
          }
        }

        // Load from okay/ subdirectory
        const okayDir = path.join(pbisBaseDir, 'okay');
        if (fs.existsSync(okayDir)) {
          const okayFiles = fs.readdirSync(okayDir).filter(f => f.endsWith('.json'));
          for (const file of okayFiles) {
            try {
              const content = fs.readFileSync(path.join(okayDir, file), 'utf8');
              const pbi = JSON.parse(content);
              examples.ok.push(this.formatPBIForPrompt(pbi));
              console.log(`  ✓ Loaded okay example: ${file}`);
            } catch (error) {
              console.log(`  ⚠ Could not load ${file}:`, error.message);
            }
          }
        }

        // Load from bad/ subdirectory
        const badDir = path.join(pbisBaseDir, 'bad');
        if (fs.existsSync(badDir)) {
          const badFiles = fs.readdirSync(badDir).filter(f => f.endsWith('.json'));
          for (const file of badFiles) {
            try {
              const content = fs.readFileSync(path.join(badDir, file), 'utf8');
              const pbi = JSON.parse(content);
              examples.bad.push(this.formatPBIForPrompt(pbi));
              console.log(`  ✓ Loaded bad example: ${file}`);
            } catch (error) {
              console.log(`  ⚠ Could not load ${file}:`, error.message);
            }
          }
        }

        if (examples.good.length > 0 || examples.ok.length > 0 || examples.bad.length > 0) {
          console.log(`📋 Loaded ${examples.good.length} good, ${examples.ok.length} okay, ${examples.bad.length} bad example PBIs from knowledge base`);
          loadedFromKnowledgeBase = true;
        }
      } catch (error) {
        console.log('⚠ Could not read knowledge base directory:', error.message);
      }
    }

    // Fall back to hard-coded synthetic examples if knowledge base is empty
    if (!loadedFromKnowledgeBase) {
      console.log('ℹ Using hard-coded synthetic example PBIs (no examples found in knowledge base)');
      examples.good.push(this.getSyntheticGoodExample());
      examples.ok.push(this.getSyntheticOkExample());
      examples.bad.push(this.getSyntheticBadExample());
    }

    return examples;
  }

  /**
   * Format a PBI JSON object into a readable prompt format
   */
  formatPBIForPrompt(pbi) {
    const title = pbi.fields?.['System.Title'] || 'No title';
    const description = pbi.fields?.['System.Description'] || 'No description';
    const acceptanceCriteria = pbi.fields?.['Microsoft.VSTS.Common.AcceptanceCriteria'] || 'No acceptance criteria';
    const state = pbi.fields?.['System.State'] || 'Unknown';
    const effort = pbi.fields?.['Microsoft.VSTS.Scheduling.Effort'] || 'Not estimated';

    // Strip HTML tags for cleaner display
    const cleanDescription = this.stripHtml(description);
    const cleanAcceptanceCriteria = this.stripHtml(acceptanceCriteria);

    return `**PBI ID**: ${pbi.id}
**Title**: ${title}
**State**: ${state}
**Effort**: ${effort}

**Description**:
${cleanDescription}

**Acceptance Criteria**:
${cleanAcceptanceCriteria}`;
  }

  /**
   * Simple HTML tag stripper
   */
  stripHtml(html) {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<li>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n\n+/g, '\n\n')
      .trim();
  }

  getSyntheticGoodExample() {
    return `**User Story**: As a TestWise administrator, I want to enable multi-factor authentication (MFA) for all user accounts so that we can prevent unauthorized access even if passwords are compromised.

**Business Value**: Reduces security breach risk by 99.9%, meets SOC 2 compliance requirements, protects sensitive student data, expected to prevent 2-3 security incidents per year (avg cost: $50K each).

**Acceptance Criteria**:
- Given I am a user logging in for the first time after MFA is enabled, when I successfully enter my username and password, then I should be prompted to set up MFA with options for SMS, Authenticator App, or Email
- Given I choose to set up MFA with an authenticator app, when I proceed with setup, then I should see a QR code to scan and receive backup codes
- Given I have MFA enabled, when I log in, then I should be prompted to enter my MFA code with 3 attempts allowed
- Given I cannot access my primary MFA method, when I choose to use a backup code, then I should be able to enter one of my 10 single-use backup codes

**Technical Requirements**: TOTP standard (RFC 6238), bcrypt for backup codes (cost 12), rate limiting (3 attempts = 5min lockout), SMS via Twilio, support Chrome 90+/Firefox 88+/Safari 14+, handle 500 concurrent verifications, MFA challenge within 2 seconds.

**Definition of Done**: All AC met, >90% unit test coverage, security review completed, penetration testing performed, user/admin documentation updated, code reviewed by 2 senior developers, UAT completed by 3 pilot users.`;
  }

  getSyntheticOkExample() {
    return `**User Story**: Users want to export their test results to CSV format so they can analyze the data in Excel or other tools.

**Acceptance Criteria**:
- Given I am viewing the test results page, when I look for export options, then I should see an "Export to CSV" button
- Given I click the "Export to CSV" button, when the export completes, then a CSV file should download with all test results
- The CSV should include columns for: Test ID, Test Name, Student Name, Score, Date Taken, Duration

**Technical Requirements**: Use existing test results API, generate CSV server-side, file size max 50MB, UTF-8 encoding.

**Definition of Done**: All acceptance criteria met, code reviewed, tests written, deployed to production.`;
  }

  getSyntheticBadExample() {
    return `**User Story**: Fix the login bug.

**Description**: The login doesn't work when users try to log in. Fix it ASAP.

**Acceptance Criteria**: Make the login work properly.

**Definition of Done**: Fixed.`;
  }

  /**
   * Build the system prompt with examples and quality standards
   */
  buildSystemPrompt() {
    // Include knowledge base context if available
    let knowledgeContext = '';
    if (this.knowledge) {
      knowledgeContext = `# CONTEXT: GL Assessment Platform and Business Domain

You are assessing PBIs for GL Assessment's Testwise platform. Use the following knowledge to inform your assessment and understand the business context:

${this.knowledge.testingStandards}

---

${this.knowledge.glossary}

---

${this.knowledge.platformOverview}

---

`;
    }

    return `${knowledgeContext}You are an expert Product Owner and Agile coach with 15+ years of experience writing and reviewing Product Backlog Items (PBIs) for GL Assessment.

Your expertise includes:
- Writing clear, actionable user stories that development teams can implement
- Defining comprehensive, testable acceptance criteria
- Assessing PBI quality and providing constructive feedback
- Ensuring PBIs provide sufficient context for developers, testers, and stakeholders
- Understanding GL Assessment's products, terminology, and technical context

Your assessments have helped teams:
- Reduce rework by 40% through better upfront clarity
- Decrease sprint planning time by 30% with well-defined requirements
- Improve team velocity through elimination of ambiguous requirements
- Prevent production defects through comprehensive acceptance criteria

## YOUR MISSION

Assess the quality of Product Backlog Items and categorize them as GOOD, OK, or BAD based on established quality standards.

## QUALITY STANDARDS FOR PBIs

### GOOD PBIs have:
✅ Clear user story format: "As a [user], I want [goal], so that [benefit]"
✅ Specific, testable acceptance criteria using Given-When-Then format
✅ Business value clearly articulated with metrics where possible
✅ Technical requirements defined (performance, security, dependencies)
✅ Comprehensive Definition of Done checklist
✅ Risk assessment with mitigation strategies
✅ Related work items properly linked (parent, children, dependencies)
✅ Context explaining why this work matters
✅ Appropriate level of detail for implementation
✅ Clear scope that can be completed in one sprint

### OK PBIs have:
⚠️ Basic user story format present but may lack detail
⚠️ Acceptance criteria exist but not comprehensive or specific enough
⚠️ Some business value mentioned but not well quantified
⚠️ Technical requirements present but incomplete
⚠️ Basic Definition of Done but missing key items
⚠️ Limited context provided
⚠️ Some details unclear or ambiguous
⚠️ May be too large or too vague for one sprint
⚠️ Acceptable for implementation but will require clarification

### BAD PBIs have:
❌ Vague or missing user story
❌ No clear acceptance criteria or criteria too generic ("make it work")
❌ No business value articulated
❌ Missing technical requirements
❌ No Definition of Done
❌ Ambiguous language that will lead to misunderstanding
❌ Insufficient information for developers to implement
❌ No context or explanation
❌ Will definitely require multiple rounds of clarification

## EXAMPLES OF EACH QUALITY LEVEL

${this.formatExamples()}

## YOUR ASSESSMENT PROCESS

When assessing a PBI, you MUST:

1. **Read the entire PBI carefully** - Don't make snap judgments
2. **Compare against quality standards** - Use the criteria above systematically
3. **Compare against examples** - Which example does this PBI most resemble?
4. **Identify specific strengths and weaknesses** - Be specific, not generic
5. **Provide actionable feedback** - Tell them exactly what to fix
6. **Assign a quality category** - GOOD, OK, or BAD with confidence level
7. **Self-critique your assessment** - Before finalizing, ask yourself:
   - Did I miss any important quality factors?
   - Is my feedback specific and actionable?
   - Did I consider both what's present AND what's missing?
   - Would a developer be able to implement this PBI as-written?

## CRITICAL THINKING QUESTIONS TO ASK

Before finalizing your assessment, ask:
- Could a developer implement this without asking questions?
- Are the acceptance criteria truly testable?
- Is the business value compelling and clear?
- What could go wrong during implementation?
- What's missing that should be present?
- Is the scope appropriate for one sprint?

## OUTPUT FORMAT

Provide your assessment in the following JSON structure:

{
  "quality_category": "GOOD | OK | BAD",
  "confidence_level": "HIGH | MEDIUM | LOW",
  "overall_score": 0-100,
  "category_scores": {
    "user_story_clarity": 0-100,
    "acceptance_criteria": 0-100,
    "business_value": 0-100,
    "technical_requirements": 0-100,
    "definition_of_done": 0-100,
    "context_and_detail": 0-100
  },
  "missing_keywords": ["Keyword1", "Keyword2", "Keyword3"],
  "improvement_points": [
    {
      "label": "Brief label for what's missing or needs improvement",
      "prompt": "Clear question or prompt for the user to answer"
    }
  ],
  "summary": "2-3 sentence summary of the assessment"
}

For missing_keywords:
- Include ALL missing or unclear elements (just short 2-4 word labels)
- This provides visibility of everything that could be improved
- Keep labels concise (e.g., "Business Value", "Performance Requirements", "Security Details", "Definition of Done")

For improvement_points (the critical questions to ask):
- **ONLY include 3-5 of the MOST CRITICAL items** - not everything from missing_keywords
- Prioritize what would have the biggest impact on successful implementation
- Focus on information gaps that would block or seriously impede development work
- Each point should have:
  - label: Brief 2-4 word label (should match one from missing_keywords)
  - prompt: One short, focused question asking for the specific information needed
- Skip minor improvements - only include what's truly essential for the user to provide

## IMPORTANT GUIDELINES

- Be honest and direct - sugar-coating helps no one
- Be specific - cite actual content from the PBI
- Be constructive - always explain HOW to improve
- Be consistent - use the examples and standards, not personal opinion
- Consider the audience - PBIs serve developers, testers, and stakeholders
- Think about real-world implementation - will this actually work?

You are the last line of defense before ambiguous requirements waste developer time and create rework.
Take your responsibility seriously. Be thorough. Be specific. Be helpful.`;
  }

  /**
   * Format examples for inclusion in the system prompt
   */
  formatExamples() {
    let formatted = '';

    // Format good examples
    if (this.examples.good.length > 0) {
      formatted += '### EXAMPLES: GOOD PBIs\n\n';
      formatted += `You have ${this.examples.good.length} example(s) of GOOD quality PBIs to learn from:\n\n`;

      this.examples.good.forEach((example, index) => {
        formatted += `#### Good Example ${index + 1}:\n\n`;
        formatted += example;
        formatted += '\n\n';
      });

      formatted += '**Why these are GOOD:**\n';
      formatted += '- Clear, specific title with well-defined scope\n';
      formatted += '- Detailed description with user story, background, and context\n';
      formatted += '- Comprehensive acceptance criteria in Given-When-Then format\n';
      formatted += '- Technical requirements specified (API, database, authentication, etc.)\n';
      formatted += '- Business value and functional requirements clearly articulated\n';
      formatted += '- Sufficient detail for implementation without constant clarification\n';
      formatted += '- All custom fields populated with real values (not placeholders)\n\n';
    }

    // Format okay examples
    if (this.examples.ok.length > 0) {
      formatted += '### EXAMPLES: OKAY PBIs\n\n';
      formatted += `You have ${this.examples.ok.length} example(s) of OKAY quality PBIs:\n\n`;

      this.examples.ok.forEach((example, index) => {
        formatted += `#### Okay Example ${index + 1}:\n\n`;
        formatted += example;
        formatted += '\n\n';
      });

      formatted += '**Why these are OKAY (but could be better):**\n';
      formatted += '- Basic structure present but lacks detail in key areas\n';
      formatted += '- Acceptance criteria exist but may have gaps or contradictions\n';
      formatted += '- Some technical requirements but incomplete specifications\n';
      formatted += '- May have grammar errors or unclear language\n';
      formatted += '- Placeholder text not fully removed from custom fields\n';
      formatted += '- Usable for implementation but will require clarification questions\n';
      formatted += '- Missing sections or inconsistent data model references\n\n';
    }

    // Format bad examples
    if (this.examples.bad.length > 0) {
      formatted += '### EXAMPLES: BAD PBIs\n\n';
      formatted += `You have ${this.examples.bad.length} example(s) of BAD quality PBIs:\n\n`;

      this.examples.bad.forEach((example, index) => {
        formatted += `#### Bad Example ${index + 1}:\n\n`;
        formatted += example;
        formatted += '\n\n';
      });

      formatted += '**Why these are BAD:**\n';
      formatted += '- Vague or missing user story (no As a... I want... So that...)\n';
      formatted += '- Very brief description lacking context and detail\n';
      formatted += '- Incomplete or vague acceptance criteria\n';
      formatted += '- Missing critical sections (background, scope, technical requirements)\n';
      formatted += '- Placeholder text not replaced with actual values\n';
      formatted += '- Undefined terms and missing specifications\n';
      formatted += '- No error handling, edge cases, or authorization logic\n';
      formatted += '- Insufficient information - would require extensive clarification\n';
      formatted += '- Not ready for development without major revisions\n\n';
    }

    return formatted;
  }

  /**
   * Build the assessment prompt for a specific PBI
   */
  buildAssessmentPrompt(pbiData) {
    const systemPrompt = this.buildSystemPrompt();

    const userPrompt = `Please assess the quality of the following Product Backlog Item.

Analyze it carefully against the quality standards and examples provided in your instructions.

PBI TO ASSESS:
${typeof pbiData === 'string' ? pbiData : JSON.stringify(pbiData, null, 2)}

Remember to:
1. Compare against the quality standards systematically
2. Reference the examples to guide your assessment
3. Be specific in your feedback with examples from this PBI
4. Provide actionable recommendations
5. Self-critique your assessment before finalizing

Provide your assessment in the JSON format specified.`;

    return { systemPrompt, userPrompt };
  }

  /**
   * Build the Claude API payload for Bedrock
   */
  buildBedrockPayload(pbiData) {
    const { systemPrompt, userPrompt } = this.buildAssessmentPrompt(pbiData);

    return {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      temperature: 0.3, // Lower temperature for more consistent assessments
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
      // Note: Extended thinking not supported by AWS Bedrock API
      // Would need to migrate to Anthropic's native API to enable thinking parameter
    };
  }
}

module.exports = PBIQualityAssessor;
