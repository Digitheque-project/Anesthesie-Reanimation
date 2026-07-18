"use client";

import { useMemo } from "react";
import MedicamentTable, { MedicamentRow } from "./MedicamentTable";
import { CATALOGUE_MEDICAMENTS, CategorieMedicament } from "@/lib/data/catalogue-medicaments-anesthesie";

// Construit l'état initial (tout décoché) du catalogue complet, à plat, un id stable par
// article (`categorie::libellé`) pour que la sélection survive aux re-rendus.
export function construireLignesInitiales(): MedicamentRow[] {
  return (Object.keys(CATALOGUE_MEDICAMENTS) as CategorieMedicament[]).flatMap((categorie) =>
    CATALOGUE_MEDICAMENTS[categorie].items.map((label) => ({
      id: `${categorie}::${label}`,
      label,
      selected: false,
      dosage: "",
      observation: "",
      categorie,
    }))
  );
}

type MedicamentsAnesthesieModalProps = {
  open: boolean;
  onClose: () => void;
  rows: MedicamentRow[];
  onRowsChange: (rows: MedicamentRow[]) => void;
};

export default function MedicamentsAnesthesieModal({
  open,
  onClose,
  rows,
  onRowsChange,
}: MedicamentsAnesthesieModalProps) {
  const total = rows.length;
  const selectionnes = useMemo(() => rows.filter((r) => r.selected).length, [rows]);
  const progression = total > 0 ? Math.round((selectionnes / total) * 100) : 0;

  if (!open) return null;

  const categories = Object.keys(CATALOGUE_MEDICAMENTS) as CategorieMedicament[];

  const patchCategorie = (categorie: CategorieMedicament, sousLignes: MedicamentRow[]) => {
    const autres = rows.filter((r) => r.categorie !== categorie);
    onRowsChange([...autres, ...sousLignes]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white">
              <span className="material-symbols-outlined text-2xl">medication_liquid</span>
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-white">Médicaments d'anesthésie et de réanimation</h3>
              <p className="text-xs text-white/80 mt-0.5">{selectionnes}/{total} articles sélectionnés</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors" aria-label="Fermer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="h-1.5 bg-surface-container-low">
          <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progression}%` }} />
        </div>

        <div className="overflow-y-auto p-6 space-y-4 bg-surface-container-lowest/40">
          {categories.map((categorie) => {
            const def = CATALOGUE_MEDICAMENTS[categorie];
            const sousLignes = rows.filter((r) => r.categorie === categorie);
            return (
              <MedicamentTable
                key={categorie}
                title={def.titre}
                accent={def.accent}
                icon={def.icon}
                rows={sousLignes}
                onRowsChange={(nouvelles) => patchCategorie(categorie, nouvelles)}
              />
            );
          })}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-outline-variant/20">
          <button onClick={onClose} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all">
            <span className="material-symbols-outlined text-lg">check</span>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
