"use client";

import Checkbox from "@/components/ui/Checkbox";

export type MedicamentRow = {
  id: string;
  label: string;
  selected: boolean;
  dosage: string;
  observation: string;
  /** Par défaut : champ texte. `number` pour les quantités entières (ex. blouse). */
  dosageInputType?: "text" | "number";
  dosagePlaceholder?: string;
  /** Catégorie d'origine (ex. "SERUMS") — non utilisée par ce composant, sert au parent à
   * regrouper/filtrer les lignes d'un tableau à plat (ex. catalogue CPA). */
  categorie?: string;
};

export type MedicamentTableAccent =
  | "primary"
  | "secondary"
  | "tertiary"
  | "primary-container"
  | "error"
  | "inverse-primary";

const barClass: Record<MedicamentTableAccent, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
  "primary-container": "bg-primary-container",
  error: "bg-error",
  "inverse-primary": "bg-inverse-primary",
};

// Badge d'icône coloré dans l'en-tête de chaque catégorie.
const badgeClass: Record<MedicamentTableAccent, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-tertiary/10 text-tertiary",
  "primary-container": "bg-primary-container/15 text-primary-container",
  error: "bg-error/10 text-error",
  "inverse-primary": "bg-inverse-primary/20 text-on-primary-fixed-variant",
};

// Fond légèrement teinté de la carte de catégorie, pour la repérer d'un coup d'œil.
const cardTintClass: Record<MedicamentTableAccent, string> = {
  primary: "bg-primary/[0.03] border-primary/15",
  secondary: "bg-secondary/[0.03] border-secondary/15",
  tertiary: "bg-tertiary/[0.03] border-tertiary/15",
  "primary-container": "bg-primary-container/[0.05] border-primary-container/15",
  error: "bg-error/[0.03] border-error/15",
  "inverse-primary": "bg-inverse-primary/[0.08] border-inverse-primary/20",
};

// Ligne mise en avant une fois l'article coché — la sélection doit rester visible même quand
// on scrolle loin de la case à cocher.
const rowSelectedClass: Record<MedicamentTableAccent, string> = {
  primary: "bg-primary/[0.06]",
  secondary: "bg-secondary/[0.06]",
  tertiary: "bg-tertiary/[0.06]",
  "primary-container": "bg-primary-container/[0.08]",
  error: "bg-error/[0.06]",
  "inverse-primary": "bg-inverse-primary/[0.12]",
};

const dosageInputClassName =
  "h-9 w-full rounded border border-outline-variant/20 bg-surface-container-low px-3 outline-none focus:ring-2 focus:ring-primary/20";

const observationInputClassName =
  "h-9 w-full border-none bg-transparent px-3 text-xs text-on-surface-variant outline-none focus:ring-0";

type MedicamentTableProps = {
  title: string;
  accent: MedicamentTableAccent;
  icon?: string;
  rows: MedicamentRow[];
  onRowsChange: (rows: MedicamentRow[]) => void;
};

export default function MedicamentTable({
  title,
  accent,
  icon,
  rows,
  onRowsChange,
}: MedicamentTableProps) {
  const patchRow = (
    id: string,
    field: keyof MedicamentRow,
    value: string | boolean
  ) => {
    onRowsChange(
      rows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const selectionnes = rows.filter((r) => r.selected).length;

  return (
    <section className={`rounded-xl border p-6 shadow-sm ${cardTintClass[accent]}`}>
      <div className="mb-6 flex items-center gap-3">
        <div className={`h-6 w-1.5 rounded-full ${barClass[accent]}`} />
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${badgeClass[accent]}`}>
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </span>
        )}
        <h3 className="font-headline text-lg font-bold uppercase text-on-surface">
          {title}
        </h3>
        {selectionnes > 0 && (
          <span className={`ml-auto rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${badgeClass[accent]}`}>
            {selectionnes} sélectionné{selectionnes > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-outline-variant/20 bg-surface-container-low">
            <tr>
              <th className="w-12 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Select
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Médicament / Matériel
              </th>
              <th className="w-64 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Quantité / Dosage
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Observation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-sm">
            {rows.map((row) => {
              const dosageType = row.dosageInputType ?? "text";
              const dosagePlaceholder =
                row.dosagePlaceholder ??
                (dosageType === "number" ? "Qté" : "ex: 500ml");

              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${row.selected ? rowSelectedClass[accent] : "hover:bg-surface-container-low/50"}`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      accent={accent}
                      size="sm"
                      checked={row.selected}
                      onChange={(e) =>
                        patchRow(row.id, "selected", e.target.checked)
                      }
                    />
                  </td>
                  <td className={`px-4 py-3 font-semibold ${row.selected ? "text-on-surface" : "text-on-surface-variant"}`}>
                    {row.selected && (
                      <span className="material-symbols-outlined mr-1.5 align-text-bottom text-sm text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    )}
                    {row.label}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type={dosageType}
                      value={row.dosage}
                      onChange={(e) =>
                        patchRow(row.id, "dosage", e.target.value)
                      }
                      placeholder={dosagePlaceholder}
                      className={dosageInputClassName}
                      min={dosageType === "number" ? 0 : undefined}
                      step={dosageType === "number" ? 1 : undefined}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.observation}
                      onChange={(e) =>
                        patchRow(row.id, "observation", e.target.value)
                      }
                      placeholder="Note…"
                      className={observationInputClassName}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="mt-4 flex items-center gap-2 text-xs font-bold uppercase text-navy-blue"
      >
        Voir plus
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>
    </section>
  );
}
