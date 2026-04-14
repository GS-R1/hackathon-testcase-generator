# Okay PBI Examples

This folder contains acceptable but improvable PBIs. These are usable but have issues that prevent them from being exemplary.

## Current Examples

### PBI 98086 - Add Management Functionality for teachers to Rostering API

**Why this is an OKAY (not GOOD) example:**

⚠️ **Title Issues**
- Lowercase "teachers" - inconsistent capitalization
- Slightly unclear compared to good example

⚠️ **User Story Problems**
- Grammar errors: "So that i can access their details view sittings and active logs"
- Unclear benefit statement - what does "view sittings and active logs" mean?
- Lowercase "i" instead of "I"

⚠️ **Missing Sections**
- No Background section explaining current state and why this is needed
- No API Specification with request/response examples
- No definition of what "Management Functionality" means

⚠️ **Incomplete Requirements**
- Functional requirements too brief (4 items vs. 7 in good example)
- Technical requirements missing critical details:
  - No password hashing specification
  - No email service integration details
  - Missing JWT bearer token requirement

⚠️ **Contradictory Acceptance Criteria**
- AC1: Says teacher can create students
- AC3: Says teacher (non-admin) gets 403 Forbidden when creating users
- **These contradict each other!**

⚠️ **Missing AC**
- Jumps from AC6 to AC8 (AC7 missing)
- Only 9 ACs vs. 10 in good example

⚠️ **Placeholder Text Not Removed**
- Custom.APIURLs says "POST /api/1/users" but description talks about students
- Custom fields still have examples: "e.g. CAT4 IRP", "e.g. /sittings"
- This indicates copy-paste without proper customization

⚠️ **Data Model Inconsistency**
- Description mentions "students" table
- Technical requirements mention "User" table
- Which is it? Unclear data model

⚠️ **Vague Language**
- "Validate student data created" - validate what exactly?
- "Verify activation email is sent" - when? under what conditions?

**What's Good About It:**
✅ Has basic user story structure  
✅ Has scope definition  
✅ Has acceptance criteria with Given/When/Then format  
✅ Includes functional and technical requirements sections  
✅ References database tables and authorization  

**How to Improve:**
1. Fix grammar and capitalization in title and user story
2. Add Background section explaining the context
3. Add detailed API specification with examples
4. Resolve contradictory acceptance criteria (AC1 vs AC3)
5. Add missing AC7
6. Remove placeholder text from custom fields
7. Clarify data model (students vs. users)
8. Be more specific in requirements and ACs
9. Add more technical details (password hashing, authentication, etc.)
10. Provide concrete examples instead of vague statements

**Structure:**
```json
{
  "fields": {
    "System.Title": "Acceptable but could be more precise",
    "System.Description": "Has structure but lacks detail and has grammar issues",
    "Microsoft.VSTS.Common.AcceptanceCriteria": "9 ACs with Given/When/Then but has contradictions and gaps",
    "Custom.APIURLs": "Contains placeholder text",
    "Custom.DatabaseTables": "Inconsistent with description"
  }
}
```

This PBI is **usable** - a developer could implement something from it, but they'd need to ask many clarifying questions. It would likely result in rework or misunderstandings.
