# Good PBI Examples

This folder contains well-written, exemplary PBIs that demonstrate quality standards.

## Current Examples

### PBI 98067 - Add User Management Functionality to Rostering API

**Why this is a GOOD example:**

✅ **Clear Title**: Specific and describes exactly what's being built  
✅ **User Story**: Follows standard format (As a... I want... So that...)  
✅ **Background Context**: Explains current state and why this work is needed  
✅ **Explicit Scope**: States what IS and ISN'T included  
✅ **Detailed Requirements**: Separated into Functional and Technical sections  
✅ **API Specification**: Complete endpoint documentation with request/response examples  
✅ **Comprehensive Acceptance Criteria**: 10 well-defined ACs using Given/When/Then format  
✅ **Technical Details**: Database tables, authentication, authorization specified  
✅ **Custom Fields**: API URLs, shared components, database tables all populated  

**Key Sections:**
- User Story with clear role, goal, and benefit
- Background explaining the current gap
- Scope boundaries (API only, UI separate)
- Functional requirements (what it does)
- Technical requirements (how it's built)
- API specification with request/response examples
- 10 detailed acceptance criteria covering:
  - Happy path (AC1)
  - Validation (AC2, AC6)
  - Authorization (AC3, AC4)
  - Email notifications (AC5)
  - Role assignment (AC7)
  - Audit logging (AC8)
  - Idempotency (AC9)
  - Error handling (AC10)

**Structure:**
```
{
  "fields": {
    "System.Title": "Clear, specific title",
    "System.Description": "Detailed with User Story, Background, Scope, Requirements, API Spec",
    "Microsoft.VSTS.Common.AcceptanceCriteria": "10 comprehensive ACs in Given/When/Then format",
    "Custom.APIURLs": "POST /api/1/users",
    "Custom.SharedComponents": "Authentication Service, Email Service",
    "Custom.DatabaseTables": "User, UserRole, UserSchool, AuditLog"
  }
}
```

This PBI provides everything a developer needs to implement the feature and everything a tester needs to verify it works correctly.
