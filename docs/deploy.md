# Deploy no GitHub Pages

O [workflow `pages.yml`](../.github/workflows/pages.yml) compila `dist/` e publica o site depois de um merge na `main`. No repositório, configure Pages → Build and deployment → Source: GitHub Actions. O domínio próprio é configurado em Settings → Pages, não por arquivo; o build cria só `.nojekyll`. Defina a variável de repositório `SITE_URL` (por exemplo `https://seu-dominio`): o `pages.yml` a passa ao build, e dela saem o `site` do Astro, os canonicais e o sitemap.

Para o domínio apex, use os quatro registros A do [GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site): `185.199.108.153`, `185.199.109.153`, `185.199.110.153` e `185.199.111.153`. Aponte `www` para o domínio `github.io` da conta e confira o certificado HTTPS no Pages.

## Painel editorial

`/admin` é estático e funciona no Pages. O dono cria um token fine-grained do GitHub limitado a `AlexGalhardo/eletro`, com `Contents: Read and write` e `Pull requests: Read and write`, e o insere na tela. O token não é enviado ao site nem salvo no navegador; as requisições saem diretamente para `api.github.com`. Cada aba cria uma branch `cms/*`, faz commits e abre um PR. O Pages publica o conteúdo depois do merge.

O editor lista e grava `content/posts/*.mdx`, `content/products/*.json`, `content/flags.json` e imagens em `static/images/covers` ou `static/images/posts`. JSON recebe conferência sintática no navegador; o CI do PR faz a validação completa do conteúdo. Um arquivo com SHA desatualizado é recusado. O editor de texto não substitui os formulários do antigo servidor: revise MDX e JSON no PR.

O GitHub Pages não executa as rotas server side de `/api/v1`, OAuth, newsletter, importação, Google Analytics no painel ou cron. O formulário de contato foi trocado por um link `mailto:` e a inscrição da newsletter foi retirada do rodapé. Esse código de servidor permanece no repositório para testes e uso futuro em outro host.

## Conferência depois do merge

1. Aguarde o workflow Pages ficar verde.
2. Abra a home, um post e `/admin`; confira no HTML de `/admin` a metatag `noindex`.
3. Confira uma capa redimensionada em `/images/covers/w480/` e o certificado HTTPS.
4. Se o workflow falhar, corrija o PR ou abra outro; o site anterior continua no ar.
