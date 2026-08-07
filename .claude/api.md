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