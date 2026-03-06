---
name: build_backend_fashn_tryon
description: API Route para FASHN Virtual Try-On v1.5 — troca de roupas em modelos AI com custo de ~$0.075/imagem
---

# Backend — FASHN Virtual Try-On

## Modelo: `fal-ai/fashn/tryon/v1.5`

### Input Schema
| Param | Tipo | Descrição |
|-------|------|-----------|
| `model_image` | string (URL/base64) | Imagem da modelo (persona) |
| `garment_image` | string (URL/base64) | Imagem da roupa (flat-lay ou manequim) |
| `category` | enum | `auto`, `tops`, `bottoms`, `one-pieces` |
| `mode` | enum | `performance`, `balanced`, `quality` |
| `garment_photo_type` | enum | `auto`, `model`, `flat-lay` |
| `output_format` | enum | `png`, `jpeg` |

### Output
```json
{ "images": [{ "url": "https://cdn.staging.fashn.ai/..." }] }
```

### Custo: ~$0.075/imagem (576×864px)

### Route Handler
`src/app/api/tryon/route.ts` — POST endpoint que:
1. Recebe `model_image` + `garment_image`
2. Chama `fal.subscribe("fal-ai/fashn/tryon/v1.5", { input })`
3. Retorna `{ success, images }`

## Referência
- [API Docs](https://fal.ai/models/fal-ai/fashn/tryon/v1.5/api)
