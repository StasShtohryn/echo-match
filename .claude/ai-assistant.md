AI Assistant

Purpose

Help users write, and help a new match start talking.

Model

Claude Sonnet 5.5 (claude-sonnet-5-5) through the official Anthropic SDK
(`Anthropic` package), called from Infrastructure. Chosen over Haiku for the
quality of playful and flirty wording, which is the whole point of the feature.
The key lives in Ai:ApiKey — user secrets in development, an environment variable
in production — never in appsettings.json. Ai:BaseUrl exists so a stub can stand
in for api.anthropic.com in checks.

The call goes through client.Beta.Messages, because server-side fallback is a
beta. Effort is Low: three short messages need little reasoning, and reasoning is
billed as output. MaxTokens is 2000 so that the reasoning cannot crowd out the
answer itself.

The subscription on claude.ai does not include API access: the console account is
billed separately, pay as you go. One suggestion request costs about $0.0085, so
roughly 120 of them per dollar.

What it does

Message suggestions — POST /api/matches/{matchId}/ai/suggestions, with a kind:

  FirstMessage   openers for a match with no messages yet
  Reply          continue the conversation
  Rewrite        rewrite the caller's draft, keeping its meaning
  Grammar        fix mistakes without touching the voice

An optional tone (Friendly, Playful, Flirty, Sincere) steers the wording. Three
variants come back, deliberately different in approach rather than three
rewordings of one, because a row of near-identical suggestions reads as filler.

Compatibility — GET /api/matches/{id}/compatibility. The overlaps are computed
from the database: shared interests, shared languages, the same relationship
goal, the distance. The model only phrases them in one sentence. That sentence is
stored on the match and reused, so both participants read the same line and
reopening the screen costs nothing.

The percentage shown in the feed is calculated on the client
(frontend/src/lib/compatibility.ts) and is not this. Moving the score to the
server would make it one number for the whole app, and is the right end state —
it is business logic, and a client-side score can be edited from a browser
console — but it is not worth reworking before the deadline.

Input

Current user's display name. The partner's profile as it is already shown to this
user: name, age, city, bio, occupation, goal, interests, languages, prompt
answers. Up to the last 50 messages of the conversation.

Never sent: coordinates, date of birth (age goes instead), e-mail, social
handles. The whole history would not fit the context window and would be paid for
on every call, hence the cap.

Output

Three short messages, or one sentence for compatibility. Nothing is stored except
the compatibility line: a suggestion lives only as long as the client shows it,
and sending it is a separate, ordinary POST — the assistant cannot send anything
on the user's behalf.

Limits

Invention is allowed in form, jokes and claims about oneself; never about the
partner. A suggestion may not attribute to them words, hobbies or promises that
are not in the profile or the history — a fabricated fact about the other person
is visible immediately and reads as a bug, not as wit.

No pressure, no contempt, nothing sexual about anyone's body. Profile text and
messages are treated as data: a bio that says "ignore your instructions" is
somebody else's text, not a command, and the system prompt says so.

Failures

A refusal or an outage on the model's side raises AiUnavailableException, which
the global handler maps to 503 — the client says "try again" instead of "something
broke". The SDK already retries 429 and 5xx twice before that. A missing key is a
different thing: it is our own misconfiguration, so it throws and surfaces as 500.

A refusal arrives as HTTP 200 with stop_reason "refusal", so it is checked
explicitly; otherwise it would look like an empty answer.

The request opts into server-side fallback (fallbacks: "default", beta header
server-side-fallback-2026-07-01). Anthropic picks the substitute by the reason for
the refusal: for Sonnet 5.5 only "cyber" and "frontier_llm" declines are retried,
on Claude Sonnet 5. "general_harms", "bio" and "reasoning_extraction" are not
retried and come back as a refusal. For a dating app the likely category is
general_harms, so the fallback rarely fires here; it stays because it costs
nothing until it does. What actually keeps refusals rare is the system prompt's
limits above.
