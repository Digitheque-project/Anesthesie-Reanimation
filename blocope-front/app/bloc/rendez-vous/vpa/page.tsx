'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { planningService } from '@/lib/api';

export default function RendezVousVpaPage() {
  const router = useRouter();
  const [creneaux, setCreneaux] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filtreStatut, setFiltreStatut] = useState('Tous les statuts');

  useEffect(() => { charger(); }, [selectedDate]);
  const charger = async () => {
    setLoading(true);
    try { const data = await planningService.getJour(selectedDate, 'VPA'); setCreneaux(Array.isArray(data) ? data : []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-extrabold text-on-surface">Liste des Patients - Visite Pré-Anesthésique (VPA)</h2>
        <button onClick={() => router.push('/bloc/rendez-vous')} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
          <span className="material-symbols-outlined">arrow_back</span> Retour aux Rendez-vous
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-surface-container-low rounded-xl p-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase">Statut</label>
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} className="border rounded-lg p-2 text-sm">
            <option>Tous les statuts</option><option>PLANIFIE</option><option>Urgent</option><option>TERMINE</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase block mb-1">Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border rounded-lg p-2 text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-dim/40 sticky top-0">
              <tr>
                <th className="py-3 px-4 text-xs font-bold uppercase">Heure</th>
                <th className="py-3 px-4 text-xs font-bold uppercase">Patient</th>
                <th className="py-3 px-4 text-xs font-bold uppercase">Chirurgien</th>
                <th className="py-3 px-4 text-xs font-bold uppercase">Statut</th>
                <th className="py-3 px-4 text-xs font-bold uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500">Chargement...</td></tr>
              ) : creneaux.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500">Aucun patient VPA</td></tr>
              ) : creneaux.filter((c: any) => {
                if (filtreStatut === 'Tous les statuts') return true;
                if (filtreStatut === 'Urgent') return c.estUrgence;
                return c.statut === filtreStatut;
              }).map((c: any, i: number) => (
                <tr key={c.id || i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold">{c.heureDebut}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold">{c.patient?.nom} {c.patient?.prenom}</span>
                    <span className="text-xs text-gray-400 block">{c.patient?.idDossier || c.patientId}</span>
                  </td>
                  <td className="py-3 px-4">{c.chirurgien?.nom || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${c.estUrgence ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.estUrgence ? 'URGENT' : c.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => router.push(`/bloc/visite-pre-anesthesique?patientId=${c.patient?.id}&patientNom=${encodeURIComponent(c.patient?.nom + ' ' + c.patient?.prenom)}`)}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold">Réaliser VPA</button>
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
