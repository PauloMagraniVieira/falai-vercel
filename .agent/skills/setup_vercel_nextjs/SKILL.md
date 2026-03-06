---
name: setup_vercel_nextjs
description: Inicializar projeto Next.js 14+ com App Router, TypeScript, Tailwind CSS e configurar para deploy na Vercel
---

# Setup Vercel + Next.js

## Instruções

1. **Inicializar o Projeto**
```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --use-npm --yes
```

2. **Instalar Dependências**
```bash
npm install @fal-ai/client @fal-ai/server-proxy lucide-react
```

3. **Configurar `next.config.ts`**
- Adicionar `images.remotePatterns` para domínios: `fal.media`, `v3.fal.media`, `cdn.staging.fashn.ai`, `images.unsplash.com`

4. **Configurar `.env.local`**
```
FAL_KEY="your_fal_ai_key_here"
```

5. **Verificar Build**
```bash
npm run build
```

## Referências
- [Fal.ai + Vercel Integration](https://docs.fal.ai/model-apis/integrations/vercel)
- [Fal.ai + Next.js Guide](https://docs.fal.ai/model-apis/integrations/nextjs)
