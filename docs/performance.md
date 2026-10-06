# Desempenho e acessibilidade

## O que o projeto faz

| Assunto | Como |
|---|---|
| Páginas | Pré-renderizadas no build; o HTML já chega com o conteúdo e o JSON-LD |
| Capas | O build grava cópias WebP de cada capa em 480, 768 e 1280 px (`scripts/cover-variants.ts`, plugin do Vite). As páginas usam `srcset` e `sizes`, e o navegador baixa a menor que serve |
| Carregamento tardio | As duas primeiras capas da home e a capa do post carregam com prioridade; as demais e as fotos de produto usam `loading="lazy"` |
| Fontes | Locais, pelo `@fontsource`, sem requisição a terceiros |
| Cache | `/_app/immutable/` é cacheado pela plataforma; `/images/` por uma semana (`vercel.json` e `static/_headers`) |
| Contraste | Textos e botões no tema claro atendem ao nível AA (4,5:1) |
| Teclado | Toda parada do Tab é visível e tem nome (`tests/e2e/site.spec.ts`) |

### Capas redimensionadas

- As cópias ficam em `static/images/covers/w480/`, `w768/` e `w1280/`. São saída de build: as pastas estão no `.gitignore` e não devem ser commitadas.
- O autor envia a capa no tamanho que tiver. Uma capa de 1,6 MB vira cerca de 22 KB na cópia de 480 px.
- Uma capa menor que a largura pedida não ganha cópia ampliada, e uma capa externa (`https://`) não ganha cópia nenhuma: o `srcset` lista só o que existe.
- Em desenvolvimento não há cópias; a página usa a capa original.
- O build fica alguns segundos mais lento na primeira vez. Nas seguintes, só as capas novas ou alteradas são processadas.
- `sharp` é dependência de desenvolvimento: roda no build, nunca no servidor.

## Lighthouse (celular), 2026-10-06

Medido com o Lighthouse 13.5.0 no build de produção servido por `vite preview`, em `/` e em `/melhor-airfryer-8-litros`. Mediana de três execuções.

| Página | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Home, antes | 70 | 96 | 77 | 100 |
| Home, depois | 87 | 100 | 77 | 100 |
| Post, antes | 69 | 96 | 77 | 100 |
| Post, depois | 84 | 100 | 77 | 100 |

LCP da home: de 8,4 s para 3,3 s. Peso da home: de 1.760 KB para cerca de 560 KB.

**A meta de 90 em desempenho e boas práticas não foi confirmada.** A medição local tem três distorções que não existem em produção, e não há deploy desta versão para medir de fora:

- O antivírus da máquina (Kaspersky) injeta um script em toda página aberta no navegador e bloqueia o script do Clarity. As duas reprovações de boas práticas vêm daí (uma requisição `http://` do antivírus e um erro no console), não do site.
- `vite preview` não comprime as respostas nem envia cabeçalhos de cache; Vercel e Netlify fazem as duas coisas. O HTML da home tem 78 KB sem compressão.
- O desempenho variou de 79 a 87 entre execuções iguais.

O que ainda pesa de verdade no primeiro paint (FCP de 2,8 s na simulação): a folha de estilos, de 12 KB, é uma requisição que bloqueia a renderização, e o script do Google Analytics tem 177 KB.

## Como medir

```bash
bun run build
bun run preview --host 127.0.0.1 --port 4173
bunx lighthouse@13.5.0 http://127.0.0.1:4173/ --chrome-flags="--headless=new" --view
```

Depois do deploy, meça a URL pública no [PageSpeed Insights](https://pagespeed.web.dev/): é o número que vale.
