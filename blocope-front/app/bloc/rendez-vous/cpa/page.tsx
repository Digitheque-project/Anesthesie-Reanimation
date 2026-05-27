'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { planningService } from '@/lib/api';

export default function RendezVousCpaPage() {
  const router = useRouter();
  const [creneaux, setCreneaux] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filtreStatut, setFiltreStatut] = useState('Tous les statuts actifs');
  const [filtreIntervention, setFiltreIntervention] = useState('Toutes les spécialités');

  useEffect(() => { charger(); }, [selectedDate]);

  const charger = async () => {
    setLoading(true);
    try { const data = await planningService.getJour(selectedDate, 'CPA'); setCreneaux(Array.isArray(data) ? data : []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formaterDate = (d: string) => {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const patientsFiltres = creneaux.filter((c: any) => {
    if (filtreStatut === 'Tous les statuts actifs') return true;
    if (filtreStatut === 'Urgent') return c.estUrgence;
    return c.statut === filtreStatut;
  });

  return (
    <main className="ml-64 min-h-screen">
      {/* TopNavBar */}
      <header className="w-full sticky top-0 z-40 bg-[#ffffff]/80 backdrop-blur-xl flex justify-between items-center px-8 py-3 shadow-[0_12px_40px_rgba(7,30,39,0.06)]">
        <div className="flex items-center gap-6">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
            <input className="pl-10 pr-4 py-1.5 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary/20 text-sm w-64" placeholder="Rechercher un patient..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-[#dbf1fe] rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-[#dbf1fe] rounded-full transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-primary/10">
            <div className="text-right">
              <p className="text-sm font-bold text-primary">Dr. Martin Dupont</p>
              <p className="text-xs text-on-surface-variant">Anesthésiste-Réanimateur</p>
            </div>
            <img alt="User profile" className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-primary/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJRIfdlIG4V72c1M6MEiavKPp6_dxFc_R2xIN6FebTBIpKZomyhr2k4luCbG1dr5sVp6f0lWcrQLO9bcS0j7WtRsIIinnzY4f3hmpgpywdLY12l_JyyD6e0x3LU8D6gJql9Br5CTjxa8tzAZYqFk9RMh7juA-s3U-_1i3v3i1JdUVZJtjG12dMVqVXqBHLmoHRnGSyWwPfjyj-paoxf-ZwDGynA31mol9o_rXw9ZowGDPURotswj-T0voImuvce9kEO-mSfges2EI" />
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-on-background tracking-tight mb-2">Les patients à rendez-vous CPA aujourd'hui</h1>
            <p className="text-lg text-on-surface-variant font-medium">Consultation Pré-Anesthésique (CPA) - Planning du jour</p>
          </div>
          <Link href="/bloc/rendez-vous" className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
            <span className="material-symbols-outlined">arrow_back</span> Retour aux Rendez-vous
          </Link>
        </div>

        {/* Filters Area */}
        <div className="bg-surface-container-low rounded-xl p-6 mb-8 flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Statut de Consultation</label>
            <div className="relative">
              <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}
                className="appearance-none bg-surface-container-lowest border-none rounded-lg text-sm font-medium py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-primary/20 min-w-[200px]">
                <option>Tous les statuts actifs</option>
                <option>Attendu</option>
                <option>En attente</option>
                <option>Urgent</option>
                <option>PLANIFIE</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Type d'Intervention</label>
            <div className="relative">
              <select value={filtreIntervention} onChange={e => setFiltreIntervention(e.target.value)}
                className="appearance-none bg-surface-container-lowest border-none rounded-lg text-sm font-medium py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-primary/20 min-w-[200px]">
                <option>Toutes les spécialités</option>
                <option>Cardiologie</option>
                <option>Orthopédie</option>
                <option>Digestif</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date</label>
            <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2.5 rounded-lg">
              <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_40px_rgba(7,30,39,0.04)] overflow-hidden flex flex-col max-h-[600px]">
          <div className="overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-surface-container-high">
                  <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Heure</th>
                  <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">ID / Dossier</th>
                  <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Intervention</th>
                  <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Chirurgien</th>
                  <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center">Statut</th>
                  <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {loading ? (
                  <tr><td colSpan={7} className="px-8 py-12 text-center text-on-surface-variant">Chargement des patients...</td></tr>
                ) : patientsFiltres.length === 0 ? (
                  <tr><td colSpan={7} className="px-8 py-12 text-center text-on-surface-variant">Aucun patient CPA pour cette date</td></tr>
                ) : patientsFiltres.map((c: any, i: number) => (
                  <tr key={c.id || i} className="hover:bg-surface-container-high/20 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-lg font-headline font-bold text-primary">{c.heureDebut}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${c.estUrgence ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-variant text-on-surface-variant'}`}>
                          {c.patient?.nom?.charAt(0) || '?'}{c.patient?.prenom?.charAt(0) || ''}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface leading-tight">{c.patient?.nom} {c.patient?.prenom}</p>
                          <p className="text-xs text-on-surface-variant">{c.patient?.dateNaissance ? new Date().getFullYear() - new Date(c.patient.dateNaissance).getFullYear() + ' ans' : ''} • {c.patient?.sexe || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-mono text-sm text-on-surface-variant">{c.patient?.idDossier || c.patientId}</td>
                    <td className="px-6 py-6 text-sm font-medium">{c.salle || '—'}</td>
                    <td className="px-6 py-6 text-sm">{c.chirurgien?.nom || '—'}</td>
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${c.estUrgence ? 'bg-tertiary text-on-tertiary' : c.statut === 'PLANIFIE' ? 'bg-surface-container-highest text-on-surface-variant' : 'bg-primary-fixed text-primary'}`}>
                        {c.estUrgence && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
                        {c.estUrgence ? 'Urgent' : c.statut === 'PLANIFIE' ? 'Attendu' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <button
                        onClick={() => router.push(`/bloc/consultation-cpa?patientId=${c.patient?.id}&patientNom=${encodeURIComponent(c.patient?.nom + ' ' + c.patient?.prenom)}&patientIpp=${encodeURIComponent(c.patient?.idDossier || '')}&patientAge=${c.patient?.dateNaissance ? new Date().getFullYear() - new Date(c.patient.dateNaissance).getFullYear() : ''}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all rounded-lg text-xs font-bold">
                        <span className="material-symbols-outlined text-[18px]">assignment_add</span> Réaliser CPA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
