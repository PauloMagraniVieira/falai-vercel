---
name: build_backend_flux_persona
description: API Route para geração de personas AI (Top Models) via FLUX Dev com IP-Adapter FaceID para retenção de identidade
---

# Backend — FLUX Persona Generator

## Modelo: `fal-ai/flux/dev`

### Conceito
- Gera imagens hiper-realistas de modelos AI a partir de prompts textuais
- Custo: ~$0.025/megapixel
- Integra com IP-Adapter-FaceID-Plus-V2 para retenção de rosto (embedding 512 dimensões)

### Input Schema
| Param | Tipo | Descrição |
|-------|------|-----------|
| `prompt` | string | Descrição da modelo (estilo, pose, iluminação) |
| `image_size` | string | `portrait_4_3`, `square_hd`, `landscape_16_9` |
| `num_images` | integer | Número de variações (default: 1) |

### Estratégia de Economia
1. **Gerar 1x** a Top Model com FLUX Dev (~$0.77)
2. **Arquivar** a imagem no Storage (R2/S3)
3. **Reutilizar $0.00** como `model_image` no FASHN Try-On
4. Cada troca de roupa custa apenas ~$0.075

### Route Handler
`src/app/api/persona/route.ts` — POST endpoint
