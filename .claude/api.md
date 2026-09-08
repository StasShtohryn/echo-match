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

PUT /api/profiles/me/interests
PUT /api/profiles/me/languages

Body: { interestIds: [...] } / { languageIds: [...] }

Full replacement of the collection. Sending [1, 3] leaves exactly those two.
Returns the resolved list as { id, code, name } so the client needs no second
request to render what it just saved.

Limits: 5 interests, 10 languages, no duplicates.

PUT /api/profiles/me/prompts

Body: { answers: [ { promptId, answer } ] }

Full replacement, max 3, each prompt answered at most once, answer up to 124
characters. Display order comes from the array position, so the client controls
it without an extra field.

Returns [ { promptId, code, question, answer } ] so the client can render the
saved state without resolving questions itself.

Unknown or inactive ids answer 404 naming them, rather than reaching the
database and surfacing a foreign key violation as a 500.

Photo Endpoints

POST /api/profiles/me/photos

multipart/form-data with a single field: file.
JPEG, PNG, WebP, HEIC or HEIF, up to 5 MB. Max 9 photos per profile.

HEIC is accepted because it is the default camera format on iOS. Every upload
is converted to JPEG in storage, so the stored url renders in any browser on
its own. Delivery transformations may still ask for f_auto to get WebP where
it is supported, but nothing depends on remembering to.

The format check rejects mistakes, not attackers: both Content-Type and the
file name come from the client. Cloudinary inspects the actual bytes and is the
real gate.

The limit is checked before the upload leaves for storage, so a rejected tenth
photo never occupies space in the cloud.

The first photo uploaded becomes the main one automatically.

201 Created with { id, url, isMain, order }.
409 Conflict when the profile already holds nine photos.

DELETE /api/profiles/me/photos/{photoId}

Removes the file from storage and the row from the database, renumbers Order to
close the gap, and promotes the next photo to main if the deleted one was main.

204 No Content. A photo belonging to someone else answers 404, not 403, so its
existence is not revealed.

Deleting the last photo is allowed on purpose. A user must stay able to remove
an image they published by mistake, so the rule is not "you may not delete" but
"a profile without a photo is not shown".

MyProfileDto carries isDiscoverable, true when the profile is not private and
holds at least one photo. The onboarding wizard gates its final step on it, and
the discovery feed filters on the same condition, so a profile created through
the API directly still earns no impressions until a photo exists.

PUT /api/profiles/me/photos/{photoId}/main

Clears IsMain on every photo of the profile, then sets it on the target, so the
"exactly one main" invariant always holds.

204 No Content.

Planned separate endpoints

PATCH /api/profiles/me/visibility    { isPrivate }
PUT   /api/profiles/me/preferences   { showMe, minAge, maxAge, maxDistanceKm }
PUT   /api/profiles/me/photos/order  reordering by drag and drop

The second one lands together with swiping, since its other fields have
nothing to filter until then.

Two profile shapes

MyProfileDto      owner view, includes DateOfBirth, ShowMe, IsPrivate,
                  CreatedAt
PublicProfileDto  visitor view, exposes Age instead of DateOfBirth and hides
                  ShowMe (a search preference, not information about the user)
                  and IsPrivate

Both carry the collections: photos, interests, languages, promptAnswers.
Photos stays an empty array until upload exists, so the response shape is
already final for the client.

Reads load the profile with every collection and use AsSplitQuery, because four
collection includes in one statement multiply into a cartesian product that
repeats all profile columns on every row.

DateTime fields are sent as UTC with the Z suffix. SQL Server datetime2 keeps
no offset, so EF reads values back as Unspecified and the serialiser would drop
the suffix, leaving the client to read the value as its own local time. The
mapping restores the kind on the way out.

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