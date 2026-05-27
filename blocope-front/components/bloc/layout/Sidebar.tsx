"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types/bloc";

const navItems: NavItem[] = [
  {
    label: 'Notification RDV CPA',
    href: '/bloc/notification-cpa',
    icon: 'notification_important',
  },
  {
    label: 'Rendez-vous',
    href: '/bloc/rendez-vous',
    icon: 'calendar_today',
  },
  {
    label: 'Tableau de bord',
    href: '/bloc',
    icon: 'dashboard',
  },
  {
    label: 'Patient du Jour',
    href: '/bloc/patient-du-jour',
    icon: 'person',
  },
  {
    label: 'Activité avant opération',
    href: '/bloc/checklist-oms',
    icon: 'preliminary',
  },
  {
    label: 'Activité pendant opération',
    href: '/bloc/activite-pendant-operation',
    icon: 'medical_services',
  },
  {
    label: 'Après opération',
    href: '/bloc/apres-operation',
    icon: 'assignment_turned_in',
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
      <div className="px-6 py-8 flex flex-col items-center">
        <div className="relative w-36 h-36 mb-4">
          <Image
            src="/images/chu-main-logo.svg"
            alt="Logo CHU Andrainjato"
            fill
            sizes="144px"
            className="object-contain"
            priority
          />
        </div>
        <h1 className="font-headline font-extrabold text-primary text-center text-xl tracking-tight leading-tight">
          Bloc Opératoire
        </h1>
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#424752] opacity-70 uppercase mt-1">
          PLATEFORME MÉDICALE
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/bloc/rendez-vous' && (pathname.startsWith('/bloc/rendez-vous/') || pathname.startsWith('/bloc/consultation-cpa') || pathname === '/bloc/visite-pre-anesthesique'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                isActive
                  ? "bg-white text-primary font-bold shadow-sm"
                  : "text-[#424752] hover:bg-white/40 font-medium"
              }`}
            >
              <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto p-4 border-t border-surface-variant/20 space-y-1">
        <Link
          href="/bloc/support"
          className="flex items-center gap-3 px-4 py-2 text-[#424752] hover:text-primary transition-all group"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span className="text-xs font-medium">Support</span>
        </Link>
        <button
          className="w-full flex items-center gap-3 px-4 py-2 text-[#424752] hover:text-error transition-all group"
          onClick={() => console.log("Logout")}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-xs font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
