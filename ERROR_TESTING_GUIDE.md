# Error Messaging Testing Guide

This guide will help you test all the error handling improvements made to the PBI Manual Test Case Generator.

## Prerequisites

1. Start the backend server: `npm start`
2. Start the Angular dev server (if testing frontend): `ng serve`
3. Have your browser console open (F12) for debugging

## Test Scenarios

### 1. Work Item Not Found (404 Error)

**Scenario:** Try to fetch a work item ID that doesn't exist

**Steps:**
1. Enter a non-existent work item ID (e.g., `999999999`)
2. Enter your project name (e.g., `Testwise`)
3. Click "Fetch PBI"

**Expected Error:**
```
Work item 999999999 not found. This could mean: (1) The ticket doesn't exist, (2) You don't have permission to view it, or (3) It's in a different project than 'Testwise'.
```

**Where to Look:**
- Red error banner at the top of the page
- Console should show: `Error fetching work item 999999999:`

**Status:** [ ] Pass [ ] Fail

---

### 2. Work Item in Wrong Project

**Scenario:** Try to fetch a work item that exists but in a different project

**Steps:**
1. Enter a valid work item ID from project A (e.g., `98067`)
2. Enter a different project name (e.g., `WrongProject`)
3. Click "Fetch PBI"

**Expected Error:**
```
Work item 98067 not found. This could mean: (1) The ticket doesn't exist, (2) You don't have permission to view it, or (3) It's in a different project than 'WrongProject'.
```

**Where to Look:**
- Red error banner at the top of the page

**Status:** [ ] Pass [ ] Fail

---

### 3. Permissions Error - No Access to Work Item

**Scenario:** Try to fetch a work item you don't have permission to view

**Steps:**
1. Enter a work item ID from a project you don't have access to
2. Click "Fetch PBI"

**Expected Error:**
```
Unable to access work item [ID]. You may not have permission to view this item or it may not exist in the specified project.
```

**Where to Look:**
- Red error banner at the top of the page
- Console should show: `Work item [ID] has no fields - likely a permissions issue`

**Status:** [ ] Pass [ ] Fail

---

### 4. Empty Work Item Fields (Permissions Issue)

**Scenario:** This is caught by frontend validation after fetching

**Steps:**
1. If the backend returns a work item with empty fields, the frontend should catch it

**Expected Error:**
```
Retrieved work item has no fields. Please check your permissions for this item.
```

**Where to Look:**
- Red error banner at the top of the page
- Should prevent quality assessment from running

**Status:** [ ] Pass [ ] Fail

---

### 5. Missing Essential Fields (System.Title)

**Scenario:** Work item is incomplete

**Steps:**
1. This would be rare, but if a work item has fields but is missing System.Title

**Expected Error:**
```
Work item is missing essential data. You may not have sufficient permissions to view this item.
```

**Where to Look:**
- Red error banner at the top of the page

**Status:** [ ] Pass [ ] Fail

---

### 6. Quality Assessment Error - Empty Work Item

**Scenario:** Try to assess quality with invalid data

**Steps:**
1. This would trigger if somehow `assessPBIQuality()` runs with bad data

**Expected Error (in quality assessment card):**
```
Cannot assess quality: work item has no fields
```

**Where to Look:**
- Red error message in the "PBI Quality Assessment" section
- Retry button should appear

**Status:** [ ] Pass [ ] Fail

---

### 7. Test Case Generation Error - No PBI Data

**Scenario:** Try to generate test cases without fetching a PBI first

**Steps:**
1. Refresh the page
2. Manually trigger test generation (this shouldn't be possible in UI, but good to verify button is disabled)

**Expected Error:**
```
Please fetch a PBI first
```

**Where to Look:**
- Error should appear in the "analysis-options" section if validation fails

**Status:** [ ] Pass [ ] Fail

---

### 8. Test Case Generation Error - Incomplete Data

**Scenario:** Try to generate test cases with incomplete work item data

**Steps:**
1. This is a safety check that should trigger if data becomes corrupted

**Expected Error:**
```
Work item data is incomplete. Please fetch a valid PBI with proper permissions.
```

**Where to Look:**
- Red error banner in the test case generation section with "Dismiss" button

**Status:** [ ] Pass [ ] Fail

---

### 9. Test Case Generation Failure (Bedrock Error)

**Scenario:** Bedrock API call fails (e.g., expired AWS credentials)

**Steps:**
1. Make sure your AWS SSO session is expired: wait 8-12 hours or manually expire it
2. Fetch a valid PBI
3. Click "Generate Manual Test Cases"

**Expected Error:**
```
Error generating test cases: [specific error message from Bedrock]
```

**Where to Look:**
- Red error banner below the "Generate Manual Test Cases" button
- "Dismiss" button should appear
- Console should show detailed error

**Status:** [ ] Pass [ ] Fail

---

### 10. Regeneration with Feedback - No Feedback Provided

**Scenario:** Try to regenerate without providing feedback

**Steps:**
1. Successfully generate test cases
2. In the feedback section, leave the textarea empty
3. Try to click "Regenerate with Feedback" (button should be disabled)

**Expected Behavior:**
- Button should remain disabled
- No API call should be made

**Status:** [ ] Pass [ ] Fail

---

### 11. Regeneration with Feedback - API Failure

**Scenario:** Regeneration fails due to API error

**Steps:**
1. Successfully generate test cases
2. Provide feedback in the textarea
3. Trigger an API failure (e.g., expired credentials)
4. Click "Regenerate with Feedback"

**Expected Error:**
```
Error generating test cases: [specific error message]
```

**Where to Look:**
- Red error banner in the feedback section with "Dismiss" button
- Error should be clearly visible
- Console should show detailed error

**Status:** [ ] Pass [ ] Fail

---

### 12. Error Dismissal

**Scenario:** Errors can be dismissed by user

**Steps:**
1. Trigger any error scenario (e.g., 404)
2. Click the "Dismiss" button on the error message

**Expected Behavior:**
- Error message should disappear
- UI should remain functional
- User can try again

**Status:** [ ] Pass [ ] Fail

---

### 13. Error Persistence

**Scenario:** Errors persist until dismissed or cleared by success

**Steps:**
1. Trigger an error (e.g., wrong work item ID)
2. Note the error message
3. Don't dismiss it
4. The error should remain visible

**Expected Behavior:**
- Error should stay visible
- Error should not disappear automatically
- Error should clear when a successful operation completes

**Status:** [ ] Pass [ ] Fail

---

### 14. Error Animation

**Scenario:** Errors appear with smooth animation

**Steps:**
1. Trigger any error
2. Watch for the fade-in animation

**Expected Behavior:**
- Error should fade in smoothly (0.3s animation)
- Should slide down slightly as it appears
- Should be noticeable but not jarring

**Status:** [ ] Pass [ ] Fail

---

## Backend-Only Tests (via curl or Postman)

### 15. Backend 404 Validation

**Test:**
```bash
curl http://localhost:3000/api/workitem/999999999?project=Testwise
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Work item 999999999 not found. This could mean: (1) The ticket doesn't exist, (2) You don't have permission to view it, or (3) It's in a different project than 'Testwise'.",
  "validationError": true
}
```

**Status:** [ ] Pass [ ] Fail

---

### 16. Backend Empty Fields Validation

**Test:** Try to fetch a work item that returns empty fields

**Expected Response:**
```json
{
  "success": false,
  "error": "Unable to access work item [ID]. You may not have permission to view this item or it may not exist in the specified project.",
  "validationError": true
}
```

**Status:** [ ] Pass [ ] Fail

---

### 17. Backend 401/403 Detection

**Test:** Simulate unauthorized access (invalid PAT token)

**Steps:**
1. Temporarily change `AZURE_TOKEN` in `.env` to an invalid value
2. Restart server
3. Try to fetch any work item

**Expected Response:**
```json
{
  "success": false,
  "error": "Access denied for work item [ID]. Please check your Azure DevOps permissions and PAT token.",
  "validationError": true
}
```

**Status:** [ ] Pass [ ] Fail

---

## Console Logging Tests

### 18. Detailed Console Logging

**Scenario:** All errors should log details to console

**Steps:**
1. Trigger various error scenarios
2. Check browser console for detailed logs

**Expected Logs:**
- `Error fetching work item [ID]:`
- `Test case generation failed:` with result object
- `Test case generation error:` with error object
- Console.error calls for all failures

**Status:** [ ] Pass [ ] Fail

---

## Summary

**Total Tests:** 18
**Passed:** ___
**Failed:** ___

## Notes

Document any issues or unexpected behavior here:

---

## Common Issues and Solutions

### Issue: Errors not appearing in UI
**Check:**
- Is `error` variable being set correctly?
- Is the `*ngIf="error && !loading"` condition correct?
- Check browser console for errors

### Issue: Errors disappearing too quickly
**Check:**
- Verify `finally` block isn't clearing errors
- Check if `this.error = ''` is being called too early

### Issue: Multiple error messages showing
**Check:**
- Verify error is being cleared on success (`this.error = ''`)
- Check if error messages are properly scoped to sections

### Issue: Dismiss button not working
**Check:**
- Verify click handler: `(click)="error = ''"`
- Check if button is properly styled and visible