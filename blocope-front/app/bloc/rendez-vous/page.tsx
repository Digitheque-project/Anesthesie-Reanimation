'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { planningService } from '@/lib/api';

type Onglet = 'CPA' | 'VERIFICATION_VEILLE';

const ONGLETS: { type: Onglet; label: string; actionLabel: string; cible: string }[] = [
  { type: 'CPA', label: '👨‍⚕️ Rendez-vous CPA', actionLabel: 'Réaliser CPA', cible: '/bloc/consultation-cpa' },
  { type: 'VERIFICATION_VEILLE', label: '🌙 Vérification veille', actionLabel: 'Réaliser la vérification', cible: '/bloc/verification-veille' },
];

export default function RendezVousPage() {
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>('CPA');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [creneaux, setCreneaux] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { charger(); }, [selectedDate, onglet]);

  const charger = async () => {
    setLoading(true);
    try {
      const data = await planningService.getJour(selectedDate, onglet);
      // Patient à statut Normal apte pour le CPA uniquement (sans objet pour la vérification veille)
      const filtres = (Array.isArray(data) ? data : []).filter((c: any) =>
        onglet === 'VERIFICATION_VEILLE' || ((c.patient?.niveauUrgence ?? 'NORMAL') === 'NORMAL' && c.patient?.statut !== 'CPA_INAPTE')
      );
      setCreneaux(filtres);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formaterDate = (d: string) => {
    return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const ongletActif = ONGLETS.find(o => o.type === onglet)!;

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface font-headline tracking-tight">Gestion des Rendez-vous</h1>
          <p className="text-sm text-on-surface-variant mt-1">{formaterDate(selectedDate)}</p>
        </div>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-outline-variant/50 rounded-lg text-sm font-bold cursor-pointer bg-white w-fit" />
      </div>

      {/* Tableau */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm flex flex-col">
        {/* Tabs */}
        <div className="px-6 pt-4 flex border-b border-outline-variant/10 bg-white">
          <div className="flex space-x-2 bg-gray-50 p-2 rounded-2xl">
            {ONGLETS.map(o => (
              <button
                key={o.type}
                onClick={() => setOnglet(o.type)}
                className={`pb-4 pt-2 px-4 rounded-2xl text-lg font-bold transition-colors ${
                  onglet === o.type ? 'bg-blue-100 text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:bg-gray-100'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barre recherche */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-lowest">
          <h3 className="font-headline font-extrabold text-on-surface text-lg">Interventions Planifiées</h3>
          <div className="flex gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">search</span>
              </span>
              <input className="pl-10 pr-4 py-2 text-xs border border-outline-variant/50 bg-white rounded-lg focus:ring-2 focus:ring-primary w-64" placeholder="Rechercher..." type="text" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-container/30">
              <tr className="text-on-surface-variant border-b border-outline-variant/20">
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Heure</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Patient</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Type</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Chirurgien</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Urgence</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Statut</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">Chargement...</td></tr>
              ) : creneaux.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">Aucun rendez-vous</td></tr>
              ) : creneaux.map((c: any, i: number) => (
                <tr key={c.id || i} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4 font-extrabold text-primary text-sm">{c.heureDebut}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-on-surface text-sm">{c.patient?.nom} {c.patient?.prenom}</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">{c.patient?.idDossier || c.patientId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-primary/5 text-primary">
                      {c.type || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{c.chirurgien?.nom || '—'}</td>
                  <td className="px-6 py-4">
                    {c.estUrgence ? (
                      <span className="px-3 py-1 bg-tertiary text-on-tertiary text-[10px] font-black rounded uppercase">URGENT</span>
                    ) : (
                      <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-black rounded uppercase">NORMAL</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      c.statut === 'PLANIFIE' ? 'bg-blue-100 text-blue-700' :
                      c.statut === 'TERMINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>{c.statut || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => router.push(`${ongletActif.cible}?patientId=${c.patient?.id}&patientNom=${encodeURIComponent((c.patient?.nom || '') + ' ' + (c.patient?.prenom || ''))}`)}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 whitespace-nowrap"
                    >
                      {ongletActif.actionLabel}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
