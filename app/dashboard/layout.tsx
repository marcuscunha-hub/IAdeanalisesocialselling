import Sidebar from "@/components/Sidebar";
import { getSellerAccounts } from "@/lib/meta";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const accounts = getSellerAccounts();
  const demo = accounts.length === 0 || !accounts.some((a) => a.igAccountId && a.accessToken);

  return (
    <div className="flex h-screen overflow-hidden bg-beige">
      <Sidebar demo={demo} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
