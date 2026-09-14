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


- [ ] Like
- [ ] Dislike
- [ ] Match Detection
- [ ] Undo Like

---

## Chat

- [ ] SignalR
- [ ] Read Status
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