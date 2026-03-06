---
name: build_frontend_ui
description: Interface premium self-service com Persona Cards + upload de roupas para Virtual Try-On, focada em alta conversão
---

# Frontend — Premium UI

## Design Principles
- **Dark Mode** com glassmorphism
- **Self-service**: usuário seleciona modelo → faz upload da roupa → clica gerar
- **Zero aprendizado**: interface intuitiva sem necessidade de tutorial

## Layout (Split Grid)
| Esquerda (5 cols) | Direita (7 cols) |
|-------------------|------------------|
| Grid 2×3 de Persona Cards | Upload zone (drag & drop) |
| Nome, descrição, style tags | URL input alternativo |
| Seleção visual (cyan glow + ✓) | Categoria + Qualidade selects |
| | Botão "Gerar Look Virtual" |
| | Progress bar (~45s) |
| | Result panel + download |
| | Histórico de gerações |

## Componentes Chave
- **Persona Cards**: `src/data/personas.ts` (6 modelos pré-definidas)
- **Upload Zone**: drag & drop + file input + URL input
- **Result Panel**: imagem resultado + badge de custo + download
- **History Grid**: últimas 12 gerações em miniatura

## Especificações de Imagem
- **Entrada (roupa)**: JPG, PNG, WebP — flat-lay ou manequim
- **Saída (resultado)**: 576×864px JPEG/PNG
