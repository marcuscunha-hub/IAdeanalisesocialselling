# Social Selling AI

## O que é este projeto

Ferramenta interna para análise de performance de Social Sellers via IA.

**Contexto do negócio:** Vendedores operam perfis de sócios da empresa no Instagram (contas Business) para abordar seguidores, qualificar leads e agendar reuniões. A IA analisa as conversas e gera um relatório de performance por vendedor.

## O processo comercial (4 etapas)

A IA avalia se o vendedor seguiu cada etapa:

1. **Abordagem** — mensagem inicial personalizada, tom natural, não comercial
2. **Qualificação** — perguntas abertas, identificar perfil/dor, confirmar decisor
3. **Agendamento** — oferecer reunião só após qualificação, com proposta de valor clara
4. **Follow-up** — 3 níveis (3 dias / 7 dias / 14 dias sem resposta)

> O processo detalhado fica em `lib/claude.ts` na constante `SALES_PROCESS`. Será atualizado quando o processo real for fornecido.

## Arquitetura

```
app/
├── page.tsx                    # Landing page
├── dashboard/page.tsx          # Dashboard de relatórios (client component)
└── api/
    └── analyze/route.ts        # POST /api/analyze → busca DMs + analisa com Claude

lib/
├── meta.ts                     # Integração Meta Graph API (leitura de DMs)
└── claude.ts                   # Análise por IA (Claude Sonnet) + SALES_PROCESS
```

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Claude API** (claude-sonnet-4-6) — análise das conversas
- **Meta Graph API v19** — leitura de DMs das contas Business
- **Deploy:** Vercel

## Variáveis de ambiente

```
META_ACCESS_TOKEN     # System User Token da Meta (permissão instagram_manage_messages)
META_IG_ACCOUNT_ID    # ID numérico da conta Instagram Business
ANTHROPIC_API_KEY     # API Key da Anthropic (console.anthropic.com)
```

## Comandos

```bash
npm install           # instalar dependências
npm run dev           # rodar localmente em http://localhost:3000
npm run build         # build de produção
vercel --prod         # deploy
```

## Próximos passos

- [ ] Substituir `SALES_PROCESS` placeholder em `lib/claude.ts` pelo processo real
- [ ] Configurar Meta App com permissão `instagram_manage_messages`
- [ ] Adicionar seleção de qual conta do sócio analisar (múltiplas contas)
- [ ] Salvar histórico de relatórios no banco (Vercel Postgres)
- [ ] Autenticação básica para proteger o painel

## v2 (futuro)

- Sugestões de resposta em tempo real com base no processo
- Comparativo entre vendedores
- Alertas automáticos quando lead fica sem follow-up
