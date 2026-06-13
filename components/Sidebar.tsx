"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: "Relatório",
    href: "/dashboard/relatorio",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 17H7a5 5 0 010-10h2M15 17h2a5 5 0 000-10h-2M8 12h8"/>
      </svg>
    ),
  },
  {
    label: "Vendedores",
    href: "/dashboard/vendedores",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
];

const SYSTEM_NAV = [
  {
    label: "Configurações",
    href: "/dashboard/configuracoes",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
  },
];

export default function Sidebar({ demo }: { demo: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-56 shrink-0 bg-forest flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-lime/20 flex items-center justify-center shrink-0">
            <div className="w-3 h-3 rounded-sm bg-lime" />
          </div>
          <div>
            <p className="text-white text-sm font-medium leading-tight">Social Selling AI</p>
            <p className="text-lime/40 text-[10px] tracking-widest uppercase leading-tight mt-0.5">Full Sales System</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.href)
                ? "bg-lime/10 text-lime font-medium"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <span className={isActive(item.href) ? "text-lime" : "text-white/30"}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}

        <div className="pt-5 pb-1 px-3">
          <p className="text-[10px] font-medium tracking-widest uppercase text-white/20">Sistema</p>
        </div>

        {SYSTEM_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.href)
                ? "bg-lime/10 text-lime font-medium"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <span className={isActive(item.href) ? "text-lime" : "text-white/30"}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 pt-3 border-t border-white/10 space-y-1">
        {demo && (
          <div className="mx-1 mb-2 px-3 py-2 rounded-lg bg-lime/10 border border-lime/20">
            <p className="text-lime text-[11px] font-medium">Modo demo ativo</p>
            <p className="text-lime/50 text-[10px] mt-0.5">Configure META_ACCOUNTS</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors text-left"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}
