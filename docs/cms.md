# CMS no GitHub Pages

O painel publicado em `/admin` é um app estático em Astro e TypeScript. Ele usa a [API de conteúdo do GitHub](https://docs.github.com/en/rest/repos/contents) no navegador. Não há sessão, banco ou senha em JSON público. Um JSON com email e senha no Pages exporia os dados e não protegeria o repositório.

## Entrada e gravação

1. Crie um token pessoal fine-grained limitado ao repositório configurado em `src/lib/site.config.ts`, com `Contents: Read and write` e `Pull requests: Read and write`.
2. Abra qualquer rota de `/admin`: sem sessão, o navegador vai para `/admin/login?next=<rota>`. Digite o token (campo `Password`) e clique em **Login**. A tela verifica a conta e o acesso ao repositório e volta para a rota pedida (só caminhos que começam com `/admin/` são aceitos em `next`; qualquer outro valor vai para `/admin`). A tela de entrada não exibe detalhes da credencial nem do repositório. Cada rota é uma página estática, então o token desbloqueado fica em `sessionStorage` (`admin-session`, `src/lib/admin/session.ts`): vale só para a aba, some ao fechá-la e expira em 8 horas. Um script inline no `<head>` de `Admin.astro` confere a sessão antes de pintar a página e redireciona para o login; ele é só UX, porque a proteção real é o token e nenhuma página do admin carrega segredo. **Sair** (rodapé da sidebar) apaga a sessão e volta para `/admin/login`.
3. Escolha Posts, Produtos ou Configuração JSON. Abra um arquivo, edite e salve. O painel usa o SHA para recusar sobrescritas conflitantes.
4. Para imagens, envie PNG, JPEG ou WebP de até 4 MB para `static/images/covers/` ou `static/images/posts/`.
5. No primeiro salvamento, o painel cria uma branch `cms/*` e abre um PR. Salvamentos seguintes na mesma aba entram no mesmo PR. Revise o PR e espere os checks verdes antes do merge. A publicação no Pages começa depois do merge.

Para entrar só com senha, configure os segredos `ADMIN_GITHUB_TOKEN` e `ADMIN_PASSWORD` no repositório do GitHub. A senha precisa ter ao menos 20 caracteres. O workflow do Pages usa os dois no build para gerar `admin-credential.json` criptografado com PBKDF2 e AES-GCM. O token e a senha não entram no HTML, JavaScript ou repositório. A senha desbloqueia o token, que fica na sessão da aba (`sessionStorage`). Use um token de acesso limitado ao repositório e revogue-o se a senha for exposta. Como o arquivo criptografado é público, uma senha fraca pode ser testada offline. Sem os dois segredos configurados, o campo ainda aceita o token diretamente.

O editor de MDX e JSON continua textual. Num post, slug, data, título, descrição, categoria, autor, rascunho e capa ficam em campos e são gravados no frontmatter. A capa, as imagens citadas no texto e o arquivo escolhido para upload aparecem em prévia. Uma imagem de `static/images/covers/` pode ser usada como capa. O botão **Vincular lista** insere `<CardsTable>` e o painel mostra as listas do post e os posts que usam cada JSON. O tema claro ou escuro também vale no painel. O JSON recebe validação de sintaxe antes do envio; o build do PR valida o formato completo, referências e imagens. A API de diretórios do GitHub limita a listagem a 1.000 itens por pasta. Um arquivo enviado por engano pode ser corrigido na branch antes do merge.

## Código de servidor preservado

`src/lib/server/cms.ts`, o `ContentStore`, a API `/api/v1`, better-auth, newsletter e integrações continuam no repositório e nos testes. Essas rotas não executam no GitHub Pages. Os formulários antigos em `src/routes/admin/` são código preservado para uma hospedagem com servidor; o build estático serve `src/pages/admin/`.
