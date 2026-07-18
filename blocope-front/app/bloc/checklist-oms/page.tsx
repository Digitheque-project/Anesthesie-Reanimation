'use client'
import { Suspense } from "react";

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { useRole } from '@/lib/hooks/useRole'

export default function ChecklistAvantOpPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ChecklistAvantOpPageContent />
    </Suspense>
  );
}

function ChecklistAvantOpPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'Patient'
  const intervention = searchParams.get('intervention') || ''

  const [form, setForm] = useState({
    dateCreation: new Date().toISOString().split('T')[0],
    identiteConfirmee: false, interventionSiteConfirmes: false, documentationDisponible: false,
    installationConnue: false, materielChirurgicalVerifie: false, materielAnesthesiqueVerifie: false,
    allergiePatient: false, risqueIntubation: false, risqueSaignement: false,
    notesChirurgicales: '', notesAnesthesiques: '', notesIdeIbode: '',
  })
  const [loading, setLoading] = useState(false)
  const { estAnesthesiste, roleName } = useRole()

  const handleSubmit = async () => {
    if (!estAnesthesiste) {
      alert('❌ La check-list avant opération est réservée à l\'anesthésiste.' + (roleName ? ` Votre rôle actuel est : ${roleName}.` : ''))
      return
    }
    // ✅ SUPPRIMÉ : Vérification des médicaments
    // La validation est maintenant directe vers l'activité per-op

    setLoading(true)
    try {
      // Envoyer la checklist au backend
      await apiClient.post('/checklists-avant-op', { patientId, ...form })
      console.log('✅ Checklist avant opération validée')
      
      // Rediriger vers le Time Out (dernière pause d'équipe avant incision)
      router.push(`/bloc/verification-post-op?patientId=${patientId}&patientNom=${encodeURIComponent(patientNom)}&intervention=${encodeURIComponent(intervention)}`)
      
    } catch (err: any) {
      console.error('❌ Erreur validation checklist:', err)
      const message = err.response?.data?.message || err.message || 'Erreur inconnue'
      alert('❌ Erreur : ' + (Array.isArray(message) ? message.join(', ') : message))
    }
    finally { setLoading(false) }
  }

  return (
    <main className="p-6">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center gap-4">
        <button onClick={() => router.back()} className="flex items-center space-x-2 px-6 py-2.5 border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-all font-semibold shrink-0 order-first">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="text-sm">Retour</span>
        </button>
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">Check-list avant opération</h1>
          <p className="text-on-surface-variant mt-2 text-lg">{patientNom} — {intervention}</p>
        </div>
      </header>

      {!estAnesthesiste && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          La check-list avant opération est réservée à l'anesthésiste{roleName ? ` (votre rôle actuel est : ${roleName})` : ''}. Vous pouvez consulter cet écran mais pas la valider.
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PHASE 1: AVANT INDUCTION */}
        <section className="bg-surface-container-low rounded-xl p-6 shadow-sm border-t-4 border-primary">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">timer_10_alt_1</span>
            </div>
            <h2 className="text-xl font-headline font-bold text-primary uppercase tracking-wide">Avant Induction Anesthésique</h2>
          </div>
          <p className="text-xs italic text-on-surface-variant mb-6">Temps de pause avant anesthésie</p>
          <div className="space-y-4">
            {/* 1. Identity */}
            <div className="bg-white p-4 rounded-lg border border-outline-variant/10">
              <p className="text-sm font-bold text-primary mb-3">1- Identité du patient :</p>
              <p className="text-xs mb-3">- le patient a décliné son nom. Sinon par défaut, autre moyen de vérification de son identité</p>
              <div className="flex space-x-6">
                <label className="flex items-center text-xs font-medium cursor-pointer">
                  <input className="mr-2 text-primary focus:ring-primary w-4 h-4" name="identity_check" type="radio" checked={form.identiteConfirmee} onChange={() => setForm({...form, identiteConfirmee: true})} /><span>Oui</span>
                </label>
                <label className="flex items-center text-xs font-medium cursor-pointer">
                  <input className="mr-2 text-primary focus:ring-primary w-4 h-4" name="identity_check" type="radio" checked={!form.identiteConfirmee} onChange={() => setForm({...form, identiteConfirmee: false})} /><span>Non</span>
                </label>
              </div>
            </div>

            {/* 2. Intervention & Site */}
            <div className="bg-white p-4 rounded-lg border border-outline-variant/10">
              <p className="text-sm font-bold text-primary mb-3">2- L'intervention et site opération sont confirmés :</p>
              <p className="text-xs mb-2">- Idéalement par le patient et dans tous les cas, par le dossier ou procédure spécifique</p>
              <div className="flex space-x-6 mb-3">
                <label className="flex items-center text-xs font-medium cursor-pointer"><input className="mr-2 text-primary w-4 h-4" type="radio" checked={form.interventionSiteConfirmes} onChange={() => setForm({...form, interventionSiteConfirmes: true})} /> Oui</label>
                <label className="flex items-center text-xs font-medium cursor-pointer"><input className="mr-2 text-primary w-4 h-4" type="radio" checked={!form.interventionSiteConfirmes} onChange={() => setForm({...form, interventionSiteConfirmes: false})} /> Non</label>
              </div>
              <p className="text-xs mb-2">- La documentation clinique et para-clinique nécessaire est disponible en salle</p>
              <div className="flex space-x-6">
                <label className="flex items-center text-xs font-medium cursor-pointer"><input className="mr-2 text-primary w-4 h-4" type="radio" checked={form.documentationDisponible} onChange={() => setForm({...form, documentationDisponible: true})} /> Oui</label>
                <label className="flex items-center text-xs font-medium cursor-pointer"><input className="mr-2 text-primary w-4 h-4" type="radio" checked={!form.documentationDisponible} onChange={() => setForm({...form, documentationDisponible: false})} /> Non</label>
              </div>
            </div>

            {/* 3. Installation */}
            <div className="bg-white p-4 rounded-lg border border-outline-variant/10">
              <p className="text-sm font-bold text-primary mb-3">3- Le mode d'installation est :</p>
              <p className="text-xs mb-3">Connu de l'équipe en salle.</p>
              <div className="flex space-x-6">
                <label className="flex items-center text-xs font-medium cursor-pointer"><input className="mr-2 text-primary w-4 h-4" type="radio" checked={form.installationConnue} onChange={() => setForm({...form, installationConnue: true})} /> Oui</label>
                <label className="flex items-center text-xs font-medium cursor-pointer"><input className="mr-2 text-primary w-4 h-4" type="radio" checked={!form.installationConnue} onChange={() => setForm({...form, installationConnue: false})} /> N/A</label>
              </div>
            </div>

            {/* 4. Equipment */}
            <div className="bg-white p-4 rounded-lg border border-outline-variant/10">
              <p className="text-sm font-bold text-primary mb-3">4- Le matériel nécessaire pour l'intervention est vérifié :</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs">- pour la partie chirurgicale...</span>
                  <label className="flex items-center text-xs"><input className="mr-1 w-4 h-4 rounded text-primary" type="checkbox" checked={form.materielChirurgicalVerifie} onChange={e => setForm({...form, materielChirurgicalVerifie: e.target.checked})} /> oui</label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">- pour la partie anesthésique</span>
                  <label className="flex items-center text-xs"><input className="mr-1 w-4 h-4 rounded text-primary" type="checkbox" checked={form.materielAnesthesiqueVerifie} onChange={e => setForm({...form, materielAnesthesiqueVerifie: e.target.checked})} /> oui</label>
                </div>
              </div>
            </div>

            {/* 5. Cross-verification */}
            <div className="bg-white p-4 rounded-lg border border-error/20">
              <p className="text-sm font-bold text-error mb-3">5- Vérification croisée par l'équipe :</p>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant/70 mb-3">Points critiques et mesures adéquates à prendre</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs">- Allergie du patient</span>
                  <label className="flex items-center text-xs"><input className="mr-1 w-4 h-4 rounded text-error" type="checkbox" checked={form.allergiePatient} onChange={e => setForm({...form, allergiePatient: e.target.checked})} /> oui</label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs leading-tight">- Risque d'inhalation, de difficulté d'intubation</span>
                  <label className="flex items-center text-xs"><input className="mr-1 w-4 h-4 rounded text-error" type="checkbox" checked={form.risqueIntubation} onChange={e => setForm({...form, risqueIntubation: e.target.checked})} /> oui</label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">- Risque de saignement important</span>
                  <label className="flex items-center text-xs"><input className="mr-1 w-4 h-4 rounded text-error" type="checkbox" checked={form.risqueSaignement} onChange={e => setForm({...form, risqueSaignement: e.target.checked})} /> oui</label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRANSMISSION D'ÉQUIPE — la vérification "ultime" (identité, intervention, site,
            antibioprophylaxie...) juste avant l'incision se fait sur l'écran Time Out séparé
            (checklist pendant-op), pour éviter de la saisir deux fois. */}
        <section className="bg-surface-container-low rounded-xl p-6 shadow-sm border-t-4 border-secondary">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">forum</span>
            </div>
            <h2 className="text-xl font-headline font-bold text-secondary uppercase tracking-wide">Transmission d'équipe</h2>
          </div>
          <p className="text-xs italic text-on-surface-variant mb-6">Informations essentielles à partager sur les éléments à risque</p>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-outline-variant/10">
              <div className="space-y-4">
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-xs font-bold text-primary">- Sur le plan chirurgical</p>
                  <textarea value={form.notesChirurgicales} onChange={e => setForm({...form, notesChirurgicales: e.target.value})} className="w-full text-xs border border-outline-variant/20 bg-white rounded-md p-2 focus:ring-1 focus:ring-primary focus:outline-none h-16 mt-2" placeholder="Notes chirurgie..."></textarea>
                </div>
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-xs font-bold text-secondary">- Sur le plan anesthésique</p>
                  <textarea value={form.notesAnesthesiques} onChange={e => setForm({...form, notesAnesthesiques: e.target.value})} className="w-full text-xs border border-outline-variant/20 bg-white rounded-md p-2 focus:ring-1 focus:ring-secondary focus:outline-none h-16 mt-2" placeholder="Notes anesthésie..."></textarea>
                </div>
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-xs font-bold text-on-surface-variant">- IDE / IBODE</p>
                  <textarea value={form.notesIdeIbode} onChange={e => setForm({...form, notesIdeIbode: e.target.value})} className="w-full text-xs border border-outline-variant/20 bg-white rounded-md p-2 focus:ring-1 focus:outline-none h-16 mt-2" placeholder="Notes IDE/IBODE..."></textarea>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="mt-12 flex justify-end items-center">
        <button onClick={handleSubmit} disabled={loading || !estAnesthesiste}
          title={!estAnesthesiste ? 'Réservé à l\'anesthésiste' : undefined}
          className="flex items-center space-x-2 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <span>{loading ? 'Validation...' : !estAnesthesiste ? 'Accès non autorisé' : 'Valider la check-list'}</span>
        </button>
      </div>
    </main>
  )
}
