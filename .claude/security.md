Security

Authentication

JWT

Refresh Token

Authorization

Role Based

Policy Based

Protection

HTTPS

Rate Limiting

CORS

Allowed origins come from configuration (Cors:AllowedOrigins), never
AllowAnyOrigin.

UseCors must sit after UseHttpsRedirection and before UseAuthentication.
Placed later, the browser preflight OPTIONS request is rejected by the
authorization fallback policy before CORS headers are attached, and the client
sees a misleading CORS error instead of a 401.

UseHttpsRedirection runs outside Development. TLS there is terminated by
whatever exposes the app to the other developer, a dev tunnel today, and the
request reaches Kestrel as plain HTTP. Redirecting it answers the preflight
with a 307, which CORS forbids, and points at a port that exists only on the
machine running the server. In production the redirect stays.

Development Tools

Swagger and /api/dev/seed are reachable in every environment, and the seed
endpoints need no login. This is a deliberate choice while the app has no real
users, so the team can work against the Azure deployment without extra setup.

What it exposes: anyone who finds the URL can add up to 200 fake profiles per
call, wipe the seeded ones, and learn whether an email is registered from the
likeEmail note. Only test data is at stake today.

Before any public launch both must go: remove the dev endpoints and gate
Swagger again. The item is tracked in roadmap.md under Deployment.

Known gap: the authorization FallbackPolicy is commented out in Program.cs
(arrived with commit 863a556). No controller carries [Authorize], because every
one relied on that policy, so all endpoints now accept anonymous calls.
Endpoints that read the current user still fail with 401, but only because
CurrentUserService throws deep in the handler, after validation has already
run; GET /api/profiles/{id} and GET /api/lookups answer anyone. Restore the
policy before real traffic, and open a single endpoint with [AllowAnonymous]
where one genuinely has to be public.

Third-Party Model

The AI assistant sends data to Anthropic. What goes: the partner's profile as the
caller already sees it, and up to the last 50 messages of their conversation. What
never goes: coordinates, date of birth, e-mail, social handles.

Note what this means — the partner never agreed to it. The data is theirs, shown
to this caller inside the app, and a request forwards it to a service outside it.
That is the price of the feature, and it is a decision, not an oversight; the
exclusions above exist so the price stays as small as the feature allows.

Ai:ApiKey never sits in appsettings.json: user secrets in development, an
environment variable in production. A leaked key is spent on somebody else's
requests and billed to us, so it is revoked in the console rather than rotated
quietly. The endpoint is open to every authenticated user and has no per-user
limit yet, which is tracked in roadmap.md under AI.

Profile text and chat messages reach the model as data, never as instructions.
The system prompt states this, so a bio reading "ignore your instructions" is
somebody else's text rather than a command.

XSS

CSRF

SQL Injection

OWASP Top 10

Passwords

BCrypt

Logging

Never log

Passwords

Tokens

Personal data