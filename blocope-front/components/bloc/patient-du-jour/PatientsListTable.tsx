"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { libelleUrgence, styleUrgence } from "@/lib/urgence";
import { formaterNomPatient } from "@/lib/patient";

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  operation: string;
  etat: string;
  chirurgien?: string;
  dateIntervention?: string | null;
  salle?: string;
  realId?: string;
}

const formaterHeureDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
};

interface PatientsListTableProps {
  patients: Patient[];
}

export default function PatientsListTable({ patients }: PatientsListTableProps) {
  const router = useRouter();
  const [loadingPatients, setLoadingPatients] = useState<Set<string>>(new Set());

  const handleDemarrer = async (patient: Patient) => {
    setLoadingPatients((prev) => new Set(prev).add(patient.id));
    const cleanId = patient.realId || patient.id.replace("#", "");
    const nom = encodeURIComponent(formaterNomPatient(patient));
    const intervention = encodeURIComponent(patient.operation || '');
    router.push(`/bloc/checklist-oms?patientId=${cleanId}&patientNom=${nom}&intervention=${intervention}`);
    setTimeout(() => setLoadingPatients((prev) => {
      const next = new Set(prev);
      next.delete(patient.id);
      return next;
    }), 1000);
  };

  const handleDossier = (patient: Patient) => {
    const cleanId = patient.realId || patient.id.replace("#", "");
    router.push(`/bloc/dossier-patient/${cleanId}`);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-container">
      <div className="px-8 py-6 bg-white border-b border-surface-container">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-extrabold text-on-surface tracking-tight font-headline">Liste des patients</h4>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface-variant rounded-lg text-sm font-bold hover:bg-surface-container-high transition-all border border-outline-variant">
            <span className="material-symbols-outlined text-lg">filter_list</span> Filtrer
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-white shadow-sm">
            <tr>
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Heure / Date prévue</th>
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nom & Prénom</th>
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">TYPE D'OPÉRATION</th>
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Chirurgien</th>
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Salle</th>
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">État</th>
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {patients.map((patient) => {
              const isLoading = loadingPatients.has(patient.id);
              return (
                <tr key={patient.id} className="hover:bg-surface-container-high/40 transition-colors duration-200">
                  <td className="px-8 py-5"><span className="text-sm font-medium text-on-surface-variant whitespace-nowrap">{formaterHeureDate(patient.dateIntervention)}</span></td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${patient.etat === 'NORMAL' ? 'bg-primary-fixed text-primary' : `${styleUrgence(patient.etat).fondClair} ${styleUrgence(patient.etat).texte}`}`}>
                        {patient.nom?.charAt(0)}{patient.prenom?.charAt(0)}
                      </div>
                      <span className="font-bold text-on-surface">{formaterNomPatient(patient)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5"><span className="text-sm font-medium text-on-surface">{patient.operation}</span></td>
                  <td className="px-8 py-5"><span className="text-sm text-on-surface-variant">{patient.chirurgien || '—'}</span></td>
                  <td className="px-8 py-5"><span className="text-sm text-on-surface-variant">{patient.salle || '—'}</span></td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${styleUrgence(patient.etat).point} ${patient.etat !== 'NORMAL' ? 'animate-pulse' : ''}`}></span>
                      <span className={`text-xs font-bold uppercase ${styleUrgence(patient.etat).texte}`}>{libelleUrgence(patient.etat)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleDemarrer(patient)} disabled={isLoading}
                        className="min-w-[100px] px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all active:scale-95 shadow-sm disabled:opacity-70">
                        {isLoading ? '...' : 'Démarrer'}
                      </button>
                      <button onClick={() => handleDossier(patient)}
                        className="px-4 py-1.5 bg-white text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary-fixed transition-all active:scale-95 shadow-sm">
                        Dossier
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
