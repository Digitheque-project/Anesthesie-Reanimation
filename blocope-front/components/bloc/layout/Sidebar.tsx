"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types/bloc";
import { effacerSession, redirigerVersLogin } from "@/lib/auth/central-session";

const navItems: NavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/bloc',
    icon: 'dashboard',
  },
  {
    label: 'Prescription',
    href: '/bloc/notification-cpa',
    icon: 'notification_important',
  },
  {
    label: 'Fil de travail',
    href: '/bloc/rendez-vous',
    icon: 'calendar_today',
  },
  {
    label: 'Demandes CPA externes',
    href: '/bloc/demandes-cpa-externes',
    icon: 'sync_alt',
  },
  {
    label: 'Programme opératoire',
    href: '/bloc/patient-du-jour',
    icon: 'person',
  },
  {
    label: 'Salle de réveil',
    href: '/bloc/salle-de-reveil',
    icon: 'bed',
  },
  {
    label: 'Archives',
    href: '/bloc/archives',
    icon: 'inventory_2',
  },
  {
    label: 'Rapport',
    href: '/bloc/rapport',
    icon: 'assessment',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 fixed left-0 top-0 bottom-0 flex flex-col z-50 border-r border-surface-variant/30 bg-[#dbf1fe]">
      {/* Logo and Brand */}
      <div className="px-6 py-4 flex flex-col items-center shrink-0">
        <div className="relative w-14 h-14 mb-2">
          <Image
          src="/images/CHU-logos.png"
          alt="CHU"
          width={56}
          height={56}
          className="rounded-full object-cover border-2 border-blue-500 shadow-md" />
        </div>
        <h1 className="font-headline font-extrabold text-primary text-center text-base tracking-tight leading-tight">
          Bloc Opératoire
        </h1>
        <p className="text-[9px] font-bold tracking-[0.15em] text-[#424752] opacity-70 uppercase mt-0.5">
          PLATEFORME MÉDICALE
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 flex flex-col justify-center gap-1 min-h-0">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/bloc/rendez-vous' && (pathname.startsWith('/bloc/rendez-vous/') || pathname.startsWith('/bloc/consultation-cpa') || pathname === '/bloc/verification-veille'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all group ${
                isActive
                  ? "bg-white text-primary font-bold shadow-sm"
                  : "text-[#424752] hover:bg-white/40 font-medium"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto p-3 border-t border-surface-variant/20 space-y-1 shrink-0">
        <button
          className="w-full flex items-center gap-3 px-4 py-2 text-[#424752] hover:text-error transition-all group"
          onClick={() => { effacerSession(); redirigerVersLogin(); }}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-xs font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}