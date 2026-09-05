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

{ interests: [...], languages: [...], prompts: [...], options: {...} }

Each lookup item is { id, code, name }. Prompts expose Question as name so all
three lists share one shape on the client.

options carries the allowed values of every enum the user picks from, keyed by
the matching profile field name, so options.lookingFor lists the values valid
for profile.lookingFor.

Values are returned as keys only, never as display text. The client resolves
labels from its own translation files, the same rule that applies to lookup
Code. A new enum member therefore appears in the client automatically but shows
its raw key until a translation is added.

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

GET /api/profiles/me

Returns the caller's own profile. 404 when no profile exists yet, which the
client uses as the signal to start onboarding.

GET /api/profiles/{id}

Returns another user's public profile. A private profile answers 404, not 403,
so that its existence is not revealed.

PUT /api/profiles/me

Full replacement of profile content. The client loads the profile first and
sends every field back. A field omitted from the body is stored as null.

Three fields are deliberately not accepted here:

DateOfBirth  write-once, guards the 18+ rule
IsPrivate    a visibility setting, not profile content
ShowMe       a search preference, not information about the user

Settings must not travel through a full-replacement payload belonging to a
screen that does not display them. An edit-profile form that forgets to echo
IsPrivate back would silently make a hidden profile public.

Planned separate endpoints

PATCH /api/profiles/me/visibility    { isPrivate }
PUT   /api/profiles/me/preferences   { showMe, minAge, maxAge, maxDistanceKm }

The second one lands together with swiping, since its other fields have
nothing to filter until then.

Two profile shapes

MyProfileDto      owner view, includes DateOfBirth, ShowMe, IsPrivate
PublicProfileDto  visitor view, exposes Age instead of DateOfBirth and hides
                  ShowMe (a search preference, not information about the user)
                  and IsPrivate

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