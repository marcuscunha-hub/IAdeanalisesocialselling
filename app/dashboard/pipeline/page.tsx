import { db, conversations } from "@/lib/db/client";
import { desc } from "drizzle-orm";
import PipelineBoard from "./PipelineBoard";

export default async function PipelinePage() {
  const all = await db.select().from(conversations).orderBy(desc(conversations.lastMessageAt));
  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-1">Funil de vendas</p>
        <h1 className="font-heading text-4xl text-forest dark:text-beige">Pipeline</h1>
        <p className="text-beige-100 dark:text-white/40 text-sm mt-1">
          Visualize e mova leads entre as etapas do processo de Social Selling.
        </p>
      </div>
      <PipelineBoard initialConversations={all} />
    </div>
  );
}
