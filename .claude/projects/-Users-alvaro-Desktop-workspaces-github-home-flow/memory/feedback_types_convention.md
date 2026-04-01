---
name: Types convention — separate files, prefer interface
description: Types must live in their own files; prefer interface over type for object shapes
type: feedback
---

Types must always be in dedicated files, separate from implementation files (API, model, etc.).

**Why:** Keeps implementation files clean and makes types easier to find, import, and evolve independently.

**How to apply:** Types used in only one file stay in that file. Only extract to a dedicated `*.types.ts` when the type is shared across multiple files. Prefer `interface` over `type` for object shapes; keep `type` only for unions, aliases, and array types that can't be expressed as interfaces.
