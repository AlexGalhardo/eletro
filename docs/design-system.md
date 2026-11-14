# Design system

Visual "papel de jornal": superfícies quentes e discretas, texto quase preto, **acento neutro**: preto no tema claro, branco no escuro, sem cor de matiz. Os tokens seguem os nomes do [shadcn/ui](https://ui.shadcn.com) e ficam em `src/app.css` (Tailwind 4: `:root`, `.dark` e `@theme inline`).

## Regras

- Um acento só: `--primary`, preto (claro) ou branco (escuro). Sem verde, azul e afins no código (`green-`, `emerald-`, `blue-`, `sky-`, `indigo-` e hex equivalentes). Vermelho e âmbar existem só para erro e aviso; sucesso usa tokens neutros. A única exceção são as cores dos marketplaces nos botões de oferta (`.offer-btn` em `src/app.css`).
- Claro: fundo `#F5F4F0`. Escuro: grafite quente, nunca preto puro. O tema segue o sistema (`color-scheme` e `prefers-color-scheme`) e o botão alterna; o valor só é salvo quando difere do sistema (`src/lib/theme.ts` e o script inline de `src/layouts/Root.astro`).
- Use tokens (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary text-primary-foreground`), nunca `gray-*`, `zinc-*`, `black` ou `white`. As variantes `dark:` só entram para algo que o token não cobre.
- `--radius` é `0.25rem`: campos e cards quase quadrados. `rounded-md` é o padrão.
- Foco sempre visível: `:focus-visible` usa `--ring`. Movimento reduzido respeitado.
- Limite conhecido: o tema escuro depende da classe `.dark` aplicada por JavaScript (o Tailwind usa `dark:` por classe). Sem JavaScript a página fica no tema claro.

## Tokens

| Token | Claro | Escuro |
|---|---|---|
| `--background` | `#F5F4F0` | `#1C1B19` |
| `--foreground` | `#1A1917` | `#ECE9E1` |
| `--card` / `--popover` | `#FCFBF8` | `#242320` |
| `--primary` / `--ring` | `#1A1917` | `#FFFFFF` |
| `--primary-foreground` | `#F5F4F0` | `#1C1B19` |
| `--secondary` / `--muted` | `#EAE8E1` | `#2D2B28` |
| `--muted-foreground` | `#5C5A52` | `#A8A59B` |
| `--accent` | `#E3E1D8` | `#34322E` |
| `--destructive` | `#B42318` | `#F87171` |
| `--border` | `#D9D6CC` | `#3A3834` |
| `--input` (borda de campo) | `#8A8779` | `#7A776C` |
| `--sidebar` | `#EFEDE7` | `#201F1C` |

### Contraste (WCAG 2.2)

| Par | Claro | Escuro | Mínimo |
|---|---|---|---|
| `foreground` sobre `background` | 15,96 | 14,19 | 4,5 |
| `foreground` sobre `card` | 16,98 | 12,95 | 4,5 |
| `muted-foreground` sobre `background` | 6,28 | 6,98 | 4,5 |
| `muted-foreground` sobre `muted` | 5,64 | 5,73 | 4,5 |
| `primary` (texto) sobre `background` | 15,96 | 17,21 | 4,5 |
| `primary-foreground` sobre `primary` | 15,96 | 17,21 | 4,5 |
| `destructive` sobre `background` | 5,97 | 6,22 | 4,5 |
| `input` (borda) sobre `background` | 3,28 | 3,84 | 3 |
| `input` (borda) sobre `card` | 3,49 | 3,50 | 3 |

`--border` (1,3 a 1,5) é só divisória decorativa; a borda que delimita um campo é `--input`. Recalcule os pares ao mudar um token.

## Tipografia e espaçamento

- Corpo: Inter. Marca: Space Grotesk (`font-brand`). Títulos: Inter 600 a 700.
- Escala do Tailwind; texto de leitura em `text-base` ou maior, apoio em `text-sm` e `text-xs` (nunca abaixo de 12px).
- Espaçamento em múltiplos de 4px (`gap-2`, `gap-4`, `p-4`, `p-6`).

## Componentes

| Componente | Onde | Regra |
|---|---|---|
| Botão de oferta | `src/lib/components/OfferButton.astro` | Único CTA de afiliado do site. Cor da loja (Mercado Livre `#FFE600`, Amazon `#FFD814`, Shopee `#EE4D2D`, demais preto e branco) com sombra inferior sólida e efeito de afundar no `:active`; texto "Ver oferta no/na (loja)", com nome e artigo de `site.stores`. Carrega `data-affiliate`, `data-product-id`, `data-post-slug` e `data-store`, e dispara o evento GA4 `affiliate_click` |
| Card de produto | `CardsTable.astro` | Imagem, nome, botões de oferta, vantagens e ficha |
| Campo | `ui.input` em `src/lib/admin/api.ts`; `Input` shadcn no painel | Borda `border-input`, foco com `ring` |
| Sidebar | `src/lib/admin-ui/AdminShell.tsx` | Recolhível para ícones, Ctrl+B, off-canvas no celular, estado salvo em `localStorage` |

## Site público e painel

- **Site público:** componentes `.astro` com classes Tailwind sobre os tokens. Sem runtime React.
- **`/admin`:** ilhas React com os componentes shadcn de `src/lib/admin-ui/ui/`. O layout é `src/layouts/Admin.astro` (sidebar com Produtos e links, Posts, Métricas, Flags e Newsletter). O editor de posts e produtos continua em `src/lib/admin/` e o fluxo de gravação por PR não mudou.

## Adicionar um componente shadcn

1. Fixe a versão da CLI: `bunx shadcn@4.23.0 add <componente> --path src/lib/admin-ui/ui` (o `components.json` já existe). O `--path` é necessário: sem ele a CLI resolveu os aliases `#lib/*` para uma pasta fora do repositório.
2. Confira o que a CLI mexeu: ela pode acrescentar dependências no `package.json` e variáveis no fim de `src/app.css` (remova as duplicadas, os tokens já existem). Fixe as versões sem `^`.
3. Nos arquivos gerados, troque `from "cn"` ou `@/lib/utils` por `#lib/admin-ui/utils.ts` e os imports entre componentes por `#lib/admin-ui/ui/<nome>.tsx`.
4. `bunx biome check --write src` e `bun run check`.
5. Use só em ilha React do `/admin`; no site público escreva o equivalente em `.astro`.

## Faça e não faça

- Faça: tokens, `rounded-md`, `aria-current="page"` no item ativo, `rel="noopener noreferrer sponsored"` nos links de loja.
- Faça: edite o radar monocromático em `static/icon.svg` (fundo transparente, traço claro no `prefers-color-scheme: dark`; no site o `LogoMark.astro` o usa como máscara com a cor do texto) e gere os PNGs com `bun scripts/make-icons.ts`.
- Não faça: cor de loja fora de `.offer-btn`, um segundo acento, azul, sombra pesada, `dark:` repetindo o que o token já faz.
- Não faça: texto de identidade (o nome do site) em componente; use `src/lib/site.config.ts`.
