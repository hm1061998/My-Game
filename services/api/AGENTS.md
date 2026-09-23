# API rules

- Endpoints coordinate application use cases. Domain rules do not depend on HTTP, EF Core, SQLite, JSON files, or the game client.
- Put storage ports in `Application`; implementations and provider-specific behavior stay in `Infrastructure`.
- Return explicit DTOs and ProblemDetails. Never return EF entities, private solutions, or correct choices before disclosure rules allow it.
- Mutations involving progress, revision, and idempotency receipts must be atomic in the adapter.
- Fail startup clearly for unknown or unavailable providers. Do not silently fall back to in-memory or file storage.
- Keep provider migrations separate. A second provider is supported only after its real integration contract and migration rehearsal pass.
- Use UTC for system timestamps, cancellation tokens for I/O, and structured logs without tokens or answers.
- Run restore, build, and tests for the final API revision.
