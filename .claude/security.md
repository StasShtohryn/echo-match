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