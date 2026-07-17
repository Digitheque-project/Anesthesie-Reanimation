'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { useRole } from '@/lib/hooks/useRole'
import ModalPlanifierRDV from '@/components/bloc/notification-cpa/ModalPlanifierRDV'

const LIBELLES_STATUT: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  CPA_PLANIFIEE: 'CPA planifiée',
  CPA_REALISEE: 'CPA réalisée',
  VPA_PLANIFIEE: 'Vérification veille planifiée',
  VPA_REALISEE: 'Vérification veille réalisée',
  CONFIRMEE: 'Confirmée',
  REPORTEE: 'Reportée',
  ANNULEE: 'Annulée',
}

const COULEURS_STATUT: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-100 text-amber-700',
  CPA_PLANIFIEE: 'bg-blue-100 text-blue-700',
  CPA_REALISEE: 'bg-emerald-100 text-emerald-700',
  VPA_PLANIFIEE: 'bg-blue-100 text-blue-700',
  VPA_REALISEE: 'bg-emerald-100 text-emerald-700',
  CONFIRMEE: 'bg-emerald-100 text-emerald-700',
  REPORTEE: 'bg-orange-100 text-orange-700',
  ANNULEE: 'bg-gray-200 text-gray-600',
}

export default function DemandesCpaExternesPage() {
  const { peutPlanifierCpa, roleName } = useRole()
  const [demandes, setDemandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const charger = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/demandes-cpa-externes', { params: filtreStatut ? { statut: filtreStatut } : {} })
      setDemandes(Array.isArray(data) ? data : [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { charger() }, [filtreStatut])

  const ouvrirPlanification = (demande: any) => {
    if (!peutPlanifierCpa) { alert('❌ Planification réservée au Responsable CPA ou au Major'); return }
    setSelected(demande)
    setShowModal(true)
  }

  const handleValider = async (formData: any) => {
    if (!selected) return
    try {
      const [h, m] = (formData.heureRDV || '09:00').split(':').map(Number)
      const fin = new Date(); fin.setHours(h, m + 30)
      const heureFin = fin.toTimeString().split(' ')[0].substring(0, 5)

      await apiClient.patch(`/demandes-cpa-externes/${selected.id}/planifier`, {
        type: formData.typeRDV || 'CPA',
        date: formData.dateRDV,
        heureDebut: formData.heureRDV,
        heureFin,
        salle: formData.lieuRDV,
      })

      alert('✅ Rendez-vous planifié — la demande externe est mise à jour')
      setShowModal(false)
      setSelected(null)
      charger()
    } catch (err: any) {
      console.error(err)
      alert('❌ Erreur : ' + (err.response?.data?.message || err.message || 'Erreur inconnue'))
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface font-headline tracking-tight">Demandes de CPA externes</h1>
          <p className="text-sm text-on-surface-variant mt-1">Demandes de CPA/VPA envoyées par d'autres services du CHU (ex : Endoscopie).</p>
        </div>
        <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}
          className="px-4 py-2 border border-outline-variant/50 rounded-lg text-sm font-bold bg-white w-fit">
          <option value="">Tous les statuts</option>
          {Object.entries(LIBELLES_STATUT).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {!peutPlanifierCpa && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          La planification est réservée au Responsable CPA ou au Major{roleName ? ` (votre rôle : ${roleName})` : ''}. Vous pouvez consulter la liste.
        </div>
      )}

      <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-y-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-container/30">
              <tr className="text-on-surface-variant border-b border-outline-variant/20">
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Reçue le</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Patient</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Service demandeur</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Motif</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Urgence</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest">Statut</th>
                <th className="px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">Chargement...</td></tr>
              ) : demandes.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">Aucune demande</td></tr>
              ) : demandes.map((d: any) => (
                <tr key={d.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono">{d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-on-surface text-sm">{d.patientId}</div>
                    <div className="text-[10px] text-on-surface-variant">{d.typeAnesthesie}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{d.sourceServiceName || d.sourceServiceId}</td>
                  <td className="px-6 py-4 text-sm max-w-[220px] truncate" title={d.motif}>{d.motif || '—'}</td>
                  <td className="px-6 py-4">
                    {d.urgence >= 4 ? (
                      <span className="px-3 py-1 bg-tertiary text-on-tertiary text-[10px] font-black rounded uppercase">URGENT</span>
                    ) : (
                      <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-black rounded uppercase">Niveau {d.urgence ?? '—'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${COULEURS_STATUT[d.statut] || 'bg-gray-100 text-gray-700'}`}>
                      {LIBELLES_STATUT[d.statut] || d.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {d.statut === 'EN_ATTENTE' ? (
                      <button
                        onClick={() => ouvrirPlanification(d)}
                        disabled={!peutPlanifierCpa}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Planifier
                      </button>
                    ) : (
                      <span className="text-xs text-on-surface-variant">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ModalPlanifierRDV
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onValider={handleValider}
          patientNom={selected.patientId}
          intervention={selected.motif || selected.typeAnesthesie}
          estUrgent={(selected.urgence ?? 0) >= 4}
        />
      )}
    </div>
  )
}
