Test cases should:
1. be specific and precise, yet possibly concise
2. formulaic (kept in Given-When-Then format)
3. contain all necessary information (so there is no need to reach outside the test case to gather more information to execute it)

# Test Cases for NGMT report - Filters section

## Test Case #1 (TC-001): Report Filters - Date Range field

**Test Scenario**: User can see and interact with Date Range datepicker in Report Filters section of the NGMT Report page

**Preconditions**:
- I am logged in to Testwise

**Test Steps**:
GIVEN I am on the NGMT Report page (https://qa.worksonlocal.dev/reporting/single-school/ngmt)
THEN there is a default date range selection in the date range box. The default range is:
- Start date: the current day - (minus) 90 days
- End date: the current day

WHEN I click the date range picker box
THEN the date range picker calendar opens

AND WHEN I select two dates (a start date and an end date)
THEN the calendar disappears
AND the selected range is displayed in the box

AND WHEN I select a date range that there is not data for

THEN a validation message appears: "No results data for this date range, please adjust your selected date range."

**Notes**: This is not an integration-level test case; it does not cover the interaction between the datepicker and the content of the report page

## Test Case #2 (TC-002): Report Filters - Default categories

**Test Scenario**: User can see categories for Default metadata in the Filters section

**Preconditions**:
- I am on NGMT Report page (https://qa.worksonlocal.dev/reporting/single-school/ngmt)

**Test Steps**:
GIVEN I am in a school with Metadata: Default
AND there is data supporting all the categories mentioned below

WHEN I go to NGMT Report page

THEN the Report Filters section contains filters of the following categories:
- Gender
- Year
- Group
- Nationality
- Free School Meals (FSM)
- English as an Additional Language (EAL)
- SEND
- Custom 1
- Custom 2

## Test Case #3 (TC-003): Report Filters - category filters availability - no data supporting categories

**Test Scenario**: User can see categories in Filters section for only those categories there is data for

**Preconditions**:
- I am on NGMT Report page (https://qa.worksonlocal.dev/reporting/single-school/ngmt)

**Test Steps**:
GIVEN I am logged in to a school
AND there are NGMT tests that have been taken in the school (i.e. there is data to support NGMT reports)
AND there is data supporting Gender, EAL and FSM categories (they are obligatory fields, this kind of data cannot be missing)
AND there is no data supporting any other category (like Year, Group, SEND etc)

WHEN I go to the NGMT Report page

THEN in the Filters section, I can see only those categories that there is data for. In the case of this TC, I can see the Gender, FSM, EAL category filters and no other filter

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
