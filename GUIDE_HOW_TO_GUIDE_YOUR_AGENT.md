# How to Guide Your Agent for High-Quality Results

## The Core Problem

**Question:** "How do we guide the agent to get it as close to correct as possible on the first go?"

**Answer:** Through rich **system prompts**, **examples**, **standards**, and **self-critique**.

---

## Architecture Comparison

### ❌ Weak Approach: Hope-and-Pray
```python
# Just ask and hope it's good
prompt = "Generate test cases for this PBI"
result = call_claude(prompt)
# Result: Generic, might miss critical cases
```

### ✅ Strong Approach: Guided Agent
```python
# Define your standards
standards = TestingStandards(
    required_fields=[...],
    coverage_requirements=[...],
    examples=[...],
    quality_criteria=[...]
)

# Build rich system prompt with your standards
agent = HolisticTestAgent(standards)

# Agent follows your guidelines automatically
result = agent.generate_test_cases(pbi, context)
# Result: High-quality, follows your org's patterns
```

---

## The 10 Ways to Guide Your Agent

### 1. **System Prompt: Encode Your Philosophy**

Instead of asking the agent questions, TELL it who it is and what you expect.

```python
system_prompt = """You are an expert QA engineer with 15 years of experience.
Your test cases have prevented critical production incidents.

You MUST ensure:
- All edge cases are covered
- Security vulnerabilities are tested (OWASP Top 10)
- Test cases follow Given-When-Then format
- Each test includes specific test data

Your test cases are the last line of defense before production."""
```

**Why this works:** The agent assumes this identity and strives to meet those standards.

---

### 2. **Few-Shot Examples: Show, Don't Tell**

Include 2-3 examples of PERFECT test cases from your organization.

```python
system_prompt += """
# EXAMPLE OF EXCELLENT TEST CASE

{
  "id": "TC_SEC_001",
  "title": "SQL Injection Prevention - Login Form",
  "description": "Verify login form sanitizes input to prevent SQL injection",
  "priority": "Critical",
  "steps": [
    "Given: Login page is displayed",
    "When: User enters malicious SQL: ' OR '1'='1",
    "Then: Login is rejected",
    "And: No SQL error is exposed"
  ],
  "test_data": {
    "malicious_inputs": ["' OR '1'='1", "admin'--"],
    "expected_behavior": "Input sanitization"
  },
  "tags": ["security", "sql-injection", "OWASP"]
}

Generate test cases following this structure and quality level."""
```

**Why this works:** The agent mimics the style, depth, and quality of your examples.

---

### 3. **Provide Rich Context**

Don't just give the PBI - give the FULL picture:

```python
context = {
    "system_architecture": "Microservices with separate auth service",
    "known_security_concerns": [
        "Previous SQL injection vulnerability in user input",
        "Must comply with OWASP ASVS Level 2"
    ],
    "existing_test_coverage": "Happy path tests exist, security tests missing",
    "production_issues": [
        "Password reset tokens were reusable (now fixed)",
        "Email service is sometimes unreliable"
    ],
    "integration_dependencies": [
        "Email service API",
        "User database",
        "Session management"
    ],
    "performance_requirements": "Must handle 1000 concurrent resets"
}
```

**Why this works:** The agent generates tests that address REAL concerns, not generic ones.

---

### 4. **Define Quality Standards as Data**

Make your standards machine-readable:

```python
standards = TestingStandards(
    required_fields=["id", "title", "steps", "expected_results", "test_data"],
    test_types=["Unit", "Integration", "Security", "Performance", "Boundary"],
    coverage_requirements=[
        "Happy path",
        "Negative cases",
        "Edge cases",
        "Security (OWASP Top 10)",
        "Error handling",
        "Performance under load"
    ],
    min_test_cases=10,
    step_format="Given-When-Then",
    naming_convention="TC_[TYPE]_[NUMBER]_[Description]"
)
```

**Why this works:** Clear, explicit requirements the agent can check against.

---

### 5. **Self-Critique Pattern**

Make the agent review its own work:

```python
# After generation, ask the agent to critique itself
critique_prompt = """Review the test cases you just generated.

Self-critique checklist:
□ Are all coverage requirements met?
□ Are there any untested edge cases?
□ Are security tests comprehensive?
□ Are test steps clear and actionable?
□ Is there specific test data provided?
□ What could still go wrong?

Identify gaps and enhance the test suite."""
```

**Why this works:** The agent finds its own blind spots and fills them.

---

### 6. **Extended Thinking / Chain-of-Thought**

Enable reasoning before responding:

```python
payload = {
    "messages": messages,
    "thinking": {
        "type": "enabled",
        "budget_tokens": 2000  # Agent thinks deeply first
    }
}
```

**Why this works:** The agent plans its approach and catches mistakes before committing.

---

### 7. **Critical Thinking Questions**

Prompt the agent to ask hard questions:

```python
system_prompt += """
Before finalizing test cases, ask yourself:
- What happens if this gets 1000x traffic?
- What if the user is malicious?
- What if the database is down?
- What if data is corrupted?
- What assumptions could be wrong?
- How could this integrate badly with other features?
"""
```

**Why this works:** Forces the agent to think adversarially, like a skilled pentester.

---

### 8. **Constraints and Boundaries**

Be specific about what you want:

```python
# ❌ Vague
"Generate test cases"

# ✅ Specific
"""Generate 12-15 test cases for the password reset feature including:
- 3 security tests (SQL injection, XSS, token reuse)
- 2 performance tests (concurrent resets, rate limiting)
- 4 edge cases (expired tokens, invalid emails, special characters)
- 3 integration tests (email service failure, database errors, session management)

Follow Given-When-Then format.
Include specific test data for each case.
Tag each test with automation complexity (Low/Medium/High)."""
```

**Why this works:** No ambiguity = better results.

---

### 9. **Learn from Production**

Feed real-world failures into the agent:

```python
context["production_incidents"] = [
    {
        "incident_id": "INC-2024-001",
        "issue": "Password reset tokens were reusable",
        "impact": "Security vulnerability",
        "lesson": "Must test token invalidation after use"
    },
    {
        "incident_id": "INC-2024-002",
        "issue": "Email service timeout caused user-facing errors",
        "impact": "Poor user experience",
        "lesson": "Must test graceful degradation when email fails"
    }
]
```

**Why this works:** Agent generates tests that prevent ACTUAL bugs you've seen.

---

### 10. **Structured Output Schema**

Provide an exact schema:

```python
output_schema = {
    "type": "object",
    "properties": {
        "summary": {
            "total_test_cases": "number",
            "coverage_percentage": "number",
            "risk_assessment": "string"
        },
        "test_cases": {
            "type": "array",
            "items": {
                "id": "string",
                "title": "string",
                "priority": "enum[Critical, High, Medium, Low]",
                "test_type": "enum[Unit, Integration, E2E, Security, Performance]",
                "steps": "array[string]",
                "test_data": "object",
                "automation_complexity": "enum[Low, Medium, High]"
            }
        }
    }
}
```

**Why this works:** Consistent, parseable output every time.

---

## Complete Example: Putting It All Together

```python
# Step 1: Define your standards
your_standards = TestingStandards(
    required_fields=[...],
    coverage_requirements=[...],
    examples=[excellent_example_1, excellent_example_2],
    quality_thresholds={...}
)

# Step 2: Create agent with rich system prompt
agent = HolisticTestAgent(
    standards=your_standards,
    system_prompt=build_expert_system_prompt(your_standards)
)

# Step 3: Provide comprehensive context
pbi_data = {...}  # The requirement
context = {
    "architecture": {...},
    "security_concerns": [...],
    "production_incidents": [...],
    "dependencies": [...]
}

# Step 4: Generate with self-critique
result = agent.generate_test_cases(
    pbi=pbi_data,
    context=context,
    enable_self_critique=True,
    enable_thinking=True
)

# Result: High-quality test cases that:
# - Follow your org's standards
# - Address real production concerns
# - Have appropriate depth and coverage
# - Are immediately usable
```

---

## Key Insight: The Agent is a Junior QA Engineer

Think of the agent as a junior QA engineer joining your team.

**Bad Onboarding:**
```
Manager: "Write some tests for this feature"
Junior: "Um... okay..." (writes generic tests)
```

**Good Onboarding:**
```
Manager: "Here are our testing standards [standards doc]
         Here are examples of excellent tests [examples]
         Here are our past production issues [incidents]
         Here's the system architecture [docs]
         Here are the security concerns [threat model]

         Now write tests following these patterns,
         and have another engineer review your work."

Junior: (writes high-quality, targeted tests)
```

**The system prompt = Your onboarding documentation**

---

## Comparison: Your Friend's App vs Holistic Agent

### Current Approach (server.js)
```javascript
function buildTestCasesPrompt(data) {
  return `Generate test cases for: ${JSON.stringify(data)}`;
}

// Result: Generic test cases, might miss critical scenarios
```

### Holistic Agent Approach
```python
# Rich system prompt with standards, examples, quality criteria
agent = HolisticTestAgent(your_standards)

# Comprehensive context
context = {system_arch, security_concerns, past_incidents}

# Generate with self-critique
result = agent.generate_test_cases(pbi, context)

# Result:
# - Follows your org's patterns
# - Addresses known risks
# - Self-critiqued and refined
# - High quality from first pass
```

---

## Measuring Success

Track these metrics:

1. **First-Pass Quality:** % of generated tests that need no edits
2. **Coverage:** % of requirements covered by generated tests
3. **Bug Detection:** Do generated tests catch real bugs?
4. **Developer Satisfaction:** Do QA engineers find them useful?
5. **Time Savings:** Hours saved vs manual test writing

---

## Quick Start Checklist

To guide your agent effectively:

- [ ] Define your testing standards as structured data
- [ ] Include 2-3 examples of perfect test cases in system prompt
- [ ] Provide system architecture context
- [ ] List known security concerns
- [ ] Include past production incidents
- [ ] Specify exact output format (JSON schema)
- [ ] Enable self-critique (ask agent to review its work)
- [ ] Use extended thinking/reasoning
- [ ] Add critical thinking questions to system prompt
- [ ] Be specific in your constraints

---

## The Bottom Line

**You get high-quality results by:**
1. **Showing** the agent what excellence looks like (examples)
2. **Telling** it your standards and philosophy (system prompt)
3. **Providing** full context (architecture, risks, history)
4. **Making** it self-critique (review its own work)

**Not by:**
- Asking vague questions and hoping for the best
- Single-shot prompts without context
- No examples or standards

---

## Try It Yourself

Run the examples:
```bash
# Simple multi-turn refinement
python simple_refiner_example.py

# Advanced with tool use
python test_case_refiner_agent.py

# Holistic agent with guidance
python holistic_test_agent.py
```

Compare the quality difference!
