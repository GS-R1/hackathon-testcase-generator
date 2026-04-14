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
