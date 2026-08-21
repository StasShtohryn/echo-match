REST API

Naming

/api/auth

/api/users

/api/messages

/api/events

/api/profile

Auth Endpoints

POST /api/auth/register

POST /api/auth/login

Both accept { email, password } and return { userId, email, accessToken }.
Anonymous.

Lookup Endpoints

GET /api/lookups

Returns every active lookup list in one response, so onboarding needs a single
request instead of three.

{ interests: [...], languages: [...], prompts: [...] }

Each item is { id, code, name }. Prompts expose Question as name so all three
lists share one shape on the client.

Requires authentication. Only IsActive rows are returned.

HTTP

GET

POST

PUT

PATCH

DELETE

Response

Always DTO.

Never Entity.

Errors

ProblemDetails

Status Codes

200

201

204

400

401

403

404

409

500