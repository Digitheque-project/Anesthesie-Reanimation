'use client'

import { useEffect, useRef, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { useOperationRealtime } from '@/lib/hooks/useOperationRealtime'
import { CATALOGUE_MOMENTS, CategorieMoment } from '@/lib/data/catalogue-moments-operatoires'

type MomentOperatoire = {
  id: string
  label: string
  categorie: CategorieMoment
  estPersonnalise: boolean
  horodatage: string
  auteurNom: string
  auteurRole: string
  annule: boolean
  annuleParNom?: string | null
}

type Toast = { key: number; label: string; heureAffichee: string; promesse: Promise<MomentOperatoire | null> }

const formatHeure = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

// Timeline des moments opératoires : un tap sur un bouton horodate immédiatement le moment
// (capture client, avant même la réponse réseau) et l'annonce via un toast bas d'écran avec
// annulation possible — pas de confirmation bloquante, la vitesse de saisie prime en
// situation réelle. Synchronisé en temps réel entre tous les postes connectés sur ce patient.
export default function MomentsTimeline({ patientId }: { patientId: string }) {
  const [moments, setMoments] = useState<MomentOperatoire[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [labelPerso, setLabelPerso] = useState('')
  const [categoriePerso, setCategoriePerso] = useState<CategorieMoment>('DIVERS')
  const toastSeq = useRef(0)
  const { on } = useOperationRealtime(patientId)

  const upsertMoment = (moment: MomentOperatoire) => {
    setMoments(prev => {
      const idx = prev.findIndex(m => m.id === moment.id)
      const next = idx === -1 ? [...prev, moment] : prev.map((m, i) => (i === idx ? moment : m))
      return next.sort((a, b) => a.horodatage.localeCompare(b.horodatage))
    })
  }

  useEffect(() => {
    if (!patientId) return
    apiClient.get('/moments-operatoires', { params: { patientId } })
      .then(({ data }) => setMoments(data || []))
      .catch(console.error)
  }, [patientId])

  useEffect(() => on('moment:cree', (payload: any) => {
    if (payload?.patientId === patientId && payload?.moment) upsertMoment(payload.moment)
  }), [on, patientId])

  useEffect(() => on('moment:annule', (payload: any) => {
    if (payload?.patientId !== patientId) return
    setMoments(prev => prev.map(m => (m.id === payload.momentId ? { ...m, annule: true, annuleParNom: payload.annuleParNom } : m)))
  }), [on, patientId])

  const declencherMoment = (label: string, categorie: CategorieMoment, estPersonnalise = false) => {
    const horodatage = new Date().toISOString()
    const key = toastSeq.current++

    const promesse = apiClient
      .post('/moments-operatoires', { patientId, label, categorie, estPersonnalise, horodatage })
      .then(({ data }) => { upsertMoment(data); return data as MomentOperatoire })
      .catch((err) => { console.error(err); return null })

    setToasts(prev => [...prev, { key, label, heureAffichee: formatHeure(horodatage), promesse }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.key !== key)), 7000)
  }

  const annulerMoment = async (id: string) => {
    try {
      const { data } = await apiClient.patch(`/moments-operatoires/${id}/annuler`)
      upsertMoment(data)
    } catch (err) {
      console.error(err)
    }
  }

  const annulerDepuisToast = async (toast: Toast) => {
    setToasts(prev => prev.filter(t => t.key !== toast.key))
    const moment = await toast.promesse
    if (moment) annulerMoment(moment.id)
  }

  const ajouterMomentPersonnalise = () => {
    if (!labelPerso.trim()) return
    declencherMoment(labelPerso.trim(), categoriePerso, true)
    setLabelPerso('')
  }

  const categories = Object.keys(CATALOGUE_MOMENTS) as CategorieMoment[]

  return (
    <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-4">
      <h2 className="text-lg font-bold font-headline text-primary flex items-center gap-2">
        <span className="material-symbols-outlined">timeline</span> Chronologie de l'opération
      </h2>

      <div className="space-y-3">
        {categories.map((categorie) => (
          <div key={categorie}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
              {CATALOGUE_MOMENTS[categorie].titre}
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATALOGUE_MOMENTS[categorie].items.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => declencherMoment(label, categorie)}
                  className="px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm font-semibold hover:bg-primary-fixed/30 hover:border-primary transition-colors active:scale-95"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center pt-3 border-t border-outline-variant/20">
        <select
          value={categoriePerso}
          onChange={(e) => setCategoriePerso(e.target.value as CategorieMoment)}
          className="bg-surface-container-low border-none rounded-lg p-2 text-xs font-bold"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{CATALOGUE_MOMENTS[c].titre}</option>
          ))}
        </select>
        <input
          value={labelPerso}
          onChange={(e) => setLabelPerso(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ajouterMomentPersonnalise()}
          placeholder="+ Ajouter un moment personnalisé…"
          className="flex-1 bg-surface-container-low border-none rounded-lg p-2 text-sm"
        />
        <button type="button" onClick={ajouterMomentPersonnalise} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">
          Ajouter
        </button>
      </div>

      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Historique</h3>
        {moments.length === 0 ? (
          <p className="text-xs text-on-surface-variant">Aucun moment horodaté pour l'instant.</p>
        ) : (
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            {moments.map((m) => (
              <li
                key={m.id}
                className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${m.annule ? 'opacity-40 line-through' : 'bg-surface-container-low'}`}
              >
                <span className="font-semibold">{m.label}{m.estPersonnalise ? ' (perso.)' : ''}</span>
                <span className="text-xs text-on-surface-variant flex items-center gap-3">
                  <span>{formatHeure(m.horodatage)} · {m.auteurNom}</span>
                  {!m.annule && (
                    <button type="button" onClick={() => annulerMoment(m.id)} title="Annuler ce moment" className="text-error">
                      <span className="material-symbols-outlined text-base">undo</span>
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.key} className="bg-on-surface text-surface px-4 py-2 rounded-full shadow-lg flex items-center gap-3 text-sm">
            <span>{t.label} — {t.heureAffichee}</span>
            <button type="button" onClick={() => annulerDepuisToast(t)} className="font-bold underline">Annuler</button>
          </div>
        ))}
      </div>
    </section>
  )
}
