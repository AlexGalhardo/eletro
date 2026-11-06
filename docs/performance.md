# Desempenho e acessibilidade

## O que o projeto faz

| Assunto | Como |
|---|---|
| Páginas | Pré-renderizadas no build; o HTML já chega com o conteúdo e o JSON-LD |
| Capas | O build grava cópias WebP de cada capa em 480, 768 e 1280 px (`scripts/cover-variants.ts`, plugin do Vite). As páginas usam `srcset` e `sizes`, e o navegador baixa a menor que serve |
| Carregamento tardio | As duas primeiras capas da home e a capa do post carregam com prioridade; as demais e as fotos de produto usam `loading="lazy"` |
| Fontes | Locais, pelo `@fontsource`, sem requisição a terceiros |
| Cache | Os arquivos de `/_astro/` levam hash no nome. `/images/` não tem cabeçalho próprio no GitHub Pages |
| Contraste | Textos e botões no tema claro atendem ao nível AA (4,5:1) |
| Teclado | Toda parada do Tab é visível e tem nome (`tests/e2e/site.spec.ts`) |

### Capas redimensionadas

- As cópias ficam em `static/images/covers/w480/`, `w768/` e `w1280/`. São saída de build: as pastas estão no `.gitignore` e não devem ser commitadas.
- O autor envia a capa no tamanho que tiver. Uma capa de 1,6 MB vira cerca de 22 KB na cópia de 480 px.
- Uma capa menor que a largura pedida não ganha cópia ampliada, e uma capa externa (`https://`) não ganha cópia nenhuma: o `srcset` lista só o que existe.
- Em desenvolvimento não há cópias; a página usa a capa original.
- O build fica alguns segundos mais lento na primeira vez. Nas seguintes, só as capas novas ou alteradas são processadas.
- `sharp` roda no build (cópias das capas) e no servidor, só na importação de posts, para montar a capa gerada (ver [webscrapping-modelation.md](webscrapping-modelation.md)).

## Lighthouse (celular), 2026-10-06

Medido com o Lighthouse 13.5.0 no build de produção servido por `vite preview`, em `/` e em `/melhor-airfryer-8-litros`. Mediana de três execuções, com o antivírus da máquina desligado.

| Página | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Home, antes | 70 | 96 | 77 | 100 |
| Home, depois | 91 | 100 | 77 | 100 |
| Post, antes | 69 | 96 | 77 | 100 |
| Post, depois | 89 | 100 | 77 | 100 |

LCP da home: de 8,4 s para 2,7 s. As três execuções deram 90, 91 e 91 na home e 89, 89 e 88 no post.

A meta de 90 está atendida em acessibilidade, SEO e no desempenho da home. **Não está atendida em boas práticas (77) nem no desempenho do post (89).**

### Boas práticas: 77

As duas reprovações têm a mesma origem, o Microsoft Clarity:

- "Uses third-party cookies": 8 cookies de `clarity.ms` e `bing.com`.
- "Issues logged in the Issues panel": avisos do Chrome sobre esses mesmos cookies.

O Clarity é carregado para todo visitante, antes de qualquer escolha: o banner de cookies só informa. Para fechar a meta, as opções são carregar o Clarity só depois do aceite no banner, ou tirá-lo. As duas mudam o que o dono mede, então são decisão dele. O Google Analytics não entra nessa reprovação.

### Desempenho do post: 89

- A folha de estilos, de 12 KB, é uma requisição que bloqueia a renderização (cerca de 0,7 s na simulação).
- O script do Google Analytics tem 177 KB, mais da metade do que a página baixa do próprio site.
- As fotos dos produtos não declaram largura e altura.
- `vite preview` não comprime as respostas nem envia cabeçalhos de cache; Vercel e Netlify fazem as duas coisas. O número em produção tende a ser melhor, mas só a medição do site publicado confirma.

### Sobre a primeira medição

A medição anterior, com o antivírus (Kaspersky) ligado, deu 87 e 84 de desempenho. Ele injeta um script em toda página e bloqueava o Clarity, o que escondia a reprovação real de boas práticas atrás de duas outras (uma requisição `http://` e um erro no console). Com ele desligado, boas práticas continuou em 77, pelos motivos acima.

## Como medir

```bash
bun run build
bun run preview --host 127.0.0.1 --port 4173
bunx lighthouse@13.5.0 http://127.0.0.1:4173/ --chrome-flags="--headless=new" --view
```

Depois do deploy, meça a URL pública no [PageSpeed Insights](https://pagespeed.web.dev/): é o número que vale.
