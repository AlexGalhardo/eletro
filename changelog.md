# Changelog

## 2026-09-09 — 50 novas postagens a partir do Eletrosinter

Criadas **50 postagens novas** (`blogPostId` 84 a 133), seguindo o pipeline já
validado com a postagem `melhor-amolador-de-facas`. Cada post tem:

- `app/[slug]/content/<slug>.mdx` — front-matter no padrão do projeto
  (`date: "2026-09-09"`, `draft: false`, `cover: "/images/covers/<slug>-cover.webp"`,
  `ref` para a URL do Eletrosinter, `faqData` com 3 perguntas), intro de 3 a 4
  parágrafos reescritos, `<CardsTable category="<chave>" />` e a seção
  `## Perguntas Frequentes`.
- `data/<slug>.json` — 7 produtos (2 exceções com 6, ver abaixo), no schema dos
  arquivos existentes: `id`, `name`, `image` (`/images/posts/<slug>-N.jpg`),
  `amazonUrl`/`mercadolivreUrl`/`shopeeUrl` **todos `null`**, `advantages` (3–5
  itens reescritos), `technicalDetails` (`[{label, value}]` com specs factuais).

Nenhum título, descrição, texto analítico ou `advantage` foi copiado
literalmente do Eletrosinter — só dados factuais (nome, modelo, specs) foram
extraídos e o restante foi reescrito.

### Posts criados

| blogPostId | slug | categoria | fonte (Eletrosinter) |
|---|---|---|---|
| 84 | melhor-microretifica | ferramentas | /ferramentas/microretifica/ |
| 85 | melhor-cooktop-suggar-5-bocas | cozinha | /cozinha/cooktop-suggar-5-bocas/ |
| 86 | melhor-saco-de-dormir | ferramentas | /ferramentas/saco-de-dormir/ |
| 87 | melhor-bebedouro-de-mesa | cozinha | /cozinha/bebedouro-de-mesa/ |
| 88 | melhores-geladeiras-hq | cozinha | /cozinha/geladeiras-hq/ |
| 89 | melhor-escova-secadora-gama | cozinha | /cuidados-pessoais/escova-secadora-gama/ |
| 90 | melhor-cooler-com-rodinha | cozinha | /cozinha/utensilios/cooler-com-rodinha/ |
| 91 | melhor-maquina-tosar-cachorro | cozinha | /cuidados-pessoais/maquina-de-tosar-cachorro/ |
| 92 | melhor-frigobar-hq | cozinha | /cozinha/frigobar-hq/ |
| 93 | melhor-cafeteira-nespresso | cozinha | /cozinha/cafeteira-nespresso/ |
| 94 | melhor-modelador-de-cachos | all | /cuidados-pessoais/modelador-de-cachos/ |
| 95 | melhor-jogo-de-xicaras | cozinha | /cozinha/utensilios/jogo-de-xicaras/ |
| 96 | melhor-tesoura-de-poda | ferramentas | /ferramentas/tesoura-de-poda/ |
| 97 | melhor-organizador-de-parafusos | ferramentas | /ferramentas/organizador-de-parafusos/ |
| 98 | melhor-geladeira-panasonic | cozinha | /cozinha/geladeira-panasonic/ |
| 99 | melhor-cadeirinha-descanso-bebe | all | /cuidados-pessoais/cadeirinha-de-descanso-para-bebe/ |
| 100 | melhor-panela-pressao-eletrica-midea | cozinha | /cozinha/panela-de-pressao-eletrica-midea/ |
| 101 | melhor-air-fryer-polishop | cozinha | /cozinha/air-fryer-polishop/ |
| 102 | melhor-trena-digital | ferramentas | /ferramentas/trena-digital/ |
| 103 | melhor-motosserra | ferramentas | /ferramentas/motosserra/ |
| 104 | melhor-garrafao-termico | cozinha | /cozinha/utensilios/garrafao-termico/ |
| 105 | melhor-aparelho-de-jantar | cozinha | /cozinha/utensilios/aparelhos-de-jantar/ |
| 106 | melhor-cooktop-inducao-eos | cozinha | /cozinha/cooktop-de-inducao-eos/ |
| 107 | melhor-chave-impacto-bateria | ferramentas | /ferramentas/chave-de-impacto-a-bateria/ |
| 108 | melhor-andador-infantil | all | /infantil/andador-infantil/ |
| 109 | melhor-aspirador-robo | limpeza | /limpeza/melhor-aspirador-robo/ |
| 110 | melhor-ar-condicionado-9000-btus | climatizacao | /climatizacao/melhor-ar-condicionado-9000-btus/ |
| 111 | melhor-casinha-de-cachorro | all | /cuidados-pessoais/casinha-de-cachorro/ |
| 112 | melhor-air-fryer-ninja | cozinha | /cozinha/air-fryer-ninja/ |
| 113 | melhor-paquimetro-digital | ferramentas | /ferramentas/paquimetro-digital/ |
| 114 | melhor-lixeira-com-rodas | limpeza | /limpeza/lixeira-com-rodas/ |
| 115 | melhor-irrigador-oral | all | /cuidados-pessoais/irrigador-oral/ |
| 116 | melhor-lixeira-grande-tampa | limpeza | /limpeza/lixeira-grande-com-tampa/ |
| 117 | melhor-panela-eletrica-electrolux | cozinha | /cozinha/panela-eletrica-electrolux/ |
| 118 | melhor-frigideira-tramontina | cozinha | /cozinha/frigideira-tramontina/ |
| 119 | melhor-ventilador-30cm | climatizacao | /climatizacao/ventilador-30cm/ |
| 120 | melhor-cafeteira-arno | cozinha | /cozinha/cafeteira-arno/ |
| 121 | melhor-air-fryer-arno | cozinha | /cozinha/air-fryer-arno/ |
| 122 | melhor-depilador-a-laser | all | /cuidados-pessoais/depilador-a-laser/ |
| 123 | melhor-caixa-termica | cozinha | /cozinha/utensilios/melhor-caixa-termica/ |
| 124 | melhor-mini-secador-cabelo | all | /cuidados-pessoais/mini-secador-de-cabelo/ |
| 125 | melhor-espelho-para-banheiro | all | /banheiro/espelho-para-banheiro/ |
| 126 | melhor-lanterna-profissional | ferramentas | /ferramentas/lanterna-profissional/ |
| 127 | melhor-lixeira-automatica | limpeza | /limpeza/lixeira-automatica/ |
| 128 | melhor-gabinete-para-banheiro | all | /banheiro/gabinete-para-banheiro/ |
| 129 | melhor-sanduicheira-mondial | cozinha | /cozinha/sanduicheira-mondial/ |
| 130 | melhores-cafeteiras | cozinha | /cozinha/melhores-cafeteiras/ |
| 131 | melhor-churrasqueira-apartamento | cozinha | /cozinha/churrasqueira-para-apartamento/ |
| 132 | melhor-cooktop | cozinha | /cozinha/melhor-cooktop/ |
| 133 | melhor-grill-eletrico | cozinha | /cozinha/grill-eletrico/ |

### Integração

- **`components/CardsTable.tsx`** — adicionados 50 `import` e 50 entradas em
  `categoryData` (apenas linhas novas; nenhuma refatoração da lógica existente).
- **`api/indexnow.http`** — 50 URLs novas em `urlList`.
- **`public/sitemap.xml`** — 50 blocos `<url>` novos.
- **`docs/postagens.md`** — regenerado; as 50 linhas correspondentes agora estão
  marcadas `[x]`. Resumo atual: **114 `[x]` / 449 `[ ]` / 563 no total** (o
  descasamento de 1 em relação a 115 arquivos é o par `umidificador` que
  compartilha `ref`, ver "Pendências conhecidas").
- **Imagens** (`/images/covers/<slug>-cover.webp` e
  `/images/posts/<slug>-N.jpg`) **não foram criadas** — são apenas referências,
  como combinado.

### Validação

| Verificação | Resultado |
|---|---|
| `bunx next build` | ✅ compila, 123 páginas estáticas (115 posts + 8 rotas), todos os 50 slugs novos gerados via SSG |
| `bun run check-mdx` | ✅ 115 arquivos, todas as validações de front-matter passaram |
| `bun run check-sitemap` | ✅ 115 slugs, todos presentes no sitemap |
| Biome (`data/*.json`, `CardsTable.tsx`) | ✅ sem erros novos — os 6 erros/2 avisos remanescentes em `CardsTable.tsx` (`noArrayIndexKey`, `noImgElement`, `organizeImports`, `noUnusedFunctionParameters`) já existiam antes desta alteração |

> Observação: **não foi rodado `bun run build` completo** de propósito, porque o
> passo `update-dates` reescreveria o campo `date:` dos 115 posts e tiraria os
> novos da data de hoje. Usei `next build` direto + os scripts de validação
> individualmente. Ao rodar o build/deploy normal, `update-dates` vai
> reprogramar as datas de todos os posts no padrão Seg/Qua/Sex.

### Fase 1 (scraping) — erros

Nenhum. `robots.txt`, `sitemap_index.xml` e os 3 `post-sitemap[1-3].xml` do
Eletrosinter responderam OK; usei delay de ~2 s entre requisições. As 50 páginas
de produto foram lidas sem timeout nem 404.

### Pendências conhecidas / decisões tomadas

1. **Produtos abaixo de 7**: `melhor-panela-pressao-eletrica-midea` e
   `melhor-air-fryer-polishop` têm **6 produtos** cada — o Eletrosinter só lista 6
   nessas páginas. Os demais 48 posts têm 7.
2. **Categoria `all`**: produtos fora da taxonomia aceita por `check-mdx.ts`
   (`all | ferramentas | limpeza | climatizacao | moveis | lavanderia | cozinha`)
   — itens de `cuidados-pessoais`, `infantil` e `banheiro` — receberam
   `category: "all"` (valor válido) ou o bucket concreto mais próximo. Ex.:
   `melhor-escova-secadora-gama` e `melhor-maquina-tosar-cachorro` ficaram em
   `cozinha` (decisão dos primeiros lotes); os demais itens de cuidados
   pessoais/infantil/banheiro ficaram em `all`. Vale padronizar depois.
3. **Arquivos de componente apagados fora desta tarefa**: durante a sessão,
   `components/copy-button.tsx`, `Newsletter.tsx`, `PromptComponent.tsx`,
   `ad-banner-horizontal.tsx`, `ad-banner-square.tsx` e `responsive-ad-banner.tsx`
   apareceram como **deletados** na working tree (não por esta tarefa).
   `copy-button.tsx` foi **restaurado** (`git checkout`) porque `app/[slug]/page.tsx`
   ainda o importa e sem ele o build quebra. Os outros 5 continuam deletados e
   **não têm mais nenhuma referência no código** — provável remoção intencional;
   confira se quer recuperá-los ou concluir a remoção.
4. **`blogPostId`**: segui a numeração sequencial a partir de 84 (maior valor
   existente era 82; 83 é o `melhor-amolador-de-facas`). Note que vários posts
   antigos repetem `blogPostId`, então o campo hoje não é realmente único.
5. **`public/sitemap.xml`** é regenerado por `scripts/create-sitemap.ts` no build;
   a edição manual feita aqui será sobrescrita (com o mesmo conteúdo) no próximo
   build.
