import { GoogleGenAI } from "@google/genai";
import type { MetaConversation } from "./meta";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SALES_PROCESS = `
## Processo de Social Selling — Full Sales System

### Princípios fundamentais (avaliar em toda a conversa)
- **Venda invisível**: nunca demonstrar intenção de vender na abordagem inicial; conduzir o lead naturalmente
- **Mensagens curtas**: mensagens longas passam apego e repelem; quanto mais curta e direta, melhor
- **Desapego**: não responder de forma imediata nem parecer ansioso pelo agendamento
- **Interesse genuíno**: mostrar interesse real no lead antes de qualquer pitch
- **Personalização**: usar informações do perfil ou fala do lead; a conversa deve *parecer* personalizada
- **Sempre terminar com pergunta ou sugestão**: manter o "bate-bola" e conduzir ao próximo passo
- **Tripé do relacionamento**: ponto em comum + apreciação sincera + interesse genuíno
- **Vender o agendamento, não o produto**: objetivo é marcar a reunião, nunca apresentar o produto no direct

---

### Etapa 1 — Abordagem inicial
Prioridade de abordagem: leads de levantada de mão > leads de iscas/marketing > curtidas/comentários > novos seguidores > quem viu Stories > base antiga.

**Padrão esperado:**
- Chamar pelo nome
- Referenciar algo específico do perfil (cidade, conteúdo, conquista) — demonstra que não é mensagem genérica
- Tom leve, descontraído, não comercial
- Terminar com pergunta aberta sobre a operação/negócio do lead

**Exemplos corretos:**
- "Opaa [Nome], tudo bem aí? Vi que você começou a me seguir e espero que o conteúdo agregue. Elogio do perfil. E por aí, como está a operação?"
- "Fala @, achei muito bacana seu comentário sobre [tema]. Como tem sido a operação aí?"

**Erros a identificar:**
- Mensagem genérica sem personalização
- Mencionar produto, serviço ou reunião na primeira mensagem
- Mensagem longa ou com muitas informações de uma vez

---

### Etapa 2 — Rapport
Antes de avançar, buscar pontos de conexão com o lead.

**Padrão esperado:**
- Comentar algo visto no perfil (cidade, nicho, conteúdo, conquista)
- Demonstrar apreciação sincera — não forçada
- Criar familiaridade antes de fazer perguntas de qualificação

---

### Etapa 3 — Qualificação
Identificar se o lead tem perfil para ser ajudado e capacidade de investimento.

**Padrão esperado:**
- Perguntas abertas (O que, Quais, Como, Onde, O que levou a isso)
- Entender: faturamento atual, meta, tamanho do time, principal desafio
- Confirmar se o lead é decisor
- Aprofundar nas dores em camadas — não aceitar respostas superficiais

**Exemplos corretos:**
- "Ah legal, uma área que vejo crescendo muito. Como tá por aí — quanto faturam por ano e qual é a meta?"
- "Me fala: hoje como está seu faturamento médio no mês? Você tem time?"
- "O que vocês estão planejando para esse ano?"

**Erros a identificar:**
- Avançar para o pitch sem qualificar
- Perguntas fechadas (sim/não)
- Não identificar se o lead é o decisor

---

### Etapa 4 — Identificação de necessidades
Entender o estágio atual e preparar o pitch personalizado.

**Padrão esperado:**
- "Dentro desse objetivo que você comentou, o que você acredita que precisa ser feito para alcançá-lo?"
- "O que te impediria de atingir esse objetivo? Há algum desafio nesse meio?"
- Opcional: "O quanto mudar isso é importante para você?"

---

### Etapa 5 — Pitch de agendamento
Somente após qualificação positiva. Objetivo: vender a reunião, não o produto.

**Padrão esperado:**
- Conectar o convite às dores identificadas
- Propor horários específicos (ex: "hoje às 17h ou amanhã às 14h?")
- Não explicar o produto — apenas posicionar a reunião como solução para as dores mapeadas
- Mensagem curta e direta

**Erros a identificar:**
- Pitch antes de qualificar
- Explicar o produto no direct
- Não propor horários concretos
- Mensagem de pitch longa

---

### Etapa 6 — Follow-up
- **FUP 1**: Lead não respondeu no início → mensagem curtíssima ("👀" ou "Oi, [Nome]?") → se não responder, descartar
- **FUP 2**: Demonstrou interesse mas parou no meio → retomada leve
- **FUP 3**: Chegou ao final mas não agendou → saudação + desculpar a pessoa + propor 2-3 horários concretos
- **FUP 4**: Agendou mas não compareceu → propor reagendamento
- **FUP 5**: Assistiu mas não comprou → nova tentativa dentro do mês
- **FUP 6**: Longo relacionamento → abordar quando o lead interage novamente

**Erros a identificar:**
- Follow-up longo ou com pitch completo
- Não propor horários concretos no FUP 3
- Desistir antes de completar a cadência
- Tom insistente ou desesperado
`;

export async function analyzeConversations(
  conversations: MetaConversation[],
  sellerName: string
): Promise<object> {
  const formatted = conversations
    .slice(0, 20)
    .map((conv, i) => {
      const msgs = conv.messages
        .map((m) => `[${m.from.username ?? m.from.id}]: ${m.message}`)
        .join("\n");
      return `--- Conversa ${i + 1} ---\n${msgs}`;
    })
    .join("\n\n");

  const prompt = `Você é um especialista em Social Selling B2B. Analise as conversas abaixo do vendedor "${sellerName}" e avalie se ele está seguindo o processo da empresa.

${SALES_PROCESS}

## Conversas para análise:
${formatted}

## Responda APENAS com JSON válido neste formato (sem markdown, sem explicações):
{
  "score": <número 0-100>,
  "totalConversations": ${conversations.length},
  "stages": {
    "abordagem": { "score": <0-100>, "feedback": "<string em português>" },
    "qualificacao": { "score": <0-100>, "feedback": "<string em português>" },
    "agendamento": { "score": <0-100>, "feedback": "<string em português>" },
    "followUp": { "score": <0-100>, "feedback": "<string em português>" }
  },
  "highlights": ["<ponto positivo 1>", "<ponto positivo 2>"],
  "improvements": ["<melhoria 1>", "<melhoria 2>", "<melhoria 3>"]
}`;

  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    contents: prompt,
  });
  const text = (result.text ?? "").trim();
  const json = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(json);
}
