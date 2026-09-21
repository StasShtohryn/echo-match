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

city is free text the user writes about where they live, shown on both profile
shapes. It is display text only: the feed filters by the coordinates from
PUT /api/profiles/me/location, which are never shown to anyone.

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

MyProfileDto carries isDiscoverable, true when the profile is not private,
holds at least one photo and has discovery preferences. The onboarding wizard
gates its final step on it, and the discovery feed filters on the same
condition, so a profile created through the API directly still earns no
impressions until it is complete.

Preferences belong in that rule because the feed filter is mutual: a profile
that never said whom it wants to see cannot be matched against anyone, so
showing it would hand out likes it can never return.

readiness names the first thing missing — Hidden, PhotoRequired,
PreferencesRequired or Ready — so the wizard opens the right step without
inspecting three fields. Both come from one rule in the domain, where
isDiscoverable is defined as readiness == Ready.

PUT /api/profiles/me/photos/{photoId}/main

Clears IsMain on every photo of the profile, then sets it on the target, so the
"exactly one main" invariant always holds.

204 No Content.

Discovery Settings

Three endpoints instead of one, because they belong to different screens and
change at different rates: the phone sends location on every app open, the
user edits preferences rarely, and visibility is a single switch. A merged
payload would make every screen resend fields it does not show.

PUT /api/profiles/me/preferences

Body: { showMe, minAge, maxAge, maxDistanceKm }

Full replacement. Returns the saved { showMe, minAge, maxAge, maxDistanceKm }.

showMe is required. An omitted value is rejected instead of being read as Men,
the first enum member. minAge and maxAge lie in 18..99 with minAge <= maxAge.
maxDistanceKm lies in 1..160, or null for no distance limit. As with every full
replacement, omitting it means null.

A new profile has no preferences, and MyProfileDto.preferences stays null until
the user saves them. There is no server default on purpose: a default showMe
would assume the user's orientation, and the profile would start appearing to
people the user never chose. The client may prefill the form with 18..99 and
50 km, but nothing is stored until the user confirms.

PUT /api/profiles/me/location

Body: { latitude, longitude }. Both required: an omitted field is rejected
instead of silently becoming 0, a real point in the Gulf of Guinea. Stamps
LastLocationUpdatedAt. 204 No Content.

PATCH /api/profiles/me/visibility

Body: { isPrivate }. Required: an omitted value would read as false and
silently make a hidden profile public. 204 No Content.

Planned separate endpoints

PUT /api/profiles/me/photos/order  reordering by drag and drop

Two profile shapes

MyProfileDto      owner view, includes DateOfBirth, IsPrivate, CreatedAt,
                  readiness, and preferences { showMe, minAge, maxAge,
                  maxDistanceKm }
PublicProfileDto  visitor view, exposes Age instead of DateOfBirth and hides
                  preferences (what the user searches for, not who they are)
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

Swipe Endpoints

POST /api/swipes

Body: { targetProfileId, direction }   direction: Like | Dislike

Records the caller's decision about another profile and reports whether it
produced a match: { isMatch, matchId }. 200, not 201: the point of the reply is
the outcome, and there is no swipe resource to fetch afterwards.

A match is created when a like meets an earlier like from the other side. The
swipe and the match are saved in one transaction.

direction is required: an omitted value would read as Like, the first enum
member, and silently like someone the user meant to pass.

400  swiping oneself, or invalid payload
404  the caller has no profile, or the target does not exist
409  the caller already swiped this person, unless it was a dislike older than
     30 days, which the new decision overwrites

Two simultaneous likes can each miss the other's uncommitted row and produce no
match. The unique index prevents the opposite failure, a duplicate match.
Reconciliation lands with the matches list.

Discovery Endpoint

GET /api/discovery?limit=20

Returns the next batch of candidate cards:

{ status, candidates: [ { profile, distanceKm } ] }

Ready                at least one card
NoCandidates         everything is set up, nobody matched
ProfileHidden        the caller turned their own visibility off
PhotoRequired        no photo yet
PreferencesRequired  discovery preferences never saved
LocationRequired     a distance limit is set but coordinates are missing

An empty feed is a screen state, not a failure, so none of these is an error
code: the client reads status and shows the matching prompt instead of parsing
a message. Ready always carries at least one card.

limit is 1..50, default 20. There is no page number. Swiped people drop out of
the query, so asking again returns the next batch, and offset paging would skip
exactly as many people as were swiped between the two calls. The client fetches
again when about three cards remain and drops ids it already holds, since a
card it has not swiped yet is still free as far as the server knows.

Every filter is mutual — the candidate matches the caller's preferences and the
caller matches theirs:

  visibility   the candidate is discoverable
  gender       each side's ShowMe accepts the other's Gender
  age          each side's age falls inside the other's range
  distance     within min(both limits); null on either side lifts that side
  swipes       the caller has no like, and no dislike newer than 30 days

distanceKm is rounded up to whole kilometres and never below 1: exact metres
across a few updates would locate someone's home. It is null when no limit
applies on either side, so the distance was never needed.

Candidates come back in random order. Ranking waits for real usage data.

Match Endpoints

GET /api/matches

The caller's matches, newest first:

[ { id, createdAt, isNew, partner: { profileId, displayName, age, mainPhotoUrl } } ]

isNew is per participant: a match stays new for each side until that side
opens it. Both sides start new, including the one whose like completed the
match, so the client decides whether its "It's a match" screen counts as
opening. Matches with a deleted partner drop out of the list.

POST /api/matches/{id}/seen

Marks the match as opened by the caller. 204. Idempotent: repeating it keeps the
time of the first opening and writes nothing. A match the caller is not part of
answers 404, not 403, so its existence is not revealed.

Opening is a separate POST rather than a side effect of GET: a GET may be
prefetched, retried or called for a badge, and each of those would silently
mark matches as read.

Development Endpoints

POST   /api/dev/seed?count=30&likeEmail=…
DELETE /api/dev/seed

Create and remove test profiles (emails end with @seed.local, password
Seed1234!). count is 1..200, default 30. With likeEmail, the first five are
shaped to pass that user's filters and have already liked them, so a match can
be tried in one swipe. DELETE removes every seeded profile with its swipes and
matches, whoever created them.

Both are open without login, and Swagger is on in every environment, on purpose
while the app has no real users. See security.md.

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