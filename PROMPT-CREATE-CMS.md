# Contexto

Sou desenvolvedor full stack e criei esse blog/site-review para ganhar dinheiro com links de afiliados

# Tarefas

## Principal: Transformar esse código em um CMS completo de Blog usando SvelteKit (https://svelte.dev/docs/kit/introduction) + MDX (postagem escritas em markdown)

- USE: https://svelte.dev/docs/ai/overview

## Skills

Instale localmente e use essas skills:
    - https://github.com/Graphify-Labs/graphify
    - https://github.com/addyosmani/agent-skills
    - https://github.com/multica-ai/andrej-karpathy-skills
    - https://github.com/dietrichgebert/ponytail

Deixe explicito no claude/agents.md para carregar essas skills em todo inicio de sessão;

## Boas práticas

- Use sember, keepachangelog, conventional commits e .editorconfig tab com 4 espaço na identação do código
- Crie e atualize skills e .agents/rules/ para futuras sessões/agentes de trabalho usarem
- Faça testes (unitarios, integração, smoke testes e e2e) para garantir qualidade -> use playwright e agent-browser quando necessário

## Features principais

- Crie todo o código do ci/cd do github actions -> MAS NÃO ATIVE ELE (preciso corrigir billing no github depois)
- As releases devem subir com o changelog após cada commit/push feito junto
- Manter design atual do site
    - Só melhore o footer para ficar mais profissional
- Ter um dashboard no caminho /admin:
    - Se usuário admin não logado, redirecionar para /admin/login -> caminhos admin não indexam no google/robots.txt/llms
    - Admin logado, ter um dashboard completo de CMS para criar novas postagens facilmente pela web, sem precisar mecher no código diretamente
    - Ter API REST também para ver dados do blog também

## Contexto
- Esse projeto vai ser hospeado na vercel.com ou netlify, use as ferramentas integradas deles se necessário

## Antes de começar

- GIT: comece do zero um git novo com o remote para: git remote add origin git@github.com:AlexGalhardo/sveltekit-blog-cms-claude-code.git

- Use a skill interview-me/grilling para tirar qualquer dúvida de implementação que você dizer, implementação de features, sugestões, etc
- Crie o arquivo principal desse projeto chamado PLAN.md na raiz, que vai ficar todo o planejamento de desenvolvimento desse projeto
    - Crie grupos de tarefas com checklists [x] e asserts de entrega/qualidade
    - Separe em 3 grandes fases: ALPHA, BETA, 1.0.0rc

Crie a feature de newsletter também para os usuários cadastrados sempre receberem um email quando uma nova postagem for postada de forma oficial pelo admin no dashboard
    - use resend e react-email
    - provavelmente vamos precisar de banco de dados agora -> use postgresql com neon da vercel mesmo
