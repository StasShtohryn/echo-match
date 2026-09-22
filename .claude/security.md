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