# CMS no GitHub Pages

O painel publicado em `/admin` é um app estático em Astro e TypeScript. Ele usa a [API de conteúdo do GitHub](https://docs.github.com/en/rest/repos/contents) no navegador. Não há sessão, banco ou senha em JSON público. Um JSON com email e senha no Pages exporia os dados e não protegeria o repositório.

## Entrada e gravação

1. Crie um token pessoal fine-grained limitado ao repositório configurado em `src/lib/site.config.ts`, com `Contents: Read and write` e `Pull requests: Read and write`.
2. Digite o token no único campo de `/admin` e clique em **Login**. A tela verifica a conta e o acesso ao repositório. O token fica apenas na memória da aba; recarregar ou sair exige nova entrada. A tela de entrada não exibe detalhes da credencial nem do repositório.
3. Escolha Posts, Produtos ou Configuração JSON. Abra um arquivo, edite e salve. O painel usa o SHA para recusar sobrescritas conflitantes.
4. Para imagens, envie PNG, JPEG ou WebP de até 4 MB para `static/images/covers/` ou `static/images/posts/`.
5. No primeiro salvamento, o painel cria uma branch `cms/*` e abre um PR. Salvamentos seguintes na mesma aba entram no mesmo PR. Revise o PR e espere os checks verdes antes do merge. A publicação no Pages começa depois do merge.

Para entrar só com senha, configure os segredos `ADMIN_GITHUB_TOKEN` e `ADMIN_PASSWORD` no repositório do GitHub. A senha precisa ter ao menos 20 caracteres. O workflow do Pages usa os dois no build para gerar `admin-credential.json` criptografado com PBKDF2 e AES-GCM. O token e a senha não entram no HTML, JavaScript ou repositório. A senha desbloqueia o token apenas na memória da aba. Use um token de acesso limitado ao repositório e revogue-o se a senha for exposta. Como o arquivo criptografado é público, uma senha fraca pode ser testada offline. Sem os dois segredos configurados, o campo ainda aceita o token diretamente.

O editor de MDX e JSON é textual. O JSON recebe validação de sintaxe antes do envio; o build do PR valida o formato completo, referências e imagens. A API de diretórios do GitHub limita a listagem a 1.000 itens por pasta. Um arquivo enviado por engano pode ser corrigido na branch antes do merge.

## Código de servidor preservado

`src/lib/server/cms.ts`, o `ContentStore`, a API `/api/v1`, better-auth, newsletter e integrações continuam no repositório e nos testes. Essas rotas não executam no GitHub Pages. Os formulários antigos em `src/routes/admin/` são código preservado para uma hospedagem com servidor; o build estático serve `src/pages/admin/`.
