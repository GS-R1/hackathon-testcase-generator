# Examples for Test Case Generation

This folder contains example PBIs and their corresponding high-quality test cases. Claude AI will use these examples to learn the expected format and quality standards when generating test cases.

## Folder Structure

```
examples/
├── pbis/              # Example PBI JSON files
├── test-cases/        # Example test case markdown files
└── README.md          # This file
```

## How to Add Examples

### Adding Example PBIs

1. Create a JSON file in the `pbis/` folder
2. Name it descriptively (e.g., `user-login-feature.json`, `report-generation.json`)
3. Include the PBI data structure from Azure DevOps

**Example PBI file structure:**
```json
{
  "id": 12345,
  "fields": {
    "System.Title": "Add user login functionality",
    "System.Description": "<div>As a user, I want to log in...</div>",
    "System.WorkItemType": "Product Backlog Item",
    "System.State": "Done",
    "System.AssignedTo": {
      "displayName": "John Smith"
    }
  }
}
```

### Adding Example Test Cases

1. Create a markdown file in the `test-cases/` folder
2. **Use the exact same base name** as the corresponding PBI file
   - PBI: `user-login-feature.json`
   - Test Cases: `user-login-feature.md`
3. Write comprehensive, high-quality manual test cases

---

## Naming Convention

**IMPORTANT**: PBI and test case files must have matching names (excluding extension):

✅ **Correct:**
- `pbis/user-authentication.json`
- `test-cases/user-authentication.md`

❌ **Incorrect:**
- `pbis/user-auth.json`
- `test-cases/user-authentication.md`

## How Examples Are Used

When you generate test cases:

1. The system scans both `pbis/` and `test-cases/` folders
2. Finds matching pairs (same filename, different extension)
3. Includes these examples in Claude's context
4. Claude learns from these examples to generate similar quality test cases

The more examples you add, the better Claude understands your preferred format and style!

## Tips for Good Examples

- **Complete**: Include all sections (preconditions, steps, data, expected results)
- **Clear**: Write in plain, unambiguous language
- **Structured**: Follow consistent formatting
- **Diverse**: Include different types of PBIs (features, bugs, enhancements)
- **Realistic**: Use actual PBIs and test cases from your team
- **Quality**: Only include test cases that meet your quality standards

## Getting Started

To get started, you can:

1. Export a well-tested PBI from Azure DevOps as JSON
2. Copy the manual test cases you wrote for it
3. Format the test cases in markdown
4. Save both files with matching names in their respective folders

The next time you generate test cases, Claude will reference these examples!
