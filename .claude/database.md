Database

MS SQL Server

Entity Framework Core

Code First

Base Classes

Pick the base class by who owns the data.

BaseEntity
  For user owned data.
  Guid Id, CreatedAt, UpdatedAt, IsDeleted, DeletedAt.
  Guid hides row counts and prevents id enumeration.
  Covered by the global soft delete query filter.
  User, UserProfile, Photo, ProfilePromptAnswer

  Id must not be initialised in code. EF Core generates it, and decides whether
  an entity found in a tracked collection is new by whether its key is still
  default. A constructor assigned Guid makes EF read a new child as an existing
  row and emit an UPDATE that matches nothing, which surfaces as
  DbUpdateConcurrencyException. EF fills Id during Add, before SaveChanges, so
  code may still read it right after adding.

LookupEntity
  For reference data we seed ourselves.
  int Id, IsActive.
  int keeps foreign keys small in join tables and gives stable ids across
  environments in seed data.
  Retire an item with IsActive = false. Never delete it, or existing
  references break.
  Not covered by the soft delete filter.
  Interest, Language, ProfilePrompt

No base class
  For pure join tables. Composite key, no audit, no soft delete.
  UserInterest, UserLanguage

Conventions

Primary key

Id

Audit fields

CreatedAt

UpdatedAt

Soft Delete

IsDeleted

DeletedAt

Relationships

Use Foreign Keys.

Use Indexes.

Avoid cascade delete unless required.

Migration Rules

Never modify migration history.

Always create new migration.

Never use EnsureCreated().

A freshly generated migration may be edited before it is applied. Once applied
anywhere it is history.

Review every generated migration that adds a NOT NULL column or makes one NOT
NULL. EF fills existing rows with the CLR default (0, empty string), which is
rarely a valid value.

Do not use HasDefaultValue on a property whose CLR default is a legitimate
value (0, false, null, the first enum member). EF reads that value as "not set"
and writes the database default instead, both on insert and when an owned
instance is replaced. Put the value for existing rows in the migration.

Enum Storage

Store enums as string.

HasConversion<string>()

Never store enums as int. Reordering enum members would silently change the
meaning of already stored rows.

Computed Fields

Never store values that can be derived from other columns.

Age is derived from DateOfBirth.

ZodiacSign is derived from DateOfBirth.

Both are computed properties in Domain and ignored by EF Core.

Lookup Tables

Fixed vocabularies live in lookup tables, not free text.

Interest

Language

ProfilePrompt

Users select from the lookup. This keeps filtering reliable and prevents
duplicates caused by spelling or casing.

All lookups inherit LookupEntity and are populated by seed data with explicit
ids, so the same id means the same row in every environment.

Localization

Every lookup row carries two separate things.

Code
  Stable machine key. Latin, lowercase, snake_case. Never translated.
  Never changed once shipped, because stored data and translation files
  reference it.

Name / Question
  Display text. Currently Ukrainian. Treated as the default rendering, not
  as an identifier.

Translations for other languages live in resource files next to the frontend
code, keyed by Code. Adding a language must not require a migration.

The same principle already applies to enums: the stored string
("LongTermPartner") is the key, and the display text is resolved on the
client. This is why enums are stored as string and not int.

Schema

Auth

User
  Email, PasswordHash, GoogleId, Role
  1:1 UserProfile

  PasswordHash is null for accounts created through Google.
  GoogleId is null for accounts created with a password.
  Both may be set once an account is linked.
  GoogleId has a unique index. On SQL Server EF adds a filtered index
  (WHERE GoogleId IS NOT NULL) so that many rows may keep it null.

Profile

UserProfile
  UserId
  DisplayName, DateOfBirth, Gender          (required)
  Orientation, Bio, Occupation, Company, School, HeightCm, City
  LookingFor
  Preferences (DiscoveryPreferences, see Value Objects)
  FamilyPlans, Communication, LoveLanguage, Pets, Drinking, Smoking, Workout
  InstagramHandle, SpotifyHandle
  Location (owned value object: Latitude, Longitude), LastLocationUpdatedAt
  IsPrivate, IsFaceVerified, LastActiveAt

Photo
  UserProfileId, Url, PublicId, IsMain, Order
  Max 9 per profile. Exactly one IsMain.
  Deleting the main photo promotes the next one by Order.
  Order is renumbered on delete so new uploads never collide.

Computed on UserProfile, ignored by EF

Age            derived from DateOfBirth
ZodiacSign     derived from DateOfBirth
IsDiscoverable not private, holds at least one photo, preferences set
Readiness      which of those three is missing, or Ready. IsDiscoverable is
               defined as Readiness == Ready, so the rule exists in one place
               and the feed filter cannot drift from the onboarding prompt

ProfilePrompt (lookup)
  Code, Question, IsActive

ProfilePromptAnswer
  UserProfileId, ProfilePromptId, Answer, Order
  Max 3 per profile. A prompt may be answered once per profile.
  Answer max length 124.

Interest (lookup) + UserInterest
  Many to many. Interest carries Code and Name.

Language (lookup) + UserLanguage
  Many to many. Language Code is ISO 639-1.

Swiping

Swipe
  SwiperProfileId, TargetProfileId, Direction (Like | Dislike), DecidedAt
  A dislike expires after 30 days (Swipe.DislikeExpiry): the person may appear
  in the feed again, and swiping them updates the same row instead of adding
  one. A like never expires, because an unanswered like is a match still in
  the making. Nothing is ever reset in bulk: that would destroy pending likes
  and bring back people the user deliberately passed.
  DecidedAt is the time of the current decision. It is a field of its own
  rather than UpdatedAt, an audit field that any modification touches and that
  would silently restart the clock.
  Both foreign keys point at UserProfiles, so neither may cascade: SQL Server
  refuses a table whose delete reaches the same row by two paths. Restrict also
  matches how profiles are actually removed, which is softly.
  Unique index on (SwiperProfileId, TargetProfileId) filtered to IsDeleted = 0:
  one active swipe per pair, and undoing one frees the pair to be swiped again.
  A check constraint forbids swiping oneself.
  No collection navigation on UserProfile: a person accumulates thousands of
  swipes and nothing should make loading them all convenient.

Match
  ProfileOneId, ProfileTwoId
  Symmetric: a match has no initiator. The pair is ordered by Guid in
  Match.Between, the only way to create one, so (A, B) and (B, A) cannot both
  be stored. The unique index filtered to IsDeleted = 0 then catches duplicates
  and still lets a broken match form again later.
  Listing someone's matches reads WHERE ProfileOneId = me OR ProfileTwoId = me;
  the first half uses the composite index, the second needs its own index on
  ProfileTwoId.
  ProfileOneSeenAt, ProfileTwoSeenAt: when each side first opened the match,
  null while it is still new for that side. Two columns rather than one flag,
  because a match is shared but being seen is not. Set only through
  Match.MarkSeenBy, which keeps the first time (??=) and rejects outsiders.

Required profile fields

DisplayName, DateOfBirth, Gender.

Everything else is nullable. An incomplete profile is a valid state because
onboarding is progressive.

Value Objects

GeoLocation
  Latitude, Longitude
  Mapped with OwnsOne. No separate table.
  Validates range on construction.

DiscoveryPreferences
  ShowMe, MinAge, MaxAge, MaxDistanceKm
  Mapped with OwnsOne into UserProfiles as ShowMe, MinAgePreference,
  MaxAgePreference, MaxDistanceKm. Optional: null until the user saves them,
  so every column is nullable. EF treats the object as present when ShowMe,
  MinAge and MaxAge are set, so a stored MaxDistanceKm of null still reads as
  "no distance limit", not as "no preferences".
  What the user searches for, kept apart from what the profile says about
  them. Not a table of its own: the feed checks both sides' preferences for
  every candidate, so a join per row would cost on the hottest query, and
  preferences have no identity and never exist without their profile.
  MaxDistanceKm null means no distance limit.
  Validates ranges on construction. EF materialises it through the private
  constructor, so those checks do not run on read, and bad stored values
  surface as wrong filtering rather than an error.