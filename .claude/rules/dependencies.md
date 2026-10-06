# Dependências

- Toda dependência usa a **última versão estável** publicada, com **versão exata** no `package.json`. Nada de `^`, `~`, `latest`, `beta`, `rc`, `canary` ou `next`.
- Descubra a versão no registry antes de instalar: `npm view <pacote> version`. Não confie na memória.
- Instale com `bun add --exact <pacote>@<versão>` (o `bunfig.toml` já força `exact`).
- Exceção: quando a última versão de um pacote não é aceita pelos `peerDependencies` de outro, use a mais nova que é aceita e registre o motivo na tabela abaixo.
- Antes de adicionar um pacote, suba a escada do `ponytail`: já existe no projeto, a biblioteca padrão resolve, a plataforma resolve, algumas linhas resolvem? Só então instale.

## Versões seguradas de propósito

| Pacote | Versão | Última | Motivo |
|---|---|---|---|
| `typescript` | 6.0.3 | 7.x | `@sveltejs/kit` 3, `svelte-check` 4 exigem TypeScript 6 |
| `@types/node` | 24.x | 26.x | Acompanha a versão do Node usada no projeto (24 LTS) |
