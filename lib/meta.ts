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

export type SellerAccount = {
  name: string;
  igAccountId: string;
  accessToken: string;
};

export function getSellerAccounts(): SellerAccount[] {
  const raw = process.env.META_ACCOUNTS;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SellerAccount[];
  } catch {
    return [];
  }
}

export function getSellerByAccountId(igAccountId: string): SellerAccount | undefined {
  return getSellerAccounts().find((a) => a.igAccountId === igAccountId);
}

async function fetchAllPages<T>(url: string): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const res: Response = await fetch(nextUrl);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const metaMsg = body?.error?.message ?? res.statusText;
      throw new Error(`Meta API ${res.status}: ${metaMsg}`);
    }
    const data = await res.json();
    results.push(...(data.data ?? []));
    nextUrl = data.paging?.next ?? null;
  }

  return results;
}

export async function getConversations(
  igAccountId: string,
  accessToken: string,
  since: Date
): Promise<MetaConversation[]> {
  const sinceTs = Math.floor(since.getTime() / 1000);
  const url =
    `${META_BASE}/${igAccountId}/conversations` +
    `?platform=instagram` +
    `&since=${sinceTs}` +
    `&fields=id,participants,messages{id,message,from,created_time}` +
    `&access_token=${accessToken}`;

  return fetchAllPages<MetaConversation>(url);
}

export function periodToDays(period: string): number {
  const map: Record<string, number> = { "7d": 7, "14d": 14, "30d": 30 };
  return map[period] ?? 7;
}
