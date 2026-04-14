# Bad PBI Examples

This folder contains poorly-written PBIs that lack essential information and would be difficult to implement or test.

## Current Examples

### PBI 98075 - User Management UI - Create and Manage Users

**Why this is a BAD example:**

❌ **No User Story**
- Missing "As a... I want... So that..." format
- No clear user role, goal, or benefit stated
- Just a brief description of what to build

❌ **Extremely Brief Description**
- Only 2 sentences total
- "Build a comprehensive user management interface..." - what does "comprehensive" mean?
- Lists features without any detail: "user creation, user list with search filtering and sorting, user details view"
- No context, background, or justification

❌ **Missing Critical Sections**
- No Background explaining current state or problem
- No Scope definition
- No Functional Requirements section
- No Technical Requirements section
- No API specifications
- No wireframes or UI mockups referenced

❌ **Vague Acceptance Criteria**
- ACs read like UI mockups, not testable requirements
- Missing expected outcomes and edge cases
- Incomplete acceptance criteria:
  - **AC7**: "confirmation modal appears" - then what? What happens after confirmation?
  - **AC8**: "confirmation modal with warning" - what's the warning? What happens after?
  - **AC9**: "confirmation modal appears AND status changes to Active" - this skips the confirmation step!

❌ **No Technical Details**
- No component names or file locations
- No state management approach
- No routing details
- No API endpoint specifications
- No error handling requirements
- No loading state requirements (mentioned in AC2 but not specified)

❌ **Undefined Terms**
- "Paginated list" - what page size? Navigation controls?
- "Debounced search" - what delay time?
- "Combined filters" - how do they combine (AND/OR)?
- "Role filter" - what roles are available?
- "User details" - what details are shown?

❌ **Placeholder Text Not Removed**
- Custom.APIURLs: "e.g. GetByAccessCodeAsync" - this is example text!
- Custom.Report: "e.g. CAT4 IRP"
- Custom.Page: "e.g. /sittings"
- Custom.Products: "e.g. CAT4"
- Custom.DatabaseTables: "e.g. StudentTest"
- Most custom fields have placeholders instead of real values

❌ **No Authorization Logic**
- Who can view which users?
- Can School Admin A see School B's users?
- What permissions are needed for each action?
- No mention of authentication requirements

❌ **No Error Handling**
- What happens if API call fails?
- What if user has no permissions?
- What if search returns no results?
- What about network errors?

❌ **Incomplete Specifications**
- AC4: "password reset link displayed" - where? For how long? Can it be copied?
- AC5: "error shown on blur" - what's the exact error message? Where is it shown?
- AC6: "Create button disabled" - is there visual indication? Tooltip?

❌ **No Success Criteria**
- How do we know this is done?
- No performance requirements
- No accessibility requirements
- No browser compatibility requirements

❌ **Missing Edge Cases**
- What if user list is empty?
- What about pagination edge cases (first/last page)?
- What if search takes too long?
- What about concurrent modifications?

❌ **No Dependencies or Integration Points**
- References "User Management API (PBI 98067)" but doesn't specify which endpoints
- No details about Design System components to use
- No authentication service integration details

**What's Minimally Present:**
- Has a title (though generic)
- Has some acceptance criteria
- Has basic Given/When/Then structure in ACs
- References a related PBI

**Problems This Would Cause:**
1. Developer would need constant clarification meetings
2. High likelihood of building wrong thing
3. Difficult to estimate effort accurately
4. Testing would be impossible without assumptions
5. High risk of rework and bugs
6. Poor user experience due to missing requirements
7. Accessibility likely to be missed entirely
8. Performance issues likely

**How to Fix:**
This PBI needs a complete rewrite:
1. Add proper user story format
2. Add detailed description with background and context
3. Define scope clearly (what's in/out)
4. Add functional requirements with specifics
5. Add technical requirements (components, routing, API, state)
6. Expand acceptance criteria with complete scenarios
7. Remove ALL placeholder text
8. Add error handling requirements
9. Add loading states and edge cases
10. Specify authorization rules
11. Define all vague terms with concrete examples
12. Add wireframes or UI mockups
13. Specify API endpoints and contracts
14. Add performance and accessibility requirements
15. Define success criteria

**Structure:**
```json
{
  "fields": {
    "System.Title": "Generic, not descriptive",
    "System.Description": "2 sentences, no detail, no structure",
    "Microsoft.VSTS.Common.AcceptanceCriteria": "Vague, incomplete, missing outcomes",
    "Custom.APIURLs": "PLACEHOLDER TEXT - NOT REAL",
    "Custom.DatabaseTables": "PLACEHOLDER TEXT - NOT REAL"
  }
}
```

**Bottom Line:** This PBI is **NOT ready for development**. It would waste time, create confusion, and likely result in building the wrong thing. It needs significant work before anyone should attempt to implement it.
