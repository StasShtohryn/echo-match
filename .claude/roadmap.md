# EchoMatch Roadmap

## Authentication

- [x] Register
- [x] Login
- [x] JWT
- [x] Google Sign-In
- [ ] Refresh Token
- [ ] Email Confirmation
- [ ] Forgot Password

---

## User Profile

Basics

- [x] Display Name
- [x] Date Of Birth (18+ required)
- [x] Gender
- [x] Sexual Orientation
- [x] Bio
- [x] Occupation / Company / School
- [x] Height
- [x] City (free text shown on the profile)

Lifestyle

- [x] Relationship Goal
- [x] Family Plans
- [x] Communication Style
- [x] Love Style
- [x] Pets
- [x] Drinking
- [x] Smoking
- [x] Workout

Content

- [x] Upload Photos (max 9, one main) — Cloudinary
- [ ] Photo reordering
- [ ] Upload Videos
- [x] Interests
- [x] Languages
- [x] Facts (prompt based: fixed questions, user answers up to 3)

Discovery & Privacy

- [x] Interested In — editable; applied once the feed exists
- [x] Age range and max distance preferences — editable; applied once the feed exists
- [x] Geolocation
- [x] Profile Visibility (is private)
- [ ] Last Active

Verification

- [ ] Face Verification (AWS Rekognition) — deferred

Social

- [x] Instagram / Spotify handles
- [ ] OAuth integration — deferred

---

## Swiping

The candidate feed must filter on IsDiscoverable: not private, at least one
photo, discovery preferences set. A profile that fails it stays reachable by direct link but earns no
impressions.


- [x] Like
- [x] Dislike (expires after 30 days, likes never do)
- [x] Match Detection
- [x] Candidate feed (mutual filters, random order)
- [ ] Widen-radius hint for an empty feed. Designed and verified, postponed for
      time: on NoCandidates, try radii 20 / 50 / 100 / 160 / no limit above the
      current one, reusing the same candidate selection with a throwaway
      DiscoveryPreferences, and return the first that yields anyone as
      widenHint { maxDistanceKm, candidates } beside the empty list, counting
      up to 50. Mutual limits are never relaxed, so someone who asked for
      20 km stays out of the suggestion.
- [x] Matches list (new until each side opens it)
- [x] Match counts for a badge (total and unseen, one aggregate query)
- [x] Undo a swipe (soft delete frees the pair; refused once the pair matched)
- [ ] Unmatch — ending a match the pair already has. Needed before chat, since
      a conversation must be closable from either side.

---

## Chat

- [x] Messages over REST (send, paged history, read mark). The conversation is
      the match; the cursor is a database-assigned sequence, not a timestamp.
- [x] SignalR (hub at /hubs/chat, one group per match, token in the query
      string; REST writes first and the hub only announces)
- [x] Read Status (one mark per participant on the match, not a flag per
      message: it carries both the ticks and the unread count)
- [x] Typing Indicator (relayed, never stored; the receiver hides it on a timer
      because a "stopped typing" event can be lost)
- [x] Message reactions (one per person per message, fixed set of six)
- [x] Chat list: last message and unread count on GET /api/matches
- [ ] after= cursor for GET messages, to catch up after a long disconnect;
      until then a client refetches the newest page and drops known ids
- [ ] Backplane (Redis or Azure SignalR) before running more than one instance:
      groups live in the memory of one process
- [ ] Delivered Status
- [ ] Typing Indicator
- [ ] Notifications

---

## Events

- [ ] Create Event
- [ ] Join Event
- [ ] Organizer Approval
- [ ] Tags
- [ ] Geo Search
- [ ] Event Chat

---

## AI

- [ ] Generate First Message
- [ ] Rewrite Message
- [ ] Continue Conversation
- [ ] Tone Adjustment

---

## Admin Panel

- [ ] User Management
- [ ] Reports
- [ ] Analytics
- [ ] Moderation

---

## Deployment

- [ ] IIS
- [ ] SQL Server
- [ ] HTTPS
- [ ] CI/CD
- [ ] Restore the authorization FallbackPolicy, disabled in commit 863a556.
- [ ] Before a public launch: remove /api/dev/seed and turn off public Swagger.
      Both are open without login on purpose while the app has no real users.