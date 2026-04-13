# Definition of Done for Test Cases

This folder contains your organization's Definition of Done (DoD) criteria specifically for manual test cases. Claude will use these criteria to:
1. Self-review generated test cases
2. Iteratively improve quality
3. Score the final output

## Purpose

The DoD provides Claude with explicit quality standards to evaluate against, ensuring generated test cases meet your team's expectations before presenting them to users.

## How to Add Definition of Done

Create markdown files in this folder describing what makes test cases "done" and ready for use.

### Recommended Structure

Create one or more `.md` files with quality criteria:

**Example: `test-case-quality-standards.md`**

```markdown
# Test Case Quality Standards

## Completeness
- [ ] Every test case has a unique ID
- [ ] All fields are populated (scenario, preconditions, steps, data, expected results)
- [ ] Test steps are numbered and sequential
- [ ] Expected results are clear and verifiable
- [ ] Test data includes specific values, not placeholders

## Clarity
- [ ] Test steps are written in simple, unambiguous language
- [ ] Each step describes ONE action
- [ ] Technical jargon is explained or avoided
- [ ] Anyone on the team could execute the test without clarification

## Coverage
- [ ] Happy path test is always first (TC-001)
- [ ] All acceptance criteria are covered
- [ ] Edge cases and boundary values are tested
- [ ] Negative test cases are included
- [ ] Accessibility is considered (keyboard navigation, screen readers)

## Format
- [ ] Uses Given/When/Then format for acceptance criteria tests
- [ ] Follows consistent numbering (TC-001, TC-002, etc.)
- [ ] Uses markdown formatting correctly
- [ ] Organized by category (Happy Path, Functional, Edge Cases, etc.)

## Quality
- [ ] Tests are independent (can run in any order)
- [ ] Tests are repeatable (same input = same result)
- [ ] Tests are focused (test one thing at a time)
- [ ] No assumptions about system state beyond preconditions
```

**Example: `common-issues-to-avoid.md`**

```markdown
# Common Issues to Avoid

## ❌ Don't Do This:
1. **Vague steps**: "Test the login"
   ✅ **Do This**: "1. Enter username 'test@example.com' in Username field, 2. Enter password 'Pass123!' in Password field, 3. Click 'Login' button"

2. **Missing test data**: "Enter valid email"
   ✅ **Do This**: "Enter 'john.smith@gl-assessment.com' in Email field"

3. **Unclear expected results**: "Page loads correctly"
   ✅ **Do This**: "Dashboard page displays with welcome message 'Welcome, John Smith' and navigation menu visible"

4. **Grouped actions**: "Login and navigate to reports"
   ✅ **Do This**: Separate into multiple test steps

5. **Assumptions**: "Assuming user is logged in..."
   ✅ **Do This**: Add precondition "User is authenticated and on the dashboard page"
```

## Multiple Files

You can create multiple DoD files for different aspects:
- `completeness-criteria.md` - Required fields and coverage
- `format-standards.md` - Formatting rules
- `quality-checklist.md` - Quality gates
- `examples-to-avoid.md` - Common mistakes

All `.md` files in this folder will be loaded and provided to Claude.

## How It's Used

### During Generation:

1. **Initial Generation**: Claude creates test cases using knowledge base + examples + DoD
2. **Self-Review**: Claude reviews its own output against DoD criteria
3. **Iteration**: If DoD criteria aren't met, Claude refines the test cases
4. **Final Check**: Claude provides a quality score (1-10) based on DoD compliance

### Console Output:

```
📋 Definition of Done loaded:
  ✓ test-case-quality-standards.md (3.2 KB)
  ✓ common-issues-to-avoid.md (2.1 KB)
  → Claude will use these for self-review and quality scoring
```

## If No DoD is Provided

If this folder is empty, Claude will:
- Still generate test cases
- Skip the self-review iterations
- Not provide a quality score
- Generate in a single pass without quality validation

## Tips for Writing Good DoD

1. **Be Specific**: Instead of "test cases should be clear", say "each test step should contain exactly one action"
2. **Be Measurable**: Use checklists that can be objectively evaluated
3. **Provide Examples**: Show good vs. bad examples
4. **Keep Updated**: Review and update DoD as standards evolve
5. **Start Simple**: Begin with basic criteria, add more as needed

## Getting Started

To get started:
1. Review your team's existing test case standards
2. Create a `test-case-quality-standards.md` file with key criteria
3. Add specific examples of what good test cases look like
4. Test with a few PBIs and refine the DoD based on results

The more specific your DoD, the better Claude can evaluate and improve test quality!
