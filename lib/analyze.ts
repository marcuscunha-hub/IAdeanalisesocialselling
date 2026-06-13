import { GoogleGenAI } from "@google/genai";
import { db, analyses, conversations } from "@/lib/db/client";
import { eq, desc } from "drizzle-orm";

export const SALES_PROCESS = `
## Processo de Social Selling — Full Sales System

### Princípios fundamentais
- **Venda invisível**: nunca demonstrar intenção de vender na abordagem inicial
- **Mensagens curtas**: mensagens longas passam apego e repelem
- **Desapego**: não responder de forma imediata nem parecer ansioso
- **Interesse genuíno**: mostrar interesse real no lead antes de qualquer pitch
- **Personalização**: usar informações do perfil ou fala do lead
- **Sempre terminar com pergunta ou sugestão**: manter o "bate-bola"
- **Tripé do relacionamento**: ponto em comum + apreciação sincera + interesse genuíno
- **Vender o agendamento, não o produto**

### Etapa 1 — Abordagem inicial
- Chamar pelo nome, referenciar algo específico do perfil
- Tom leve, descontraído, não comercial
- Terminar com pergunta aberta sobre a operação/negócio do lead
- Erros: mensagem genérica, mencionar produto na primeira mensagem, mensagem longa

### Etapa 2 — Rapport
- Comentar algo do perfil (cidade, nicho, conteúdo)
- Criar familiaridade antes de qualificação

### Etapa 3 — Qualificação
- Perguntas abertas (O que, Quais, Como)
- Entender: faturamento, meta, tamanho do time, principal desafio
- Confirmar se é decisor
- Erros: avançar sem qualificar, perguntas fechadas

### Etapa 4 — Identificação de necessidades
- Entender o estágio atual e preparar pitch personalizado
- Aprofundar nas dores em camadas

### Etapa 5 — Pitch de agendamento
- Conectar às dores identificadas
- Propor horários específicos
- Não explicar o produto — vender a reunião
- Erros: pitch longo, propor sem horários concretos

### Etapa 6 — Follow-up
- FUP 1: mensagem curtíssima ("👀" ou "Oi, [Nome]?")
- FUP 2: retomada leve para quem demonstrou interesse
- FUP 3: saudação + desculpar + propor 2-3 horários concretos
- Erros: follow-up longo, tom insistente
`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

type ConvMessage = { fromUsername: string | null; isFromSeller: boolean; body: string; sentAt: Date };

export async function analyzeConversation(
  convId: string,
  convMessages: ConvMessage[],
  sellerName: string,
  triggeredBy: string,
  igAccountId: string
) {
  // Skip if analyzed in the last 30 minutes
  const recent = await db
    .select()
    .from(analyses)
    .where(eq(analyses.conversationId, convId))
    .orderBy(desc(analyses.createdAt))
    .limit(1);

  if (recent.length > 0) {
    const ageMs = Date.now() - new Date(recent[0].createdAt!).getTime();
    if (ageMs < 30 * 60 * 1000) return recent[0];
  }

  const transcript = convMessages
    .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
    .map((m) => {
      const who = m.isFromSeller ? `[${sellerName}]` : `[Lead${m.fromUsername ? ` @${m.fromUsername}` : ""}]`;
      return `${who}: ${m.body}`;
    })
    .join("\n");

  const prompt = `Você é um especialista em Social Selling B2B. Analise a conversa abaixo do vendedor "${sellerName}" e avalie se ele está seguindo o processo da empresa.

${SALES_PROCESS}

## Conversa:
${transcript}

## Responda APENAS com JSON válido (sem markdown, sem explicações):
{
  "score": <número 0-100>,
  "currentStage": "<abordagem|rapport|qualificacao|identificacao|pitch|followup|agendado|perdido>",
  "stages": {
    "abordagem":    { "score": <0-100>, "feedback": "<string em português>" },
    "qualificacao": { "score": <0-100>, "feedback": "<string em português>" },
    "agendamento":  { "score": <0-100>, "feedback": "<string em português>" },
    "followUp":     { "score": <0-100>, "feedback": "<string em português>" }
  },
  "highlights":    ["<ponto positivo 1>", "<ponto positivo 2>"],
  "improvements":  ["<melhoria 1>", "<melhoria 2>"]
}`;

  const result = await ai.models.generateContent({ model: "gemini-2.0-flash-lite", contents: prompt });
  const text = (result.text ?? "").trim();
  const json = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(json);

  const [inserted] = await db.insert(analyses).values({
    conversationId: convId,
    igAccountId,
    score:         parsed.score,
    stageScores:   Object.fromEntries(Object.entries(parsed.stages).map(([k, v]: [string, any]) => [k, v.score])),
    stageFeedback: Object.fromEntries(Object.entries(parsed.stages).map(([k, v]: [string, any]) => [k, v.feedback])),
    highlights:    parsed.highlights,
    improvements:  parsed.improvements,
    currentStage:  parsed.currentStage,
    triggeredBy,
  }).returning();

  // Update conversation stage
  await db.update(conversations)
    .set({ stage: parsed.currentStage, updatedAt: new Date() })
    .where(eq(conversations.id, convId));

  return inserted;
}
