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

    // Try to load from knowledge base first
    const knowledgeBaseDir = path.join(__dirname, 'knowledge', 'examples', 'pbis');

    let loadedFromKnowledgeBase = false;

    if (fs.existsSync(knowledgeBaseDir)) {
      try {
        const files = fs.readdirSync(knowledgeBaseDir).filter(f => f.endsWith('.md') && !f.startsWith('.'));
        if (files.length > 0) {
          // Load good examples
          const goodFiles = files.filter(f => f.startsWith('pbi-good-') || f.startsWith('good-'));
          for (const file of goodFiles) {
            examples.good.push(fs.readFileSync(path.join(knowledgeBaseDir, file), 'utf8'));
          }

          // Load ok examples
          const okFiles = files.filter(f => f.startsWith('pbi-ok-') || f.startsWith('ok-'));
          for (const file of okFiles) {
            examples.ok.push(fs.readFileSync(path.join(knowledgeBaseDir, file), 'utf8'));
          }

          // Load bad examples
          const badFiles = files.filter(f => f.startsWith('pbi-bad-') || f.startsWith('bad-'));
          for (const file of badFiles) {
            examples.bad.push(fs.readFileSync(path.join(knowledgeBaseDir, file), 'utf8'));
          }

          if (examples.good.length > 0 || examples.ok.length > 0 || examples.bad.length > 0) {
            console.log(`Loaded ${examples.good.length} good, ${examples.ok.length} ok, ${examples.bad.length} bad example PBIs from knowledge base`);
            loadedFromKnowledgeBase = true;
          }
        }
      } catch (error) {
        console.log('Could not read knowledge base directory:', error.message);
      }
    }

    // Fall back to hard-coded synthetic examples if knowledge base is empty
    if (!loadedFromKnowledgeBase) {
      console.log('Using hard-coded synthetic example PBIs');
      examples.good.push(this.getSyntheticGoodExample());
      examples.ok.push(this.getSyntheticOkExample());
      examples.bad.push(this.getSyntheticBadExample());
    }

    return examples;
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
  "improvement_points": [
    {
      "label": "Brief label for what's missing or needs improvement",
      "prompt": "Clear question or prompt for the user to answer"
    }
  ],
  "summary": "2-3 sentence summary of the assessment"
}

For improvement_points, be concise and actionable. Each point should:
- Have a clear label (e.g., "Business Value Metrics", "Performance Requirements", "Security Considerations")
- Include a specific prompt asking what information is needed (e.g., "What metrics will measure success?", "What response time is required?")
- Focus only on missing or unclear elements that would improve implementation quality

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
      formatted += '### EXAMPLE: GOOD PBI\n\n';
      formatted += this.examples.good[0]; // Use first good example
      formatted += '\n\n**Why this is GOOD:**\n';
      formatted += '- Clear user story with business value quantified\n';
      formatted += '- Comprehensive acceptance criteria in Given-When-Then format\n';
      formatted += '- Technical requirements specified\n';
      formatted += '- Complete Definition of Done\n';
      formatted += '- Risk assessment with mitigations\n';
      formatted += '- Sufficient context for implementation\n\n';
    }

    // Format ok examples
    if (this.examples.ok.length > 0) {
      formatted += '### EXAMPLE: OK PBI\n\n';
      formatted += this.examples.ok[0]; // Use first ok example
      formatted += '\n\n**Why this is OK (but could be better):**\n';
      formatted += '- Basic acceptance criteria present but not comprehensive\n';
      formatted += '- Some business value mentioned but not quantified\n';
      formatted += '- Technical requirements incomplete\n';
      formatted += '- Definition of Done basic but workable\n';
      formatted += '- Acceptable for implementation but will need clarification\n\n';
    }

    // Format bad examples
    if (this.examples.bad.length > 0) {
      formatted += '### EXAMPLE: BAD PBI\n\n';
      formatted += this.examples.bad[0]; // Use first bad example
      formatted += '\n\n**Why this is BAD:**\n';
      formatted += '- Vague description with no clear goal\n';
      formatted += '- No meaningful acceptance criteria\n';
      formatted += '- No business value articulated\n';
      formatted += '- Missing technical requirements\n';
      formatted += '- Insufficient information for implementation\n';
      formatted += '- Would require extensive clarification before work can begin\n\n';
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
