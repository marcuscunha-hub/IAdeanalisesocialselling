import Anthropic from "@anthropic-ai/sdk";
import type { MetaConversation } from "./meta";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Placeholder do processo — será substituído pelo processo real da empresa
const SALES_PROCESS = `
## Processo de Social Selling

**1. Abordagem**
- Iniciar com mensagem personalizada referenciando algo do perfil do lead
- Tom natural, não comercial na primeira mensagem
- Objetivo: gerar curiosidade, não vender

**2. Qualificação**
- Identificar perfil da empresa (segmento, tamanho, dores)
- Perguntas abertas para entender momento atual
- Confirmar se há decisor envolvido

**3. Agendamento**
- Oferecer reunião apenas após qualificação positiva
- Apresentar proposta de valor clara antes de pedir agenda
- Sugerir horários específicos

**4. Follow-up**
- Nível 1 (sem resposta em 3 dias): reforço leve com novo valor
- Nível 2 (sem resposta em 7 dias): mudança de ângulo
- Nível 3 (sem resposta em 14 dias): breakup message
`;

export async function analyzeConversations(
  conversations: MetaConversation[],
  sellerUsername: string
): Promise<object> {
  const formatted = conversations
    .slice(0, 20) // limita para controlar custo de tokens
    .map((conv, i) => {
      const msgs = conv.messages
        .map((m) => `[${m.from.username ?? m.from.id}]: ${m.message}`)
        .join("\n");
      return `--- Conversa ${i + 1} ---\n${msgs}`;
    })
    .join("\n\n");

  const prompt = `Você é um especialista em Social Selling B2B. Analise as conversas abaixo do vendedor "${sellerUsername}" e avalie se ele está seguindo o processo da empresa.

${SALES_PROCESS}

## Conversas para análise:
${formatted}

## Responda APENAS com JSON válido neste formato:
{
  "score": <número 0-100>,
  "totalConversations": ${conversations.length},
  "stages": {
    "abordagem": { "score": <0-100>, "feedback": "<string>" },
    "qualificacao": { "score": <0-100>, "feedback": "<string>" },
    "agendamento": { "score": <0-100>, "feedback": "<string>" },
    "followUp": { "score": <0-100>, "feedback": "<string>" }
  },
  "highlights": ["<ponto positivo 1>", "<ponto positivo 2>"],
  "improvements": ["<melhoria 1>", "<melhoria 2>", "<melhoria 3>"]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return JSON.parse(text);
}
