const META_BASE = "https://graph.facebook.com/v19.0";

export type MetaMessage = {
  id: string;
  message: string;
  from: { id: string; username?: string };
  created_time: string;
};

export type MetaConversation = {
  id: string;
  messages: MetaMessage[];
  participants: { id: string; username?: string }[];
};

export async function getConversations(
  igAccountId: string,
  accessToken: string,
  since: Date
): Promise<MetaConversation[]> {
  const sinceTs = Math.floor(since.getTime() / 1000);

  const url = `${META_BASE}/${igAccountId}/conversations?platform=instagram&since=${sinceTs}&fields=id,participants,messages{id,message,from,created_time}&access_token=${accessToken}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Meta API error: ${res.status}`);

  const data = await res.json();
  return (data.data ?? []) as MetaConversation[];
}

export function periodToDays(period: string): number {
  const map: Record<string, number> = { "7d": 7, "14d": 14, "30d": 30 };
  return map[period] ?? 7;
}
