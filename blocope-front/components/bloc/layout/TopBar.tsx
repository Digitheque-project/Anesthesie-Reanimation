"use client";

import { mockMedecin } from "@/lib/mock/bloc-dashboard";

export default function TopBar() {
  return (
    <header className="h-16 border-b border-surface-variant/30 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Rechercher un patient ou un ID..."
            className="w-full bg-surface-container-low border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
          />
        </div>
      </div>

      {/* User Info & Settings */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface leading-none">
              Dr. {mockMedecin.prenom} {mockMedecin.nom}
            </p>
            <p className="text-[10px] text-outline font-bold uppercase tracking-wider mt-1">
              {mockMedecin.role}
            </p>
          </div>
          
          {/* Avatar / Initials */}
          <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm ring-2 ring-surface-container">
            {mockMedecin.initiales}
          </div>
        </div>

        <div className="flex items-center gap-1 border-l border-surface-variant/30 pl-4">
          <button className="p-2 text-outline hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <button className="p-2 text-outline hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
