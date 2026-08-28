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
  Orientation, Bio, Occupation, Company, School, HeightCm
  ShowMe, LookingFor                        (discovery)
  FamilyPlans, Communication, LoveLanguage, Pets, Drinking, Smoking, Workout
  InstagramHandle, SpotifyHandle
  Location (owned value object: Latitude, Longitude), LastLocationUpdatedAt
  IsPrivate, IsFaceVerified, LastActiveAt

Photo
  UserProfileId, Url, PublicId, IsMain, Order
  Max 9 per profile. Exactly one IsMain.

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

Required profile fields

DisplayName, DateOfBirth, Gender.

Everything else is nullable. An incomplete profile is a valid state because
onboarding is progressive.

Value Objects

GeoLocation
  Latitude, Longitude
  Mapped with OwnsOne. No separate table.
  Validates range on construction.