# ASHISH-ALAM-KABIR

## Portfolio AI Agent

This portfolio includes a lightweight AI assistant that answers grounded questions about Ashish Alam Kabir using the portfolio's own verified data and project metadata.

### Architecture

- Static portfolio frontend served from the existing site
- Node.js/Express API at `/api/ai/chat`
- Server-side OpenAI integration with a safe fallback mode when the API key is unavailable
- Portfolio grounding layer in `server/portfolio-agent.js`

### Environment variables

Copy `.env.example` to `.env.local` and add:

1. `OPENAI_API_KEY`
2. `OPENAI_MODEL` (optional, defaults to `gpt-4o-mini`)
3. `PORT` (optional, defaults to `3000`)
4. `GITHUB_TOKEN` (optional for future GitHub integration)

### Local development

```bash
npm install --legacy-peer-deps
cp .env.example .env.local
npm start
```

Then open `http://localhost:3000`.

### AI behavior

- Keeps answers grounded in portfolio content only
- Refuses prompt injection attempts and secret disclosure requests
- Falls back to portfolio-based answers if the AI service is unavailable
- Supports project, skills, resume, education, and recruiter-oriented questions

### Deployment

The app is static-first and compatible with a simple Node server deployment. Configure the same environment variables in the hosting platform dashboard and keep all secrets server-side.
