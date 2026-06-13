import type { MetaConversation, SellerAccount } from "./meta";

export const MOCK_REPORT = {
  score: 72,
  totalConversations: 4,
  stages: {
    abordagem: {
      score: 85,
      feedback: "Abordagens bem personalizadas, com referências ao perfil e contexto do lead. Tom natural e não comercial na maioria das conversas.",
    },
    qualificacao: {
      score: 68,
      feedback: "Perguntas abertas usadas corretamente, mas em algumas conversas avançou para o pitch sem confirmar se o lead é decisor ou entender o faturamento.",
    },
    agendamento: {
      score: 75,
      feedback: "Pitch de agendamento conectado às dores identificadas. Em um caso propôs horários concretos, mas em outro faltou sugerir datas específicas.",
    },
    followUp: {
      score: 55,
      feedback: "Follow-up realizado em conversas paradas, porém algumas mensagens ficaram longas. A cadência de FUP 3 não foi seguida em pelo menos um caso.",
    },
  },
  highlights: [
    "Personalização consistente — referências ao perfil e conquistas do lead em 3 de 4 conversas",
    "Pitch de agendamento bem posicionado como solução às dores, não como venda de produto",
    "Tom leve e descontraído mantido ao longo das conversas",
  ],
  improvements: [
    "Qualificar o decisor antes de avançar para o pitch — perguntar se é ele quem toma a decisão",
    "Propor sempre 2 ou 3 horários concretos no follow-up nível 3 (ex: 'terça 14h ou quarta 16h?')",
    "Manter mensagens de follow-up mais curtas — uma frase e um horário é suficiente",
  ],
};

export const MOCK_SELLERS: SellerAccount[] = [
  { name: "João Silva", igAccountId: "mock_001", accessToken: "mock" },
  { name: "Maria Costa", igAccountId: "mock_002", accessToken: "mock" },
];

export const MOCK_CONVERSATIONS: MetaConversation[] = [
  {
    id: "conv_1",
    participants: [
      { id: "seller_1", username: "joaosilva" },
      { id: "lead_1", username: "pedro.empresario" },
    ],
    messages: [
      {
        id: "m1",
        message: "Oi Pedro! Vi que você postou sobre os desafios de prospecção no LinkedIn. A gente tem ajudado empresas do seu segmento a resolver exatamente isso.",
        from: { id: "seller_1", username: "joaosilva" },
        created_time: "2026-06-06T10:00:00Z",
      },
      {
        id: "m2",
        message: "Oi João! Sim, é um desafio mesmo. O que vocês fazem exatamente?",
        from: { id: "lead_1", username: "pedro.empresario" },
        created_time: "2026-06-06T10:30:00Z",
      },
      {
        id: "m3",
        message: "A gente ajuda times comerciais a estruturar o processo de social selling. Você é o responsável pelo comercial na empresa?",
        from: { id: "seller_1", username: "joaosilva" },
        created_time: "2026-06-06T11:00:00Z",
      },
      {
        id: "m4",
        message: "Sim, sou o diretor comercial. Temos uns 8 vendedores.",
        from: { id: "lead_1", username: "pedro.empresario" },
        created_time: "2026-06-06T11:15:00Z",
      },
      {
        id: "m5",
        message: "Perfeito. Com 8 vendedores, o gap de processo custa caro. Posso te mostrar como a gente resolveu isso pra uma empresa parecida com a sua em 30 minutos. Tem disponibilidade terça ou quarta essa semana?",
        from: { id: "seller_1", username: "joaosilva" },
        created_time: "2026-06-06T11:30:00Z",
      },
      {
        id: "m6",
        message: "Quarta às 15h funciona.",
        from: { id: "lead_1", username: "pedro.empresario" },
        created_time: "2026-06-06T12:00:00Z",
      },
    ],
  },
  {
    id: "conv_2",
    participants: [
      { id: "seller_1", username: "joaosilva" },
      { id: "lead_2", username: "ana.gestora" },
    ],
    messages: [
      {
        id: "m7",
        message: "Oi Ana! Você tem interesse em aumentar suas vendas?",
        from: { id: "seller_1", username: "joaosilva" },
        created_time: "2026-06-07T09:00:00Z",
      },
      {
        id: "m8",
        message: "Não obrigada",
        from: { id: "lead_2", username: "ana.gestora" },
        created_time: "2026-06-07T09:45:00Z",
      },
    ],
  },
  {
    id: "conv_3",
    participants: [
      { id: "seller_1", username: "joaosilva" },
      { id: "lead_3", username: "carlos.founder" },
    ],
    messages: [
      {
        id: "m9",
        message: "Carlos, vi que a Startup X acabou de captar rodada seed. Parabéns! Com essa aceleração, como vocês estão pensando o processo comercial para escalar?",
        from: { id: "seller_1", username: "joaosilva" },
        created_time: "2026-06-08T14:00:00Z",
      },
      {
        id: "m10",
        message: "Obrigado! Ainda estamos estruturando. É um desafio.",
        from: { id: "lead_3", username: "carlos.founder" },
        created_time: "2026-06-08T15:00:00Z",
      },
      {
        id: "m11",
        message: "Faz sentido. Qual é o maior gargalo hoje — geração de pipeline ou conversão?",
        from: { id: "seller_1", username: "joaosilva" },
        created_time: "2026-06-08T15:30:00Z",
      },
      {
        id: "m12",
        message: "Geração com certeza. Não temos processo ainda.",
        from: { id: "lead_3", username: "carlos.founder" },
        created_time: "2026-06-08T16:00:00Z",
      },
    ],
  },
  {
    id: "conv_4",
    participants: [
      { id: "seller_1", username: "joaosilva" },
      { id: "lead_4", username: "fernanda.rh" },
    ],
    messages: [
      {
        id: "m13",
        message: "Oi Fernanda! Vi seu conteúdo sobre cultura organizacional. A gente trabalha com empresas que estão conectando RH e comercial para melhorar resultados. Faz sentido pra vocês?",
        from: { id: "seller_1", username: "joaosilva" },
        created_time: "2026-06-09T10:00:00Z",
      },
    ],
  },
];
