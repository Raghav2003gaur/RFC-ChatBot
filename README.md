## IETF AI Assistant

### Setup

1. Install deps:

```bash
pnpm install
```

2. Configure OpenRouter:

Create `.env.local` in the project root with:

```
OPENROUTER_API_KEY=your_key_here
# Optional
# OPENROUTER_MODEL=openrouter/auto
# OPENROUTER_SITE_URL=http://localhost:3000
```

3. Run dev:

```bash
pnpm dev
```

### Notes

- API route: `app/api/chat/route.ts` bridges the chat UI to OpenRouter.
- The UI calls `/api/chat` with `{ prompt, audience }`.
# RFC-ChatBot
