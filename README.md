# Shadow Society — Platform

Next.js UI for **Shadow Society** (Qwen Cloud Global AI Hackathon 2026 · Agent Society).

Single flow: **Config → Simulation → Results**, with a Three.js cylinder pyramid for agents (Judge, Defender, Mediator, Accuser, and five Public voters).

Pairs with [`shadow-society-services`](https://github.com/JoseAngelChepo/shadow-society-services) (NestJS API on `:3011`).

## Quick start

```bash
cp .env.example .env.local
yarn install   # or npm ci
yarn dev       # http://localhost:3010
```

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3010` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3011/api/v1` |

## App surface

| Path | Role |
|------|------|
| `/` | Shadow Society app (config / sim / results) |

Core UI: `src/components/shadow-society/`  
Debate client: `src/data/api/server/debate.ts`

See the parent folder [`SHADOW-SOCIETY.md`](../SHADOW-SOCIETY.md) for product notes and API overview.
