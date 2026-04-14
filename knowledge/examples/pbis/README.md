# PBI Examples

This directory contains example PBIs organized by quality level. These examples help the PBI Quality Assessor understand what makes a good vs. bad PBI.

## Directory Structure

```
pbis/
├── good/       - Exemplary PBIs (well-written, clear, complete)
├── okay/       - Acceptable PBIs (usable but could be improved)
└── bad/        - Poor PBIs (missing info, vague, unclear)
```

## Purpose

These categorized PBI examples are used by:
1. **PBI Quality Assessment** - To evaluate incoming PBIs and identify gaps
2. **Test Case Generation** - To provide context on what information should be present in a PBI

## How to Add Examples

### Good PBIs
Add JSON files to `good/` folder. These should have:
- ✅ Clear, specific title
- ✅ Detailed description with context
- ✅ Well-defined acceptance criteria
- ✅ Appropriate level of detail
- ✅ Clear success conditions

**Example filename**: `good/pbi-95962-feature-login.json`

### Okay PBIs
Add JSON files to `okay/` folder. These should have:
- ⚠️ Adequate title and description
- ⚠️ Acceptance criteria present but could be clearer
- ⚠️ Usable but missing some detail
- ⚠️ Could benefit from improvements

**Example filename**: `okay/pbi-12345-update-ui.json`

### Bad PBIs
Add JSON files to `bad/` folder. These should have:
- ❌ Vague or unclear title
- ❌ Missing or incomplete description
- ❌ No acceptance criteria or very unclear
- ❌ Lacks necessary context
- ❌ Hard to understand requirements

**Example filename**: `bad/pbi-67890-fix-bug.json`

## File Format

All files should be Azure DevOps work item JSON exports containing at minimum:
- `id` - Work item ID
- `fields['System.Title']` - PBI title
- `fields['System.Description']` - Description (can be HTML)
- `fields['Microsoft.VSTS.Common.AcceptanceCriteria']` - Acceptance criteria (if present)
- `fields['System.State']` - State
- `fields['System.WorkItemType']` - Type

## Integration with System

When the PBI Quality Assessor runs, it will:
1. Load examples from all three quality levels
2. Use them to calibrate quality assessment
3. Provide specific feedback on what's missing based on good examples
4. Identify patterns similar to bad examples

## Notes

- Examples should be anonymized if they contain sensitive information
- File names should be descriptive: `quality-level/pbi-{id}-{brief-description}.json`
- Include a variety of feature types, bug fixes, and technical tasks
- Update examples periodically to reflect current PBI writing standards
