---
name: configure_fal_ai_sdk
description: Configurar o SDK Fal.ai com proxy seguro para Next.js App Router, garantindo que FAL_KEY nunca seja exposta no client-side
---

# Configurar Fal.ai SDK

## Arquitetura de Segurança

O SDK Fal.ai usa um **proxy pattern** oficial:
- Client-side: `fal.config({ proxyUrl: "/api/fal/proxy" })` 
- Server-side: proxy route forwards requests com `FAL_KEY` do `.env.local`

## Arquivos Necessários

### 1. Proxy Route (Server-Side)
`src/app/api/fal/proxy/route.ts`:
```typescript
import { route } from "@fal-ai/server-proxy/nextjs";
export const { GET, POST } = route;
```

### 2. Client Config
`src/lib/fal.ts`:
```typescript
import { fal } from "@fal-ai/client";
fal.config({ proxyUrl: "/api/fal/proxy" });
export { fal };
```

### 3. Environment
`.env.local`:
```
FAL_KEY="key_id:key_secret"
```

## Produção (Vercel)
- No Vercel Marketplace → instalar integração Fal → `FAL_KEY` é injetada automaticamente
- Link: https://vercel.com/integrations/fal
