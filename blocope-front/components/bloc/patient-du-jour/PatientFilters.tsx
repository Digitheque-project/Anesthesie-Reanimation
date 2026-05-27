"use client";

import { FiltresPatient } from "@/types/bloc";
import { useState } from "react";

interface PatientFiltersProps {
  onFilterChange: (filtres: FiltresPatient) => void;
}

export default function PatientFilters({ onFilterChange }: PatientFiltersProps) {
  const [statut, setStatut] = useState("Tous les statuts");
  const [specialite, setSpecialite] = useState("Toutes les spécialités");

  const handleStatutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    setStatut(newVal);
    onFilterChange({ statut: newVal, specialite });
  };

  const handleSpecialiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    setSpecialite(newVal);
    onFilterChange({ statut, specialite: newVal });
  };

  return (
    <div className="flex flex-wrap gap-6 items-end bg-surface-container-low p-5 rounded-xl mb-6 border border-outline-variant/10">
      {/* Date Indicator */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-primary uppercase tracking-widest px-1">
          Date du jour
        </label>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-outline-variant/20 shadow-sm min-w-[200px]">
          <span className="material-symbols-outlined text-primary text-xl">
            calendar_month
          </span>
          <span className="text-sm font-bold text-on-surface">
            Mardi 24 Octobre 2023
          </span>
        </div>
      </div>

      {/* Statut Filter */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
        <label className="text-[10px] font-bold text-outline uppercase tracking-widest px-1">
          Statut de consultation
        </label>
        <select
          value={statut}
          onChange={handleStatutChange}
          className="w-full px-4 py-2 bg-white rounded-lg border border-outline-variant/20 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer shadow-sm"
        >
          <option>Tous les statuts</option>
          <option>Stable</option>
          <option>Urgent</option>
          <option>STAT</option>
        </select>
      </div>

      {/* Specialite Filter */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
        <label className="text-[10px] font-bold text-outline uppercase tracking-widest px-1">
          Type d'intervention
        </label>
        <select
          value={specialite}
          onChange={handleSpecialiteChange}
          className="w-full px-4 py-2 bg-white rounded-lg border border-outline-variant/20 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer shadow-sm"
        >
          <option>Toutes les spécialités</option>
          <option>Appendicectomie</option>
          <option>Chirurgie Digestive</option>
          <option>Arthroplastie</option>
          <option>Urologie</option>
        </select>
      </div>
      
      {/* Search Button (Optional, following visual style) */}
      <button className="h-[38px] px-6 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-md flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">search</span>
        Filtrer
      </button>
    </div>
  );
}
