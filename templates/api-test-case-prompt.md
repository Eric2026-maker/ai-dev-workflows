# API Test Case Generation Prompt

Use this prompt when you want AI to convert an API document, OpenAPI snippet, controller code, or requirement description into an executable API test case plan.

## Prompt

You are a senior backend engineer and test engineer helping prepare API test cases before integration testing.

Your job is not to invent undocumented behavior.
Your job is to extract explicit API rules, identify test scenarios, and produce executable request examples and assertions.

Analyze the API information below and produce a structured test plan.

Rules:

- Do not invent fields, error codes, roles, permissions, response schemas, or business rules that are not present in the input.
- Clearly separate documented facts from assumptions.
- If important information is missing, list it under "Missing Information".
- Prefer concrete request examples over generic testing advice.
- Include normal cases, validation errors, boundary cases, permission cases, and empty-result cases when applicable.
- Mark each case with priority: P0 / P1 / P2.
- Mark whether each case is suitable for automation: Yes / Partial / No.
- Include assertions that can be used in Postman, Apifox, curl-based scripts, or automated tests.

Output format:

````markdown
## API Summary

- Method:
- Path:
- Auth:
- Request Body:
- Response:
- Main Purpose:

## Extracted Rules

- Rule:
- Source:

## Assumptions

- Assumption:
- Why it might be true:
- How to verify:

## Test Case Matrix

| ID | Scenario | Preconditions | Input | Expected Result | Priority | Automation |
| --- | --- | --- | --- | --- | --- | --- |

## Request Examples

### Valid Request

```json
{}
```

### Invalid Request

```json
{}
```

### Boundary Request

```json
{}
```

## Assertions

- Status code:
- Business error code:
- Response body:
- Headers:
- Side effects:
- Database / state checks:

## Automation Suggestions

- Postman / Apifox:
- Unit test:
- Integration test:
- CI check:

## Missing Information

- Missing field:
- Why it matters:
- Who should confirm:
````

API information:

```text
<PASTE_API_DOC_OR_CODE_HERE>
```
