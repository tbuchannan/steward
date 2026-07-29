# Frontend

## Decision

Steward will use React with TypeScript for the frontend.

Vite will provide development and build tooling.

TanStack Router will provide client-side routing.

Zod will provide runtime validation for forms, URL state, frontend environment configuration, and selected API boundaries.

## Selected Technologies

The confirmed frontend technologies are:

- React
- TypeScript
- Vite
- TanStack Router
- Zod

Still undecided:

- Server-state management
- Form management
- Styling solution
- Component library
- Client-state management
- Charting library
- Frontend testing tools
- Deployment provider

## Responsibilities

The frontend is responsible for:

- Rendering the Steward interface
- Managing client-side navigation
- Displaying authentication states
- Communicating with the Fastify API
- Managing forms and user input
- Validating user input with Zod
- Parsing URL state
- Presenting loading, empty, validation, and error states
- Supporting desktop and mobile layouts
- Applying appearance preferences

The frontend must not:

- Connect directly to PostgreSQL
- Import the Drizzle database client
- Treat route guards as authorization
- Trust client-provided user identifiers
- Reimplement backend financial rules
- Store raw authentication credentials
- Use local storage as the authentication source of truth
- Treat frontend Zod validation as a security boundary

## Rendering Model

The initial frontend will be a client-rendered single-page application.

```text
Browser
→ Load React application
→ TanStack Router resolves route
→ Zod parses route search state
→ Frontend resolves authentication
→ Frontend requests data from Fastify
→ React renders the page
```

Server-side rendering is not required for the MVP.

## Proposed Source Structure

A possible frontend structure is:

```text
src/
├── main.tsx
├── router.tsx
├── routeTree.gen.ts
├── routes/
├── features/
│   ├── accounts/
│   ├── authentication/
│   ├── budgets/
│   ├── dashboard/
│   ├── settings/
│   └── transactions/
├── components/
├── hooks/
├── lib/
│   ├── api/
│   ├── environment/
│   └── validation/
├── styles/
└── types/
```

A feature directory may contain:

```text
features/transactions/
├── api/
├── components/
├── hooks/
├── schemas/
├── types/
└── utilities/
```

## Zod Responsibilities

The frontend should use Zod for:

- Form schemas
- Field-level validation
- Cross-field validation
- Search-parameter validation
- Public environment configuration
- Parsing values from storage
- Selected API-response parsing
- Imported data when implemented

Zod should not be used to duplicate backend-only business rules.

## Form Validation

Forms should use Zod schemas as their validation source of truth.

Examples include:

- Registration
- Login
- Account creation
- Account editing
- Transaction creation
- Transaction editing
- Budget allocation
- Settings

A form schema may define:

- Required values
- Length limits
- Valid formats
- Numeric ranges
- Enum values
- Cross-field relationships
- Normalization

## Form Types

Form value types should generally be inferred from their Zod schemas.

Conceptually:

```ts
const transactionFormSchema = z.object({
  description: z.string().trim().min(1),
  amount: z.string().min(1),
  date: z.string().date(),
});

type TransactionFormValues = z.input<typeof transactionFormSchema>;
type TransactionSubmission = z.output<typeof transactionFormSchema>;
```

Input and output types should be distinguished when a schema transforms values.

## Form Library Integration

The final form-management library should integrate with Zod.

The form library should provide:

- Field registration
- Submission state
- Dirty state
- Field errors
- Form-level errors
- Zod resolver or parsing integration

The application should not adopt a second unrelated schema language for forms.

## Server Validation Remains Required

Frontend validation improves usability.

It does not protect the API.

Every submitted request must still be validated by Fastify and Zod on the backend.

The UI should expect the server to return validation errors even when the frontend schema passes.

## API Validation

The frontend API layer should use typed public contracts.

Zod may parse API responses when runtime verification provides clear value.

Good candidates include:

- Authentication session data
- Dashboard summaries
- Imported or external data
- Values read from persistent browser storage
- High-impact API responses

Parsing every internal response may be unnecessary when server response schemas and static contracts already provide sufficient confidence.

## API Errors

The frontend should parse Steward’s standard API error shape.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "details": {
      "fields": {
        "amount": ["Enter a valid amount."]
      }
    }
  }
}
```

The interface should map field errors to the appropriate controls.

Unknown errors should fall back to a generic user-facing message.

## TanStack Router Search Validation

TanStack Router search parameters should be parsed with Zod-backed schemas where practical.

The transactions route may validate:

- Search text
- Account ID
- Category ID
- Transaction type
- Start date
- End date
- Sort
- Page
- Page size

Conceptually:

```ts
const transactionSearchSchema = z.object({
  search: z.string().catch(""),
  account: z.string().uuid().optional(),
  category: z.string().uuid().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(25),
});
```

The exact integration should use the installed TanStack Router APIs.

## URL State

State should be stored in the URL when it should be:

- Shareable
- Bookmarkable
- Restorable
- Preserved during browser navigation
- Meaningful outside the component

Examples include:

- Search
- Filters
- Sorting
- Pagination
- Selected budget month

Zod should convert raw URL values into safe typed values.

## Environment Validation

Frontend environment configuration should be parsed through Zod.

Possible public values include:

```text
VITE_API_URL
VITE_APP_ENV
```

Conceptually:

```ts
const environmentSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_ENV: z.enum(["development", "test", "production"]),
});
```

Only browser-safe public configuration may appear in Vite environment variables.

The frontend must never contain:

- Database credentials
- Better Auth secrets
- Private API keys
- Session tokens
- Demo-user passwords

## Authentication Forms

Zod should validate frontend authentication forms.

### Registration

Possible fields:

- Name
- Email
- Password
- Password confirmation

Cross-field validation should ensure that the password values match.

### Login

Possible fields:

- Email
- Password

Better Auth remains responsible for server-side credential validation.

The frontend should not attempt to determine whether an email address exists.

## Financial Input

Financial form values may begin as strings because they originate from text inputs.

Zod may validate the string and transform it into a canonical submission value.

The implementation should avoid unsafe floating-point conversions.

Currency conversion and rounding behavior should be implemented through tested utilities.

## Dates

Frontend schemas should distinguish:

- Date input strings
- Parsed dates
- API date strings
- Display-formatted dates
- Budget year and month

Display formatting should not be parsed back into domain values.

## Error Presentation

Validation errors should:

- Appear near affected fields
- Use clear language
- Preserve valid user input
- Identify cross-field issues
- Be accessible to assistive technology
- Avoid exposing internal schema details

The first invalid field may receive focus after submission when appropriate.

## Shared Schemas

The frontend may consume shared Zod contracts for:

- API requests
- API responses
- Pagination
- Filter values
- Common enums
- Standard errors

Shared schemas must not import:

- Drizzle
- PostgreSQL code
- Fastify plugins
- Better Auth secrets
- Server configuration

## Local Storage

Any structured values read from local storage should be considered untrusted.

Zod should parse them before use.

Possible examples include:

- Theme preference
- Display density
- Dismissed interface notices

Invalid stored values should fall back to safe defaults.

Authentication state should not be stored as a custom local-storage flag.

## Loading States

While data or authentication is loading:

- Preserve layout stability.
- Avoid displaying misleading values.
- Prevent duplicate form submission.
- Keep actionable errors distinct from loading states.

## Accessibility

Validation UX should:

- Associate messages with form controls
- Set invalid field state appropriately
- Provide visible error text
- Avoid relying on color alone
- Announce important form-level errors
- Preserve keyboard navigation

## Testing

### Schema tests

Test:

- Valid values
- Invalid values
- Boundary values
- Coercion
- Transformations
- Cross-field validation
- Defaults
- Fallback behavior

### Form tests

Test:

- Required fields
- Invalid field values
- Server-side validation errors
- Submission state
- Error-message placement
- Successful submission

### Router tests

Test:

- Valid search parameters
- Invalid search parameters
- Default values
- Filter persistence
- Pagination parsing

### Environment tests

Test:

- Valid configuration
- Missing required variables
- Invalid API URLs
- Unsupported environment names

## Non-Goals

The initial frontend will not use:

- Yup
- Joi
- Valibot
- Multiple form-validation libraries
- TypeScript types as runtime validators
- Frontend validation as authorization
- Drizzle table schemas as frontend contracts
- Handwritten parsing throughout route components

## Success Criteria

The frontend validation decision is successful when:

- Forms use Zod schemas.
- Types are inferred from schemas.
- TanStack Router receives typed search state.
- Public environment configuration is validated.
- Field errors are clear and accessible.
- Server validation errors integrate with forms.
- Shared contracts do not expose backend internals.
- Frontend validation improves UX without being treated as security.
