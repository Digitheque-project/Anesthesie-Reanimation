'use client';

import { useRouter } from 'next/navigation';

export interface PatientTresUrgent {
  id: string;
  nom: string;
}

interface AlerteBandeauProps {
  patients: PatientTresUrgent[];
}

// Bannière d'alerte pour les patients très urgents en attente de prise en charge — un bouton
// "Voir" par patient, qui envoie directement faire la VPA (vérification pré-anesthésique,
// page /bloc/verification-veille) plutôt qu'un lien générique vers le programme opératoire.
export default function AlerteBandeau({ patients }: AlerteBandeauProps) {
  const router = useRouter();
  if (patients.length <= 0) return null;

  const voirVpa = (p: PatientTresUrgent) => {
    router.push(`/bloc/verification-veille?patientId=${p.id}&patientNom=${encodeURIComponent(p.nom)}`);
  };

  return (
    <div className="border border-red-300 bg-red-50 rounded-xl overflow-hidden">
      <div className="p-4 flex items-center gap-4">
        <span className="material-symbols-outlined text-red-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          warning
        </span>
        <span className="text-sm font-bold text-red-700 flex-1 uppercase">
          {patients.length} patient{patients.length > 1 ? 's' : ''} TRÈS URGENT en attente de prise en charge
        </span>
      </div>
      <div className="divide-y divide-red-200/70 border-t border-red-200/70">
        {patients.map((p) => (
          <div key={p.id} className="px-4 py-2.5 flex items-center justify-between gap-3 bg-white/60">
            <span className="text-sm font-semibold text-red-900">{p.nom}</span>
            <button onClick={() => voirVpa(p)} className="text-xs font-bold text-red-700 underline cursor-pointer hover:opacity-80 transition-opacity shrink-0">
              Voir (VPA)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
