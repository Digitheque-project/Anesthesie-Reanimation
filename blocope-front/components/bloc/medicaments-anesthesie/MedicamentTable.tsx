"use client";

export type MedicamentRow = {
  id: string;
  label: string;
  selected: boolean;
  dosage: string;
  observation: string;
  /** Par défaut : champ texte. `number` pour les quantités entières (ex. blouse). */
  dosageInputType?: "text" | "number";
  dosagePlaceholder?: string;
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

const checkboxClass: Record<MedicamentTableAccent, string> = {
  primary:
    "border-outline-variant accent-primary focus:ring-2 focus:ring-primary/30",
  secondary:
    "border-outline-variant accent-secondary focus:ring-2 focus:ring-secondary/30",
  tertiary:
    "border-outline-variant accent-tertiary focus:ring-2 focus:ring-tertiary/30",
  "primary-container":
    "border-outline-variant accent-primary focus:ring-2 focus:ring-primary/30",
  error: "border-outline-variant accent-error focus:ring-2 focus:ring-error/30",
  "inverse-primary":
    "border-outline-variant accent-primary focus:ring-2 focus:ring-primary/30",
};

const dosageInputClassName =
  "h-9 w-full rounded border border-outline-variant/20 bg-surface-container-low px-3 outline-none focus:ring-2 focus:ring-primary/20";

const observationInputClassName =
  "h-9 w-full border-none bg-transparent px-3 text-xs text-on-surface-variant outline-none focus:ring-0";

type MedicamentTableProps = {
  title: string;
  accent: MedicamentTableAccent;
  rows: MedicamentRow[];
  onRowsChange: (rows: MedicamentRow[]) => void;
};

export default function MedicamentTable({
  title,
  accent,
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

  return (
    <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className={`h-6 w-1.5 rounded-full ${barClass[accent]}`} />
        <h3 className="font-headline text-lg font-bold uppercase text-on-surface">
          {title}
        </h3>
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
                  className="transition-colors hover:bg-surface-container-low/50"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={(e) =>
                        patchRow(row.id, "selected", e.target.checked)
                      }
                      className={`h-4 w-4 cursor-pointer rounded ${checkboxClass[accent]}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-on-surface">
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
