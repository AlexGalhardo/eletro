# Feature flags

Flags são chaves que ligam ou desligam um comportamento sem código novo. O site é estático (GitHub Pages) e não tem servidor que decida por visitante. Por isso há dois tipos de flag.

## Onde ficam

| Tipo | Onde | Quem decide | Efeito |
|---|---|---|---|
| Do projeto | `content/flags.json`, versionado | Quem faz o commit; vale no build seguinte | Muda o que o build gera |
| De navegador | `localStorage`, chave `flags` | Cada visitante, em `/admin/flags` | Muda o que aquele navegador mostra |

O código fica em `src/lib/flags.ts`: `flagDefaults` guarda os valores padrão, `browserFlag(name)` lê uma flag de navegador e `setBrowserFlag(name, value)` grava o override.

## Flags atuais

| Flag | Tipo | Valor no repositório | Efeito |
|---|---|---|---|
| `previewDrafts` | Do projeto | `true` | O build gera `/preview/<slug>` para rascunhos e posts agendados |
| `allStoreButtons` | De navegador | `false` | Os cartões mostram os três botões (Mercado Livre, Shopee e Amazon) mesmo com link `"#"`. O botão sem link real aponta para a oferta padrão |

## Como ligar

- **No navegador:** abra `/admin/flags` e marque a flag. Vale só naquele navegador.
- **No projeto:** edite `content/flags.json`, commite e espere o deploy. Para tirar a prévia do ar, use `previewDrafts: false`.

`/admin/flags` também lista todos os posts, com rascunhos primeiro. Cada item leva a `/<slug>` ou a `/preview/<slug>`, com draft, produtos, links e pendentes. Tem busca e filtro.

## Como acrescentar uma flag

1. Acrescente a chave em `content/flags.json`.
2. Acrescente o padrão em `flagDefaults` (`src/lib/flags.ts`).
3. Se for de navegador, acrescente o nome em `BROWSER_FLAGS` e leia a flag com `browserFlag(name)`.
4. Documente a flag na tabela desta página.
5. Cubra a leitura e a gravação em `src/lib/flags.test.ts`.

## Segurança

- O GitHub Pages não tem login. Flag de navegador não é controle de acesso: qualquer pessoa que abra o site pode ligá-la.
- `/preview/<slug>` e `/admin/flags` são públicos, com `noindex`, `Disallow` no `robots.txt` e fora do sitemap. Não mostram nada que já não esteja no repositório público: os rascunhos já são públicos lá.
- Não guarde segredo em flag. Ela vai para o HTML e para o `localStorage`.

Detalhes do que o GitHub Pages publica: [deploy.md](deploy.md#prévia-e-páginas-de-revisão). Modelo de ameaças: [security.md](security.md).

## Limites

- A flag de navegador some quando o visitante limpa o `localStorage` ou usa outro navegador.
- Flag não substitui o painel `/admin`, que exige login e sessão de admin.
