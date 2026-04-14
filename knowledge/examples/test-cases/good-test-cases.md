Test cases should:
1. be specific and precise, yet possibly concise
2. formulaic (kept in Given-When-Then format)
3. contain all necessary information (so there is no need to reach outside the test case to gather more information to execute it)

# Test Cases for [PBI Title]

## Test Case #1 (TC-001): Report Filters - Date Range field

**Test Scenario**: User can see and interact with Date Range datepicker in Report Filters section of the NGMT Report page

**Preconditions**:
- I am logged in to Testwise

**Test Steps**:
1.GIVEN I am on the NGMT Report page (https://qa.worksonlocal.dev/reporting/single-school/ngmt)
THEN there is a default date range selection in the date range box. The default range is:
- Start date: the current day - (minus) 90 days
- End date: the current day

2. WHEN I click the date range picker box
THEN the date range picker calendar opens

3. AND WHEN I select two dates (a start date and an end date)
THEN the calendar disappears
AND the selected range is displayed in the box

4. AND WHEN I select a date range that there is not data for

THEN a validation message appears: "No results data for this date range, please adjust your selected date range."

**Notes**: This is not an integration-level test case; it does not cover the interaction between the datepicker and the content of the report page

---

# Test Cases for [PBI Title]

## Test Case #1 (TC-001): Happy Path - Successful Login

**Test Scenario**: User successfully logs in with valid credentials

**Preconditions**:
- User has a valid account
- User is on the login page

**Test Steps**:
1. Enter valid username
2. Enter valid password
3. Click "Login" button

**Test Data**:
- Username: test.user@example.com
- Password: ValidPass123!

**Expected Result**:
- User is redirected to dashboard
- Welcome message displays user's name

**Notes**: This is the primary happy path scenario

---

Other good examples of TCs you can find in this test suite: https://dev.azure.com/gl-development/Testwise/_testPlans/define?planId=68857&suiteId=68859
