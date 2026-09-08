Frontend

React

TypeScript

TailwindCSS

Axios

React Router

Structure

components/

pages/

hooks/

services/

contexts/

types/

utils/

Rules

Components should be small.

Avoid prop drilling.

Prefer custom hooks.

Business logic should stay inside hooks/services.

No API calls directly inside JSX.

Enums and lookups

The backend sends keys, never display text.

Which values exist comes from GET /api/lookups, fetched once per session after
login and kept in shared state.

How a value reads to the user comes from a label dictionary on the client,
keyed by the same string the backend stores.

An unknown key falls back to itself, so a value added on the backend renders as
its raw key instead of blank. The interface degrades, it does not break.

Lookup rows (interests, languages, prompts) already carry a name from the API,
because those live in the database. Only enums need the client dictionary.