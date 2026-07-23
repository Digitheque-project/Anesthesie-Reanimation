'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { planningService } from '@/lib/api';
import { formaterNomPatient } from '@/lib/patient';
import { styleUrgence } from '@/lib/urgence';

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
  const [recherche, setRecherche] = useState('');

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

  // Recherche multi-champs côté client (nom patient, type, chirurgien) — même pattern que
  // app/bloc/rapports/page.tsx.
  const creneauxFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return creneaux;
    return creneaux.filter((c: any) =>
      [formaterNomPatient(c.patient), c.type, c.chirurgien?.nom].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [creneaux, recherche]);

  const formaterDate = (d: string) => {
    return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const ongletActif = ONGLETS.find(o => o.type === onglet)!;

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface font-headline tracking-tight">Fil de travail</h1>
          <p className="text-sm text-on-surface-variant mt-1 capitalize">{formaterDate(selectedDate)}</p>
        </div>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-outline-variant/50 rounded-lg text-sm font-bold cursor-pointer bg-white shadow-sm w-fit" />
      </div>

      {/* Tableau */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm flex flex-col">
        {/* Tabs */}
        <div className="px-6 pt-4 flex border-b border-outline-variant/10 bg-surface-container-lowest">
          <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-outline-variant/20 shadow-sm">
            {ONGLETS.map(o => (
              <button
                key={o.type}
                onClick={() => setOnglet(o.type)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  onglet === o.type ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barre recherche */}
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 bg-surface-container-lowest">
          <h3 className="font-headline font-extrabold text-on-surface text-lg">Interventions Planifiées</h3>
          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold text-on-surface-variant">{creneauxFiltres.length} résultat{creneauxFiltres.length > 1 ? 's' : ''}</span>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">search</span>
              </span>
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="pl-10 pr-4 py-2 text-xs border border-outline-variant/50 bg-white rounded-lg focus:ring-2 focus:ring-primary/30 outline-none w-64"
                placeholder="Rechercher (patient, type, chirurgien)..."
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-container/60 backdrop-blur">
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
              ) : creneauxFiltres.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                  {recherche ? 'Aucun résultat pour cette recherche' : 'Aucun rendez-vous'}
                </td></tr>
              ) : creneauxFiltres.map((c: any, i: number) => {
                const niveau = c.estUrgence ? 'URGENT' : 'NORMAL';
                const style = styleUrgence(niveau);
                const nom = formaterNomPatient(c.patient);
                return (
                  <tr key={c.id || i} className={`hover:bg-surface-container/30 transition-colors border-l-4 ${style.bordure}`}>
                    <td className="px-6 py-4 font-extrabold text-primary text-sm whitespace-nowrap">{c.heureDebut}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                          {nom.charAt(0)}
                        </div>
                        <span className="font-bold text-on-surface text-sm">{nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-primary/5 text-primary">
                        {c.type || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{c.chirurgien?.nom || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-black rounded uppercase ${style.badge}`}>
                        {niveau === 'URGENT' ? 'URGENT' : 'NORMAL'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        c.statut === 'PLANIFIE' ? 'bg-blue-100 text-blue-700' :
                        c.statut === 'TERMINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>{c.statut || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => router.push(`${ongletActif.cible}?patientId=${c.patient?.id}&patientNom=${encodeURIComponent(nom)}`)}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors whitespace-nowrap"
                      >
                        {ongletActif.actionLabel}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
