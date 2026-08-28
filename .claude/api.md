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

POST /api/auth/google

Body: { idToken } — the Google ID token obtained by the client.

The backend verifies the token against Google public keys and checks that its
audience equals our Client ID, then issues our own JWT. The response shape is
the same as register and login.

Account resolution:
  match by GoogleId          -> returning user
  else match by Email        -> link GoogleId to the existing account
  else                        -> create a passwordless account

Linking and creation both require email_verified from Google. An unverified
email is rejected with 401, otherwise an attacker could squat an address they
do not own.

Anonymous. 401 if the token is invalid, expired, issued for another audience,
or the email is unverified.

Lookup Endpoints

GET /api/lookups

Returns every active lookup list in one response, so onboarding needs a single
request instead of three.

{ interests: [...], languages: [...], prompts: [...] }

Each item is { id, code, name }. Prompts expose Question as name so all three
lists share one shape on the client.

Requires authentication. Only IsActive rows are returned.

Profile Endpoints

POST /api/profiles

Creates the profile for the caller. The owner is taken from the JWT, never
from the request body.

Body: { displayName, dateOfBirth, gender }

201 Created with the full profile.
409 Conflict if the caller already has a profile.
400 Bad Request if under 18 or the payload is invalid.

DateOfBirth is set once here and is not accepted by any update endpoint,
because a freely editable birth date would defeat the 18+ rule.

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