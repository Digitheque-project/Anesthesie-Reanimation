'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { patientService } from '@/lib/api'

export default function VisitePreAnesthesiquePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'SAFIDY Marie-Claire'
  const [patient, setPatient] = useState<any>(null)
  const [cpaId, setCpaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    dateVisite: new Date().toISOString().split('T')[0],
    identiteConfirmee: true, jeuneRespected: true, instructionsRespectees: true, premedicationFaite: true,
    jeune: '', examensComplementaires: '', heureDepart: '08:45',
  })

  useEffect(() => {
    if (patientId) {
      patientService.getById(patientId).then(setPatient).catch(console.error)
      apiClient.get(`/cpa?patientId=${patientId}`).then(res => {
        if (res.data?.data?.length > 0) setCpaId(res.data.data[0].id)
      }).catch(() => {})
    }
  }, [patientId])

  const estUrgent = patient?.niveauUrgence === 'URGENT' || patient?.niveauUrgence === 'STAT'

  const handleSubmit = async () => {
    if (!cpaId) {
      alert('⚠️ Aucune CPA trouvée pour ce patient. Veuillez d\'abord réaliser une CPA.')
      return
    }
    setLoading(true)
    try {
      await apiClient.post('/vpa', { patientId: patientId || patient?.id, cpaId, ...form })
      alert('✅ VPA validée avec succès !')
      router.push('/bloc/rendez-vous/vpa')
    } catch (err) { console.error(err); alert('❌ Erreur') }
    finally { setLoading(false) }
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-primary font-headline tracking-tight">Visite pré-Anesthésique</h1>
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
            <span className="material-symbols-outlined">arrow_back</span> Retour
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2.5 hover:bg-surface-container rounded-full transition-all text-on-surface-variant">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2.5 hover:bg-surface-container rounded-full transition-all text-on-surface-variant">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="h-10 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-on-surface">Dr. Jean-Pierre Moretti</p>
              <p className="text-[10px] text-on-surface-variant font-medium">Anesthésiste-Réanimateur</p>
            </div>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img alt="Profil" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqzn9s5fqmyi9el1jun6a_rEKedcoFpoY8qUKPPQMjmAVKf345JK69VC_87yOZIc8wlCW1LJE_GOkE8VzTBh_w13JSOhhbEUh9xSFbQisNiM17bqM5AVjm4YT1_l4pRDRKr742GmPxCDUdm0kLRi8AnavxSoPcqr6REojX2Qyc_r767jATTQz-WJ2iJOhWsAMV7piqH7CxbIVV0HNeKHMrMzNAIua5Tpuf2TFRU8FEGpK-bz_6w7zVKAqf3tYTl8QebeTasnN44DA" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient Context Header */}
      <div className="p-6 bg-white rounded-xl flex flex-wrap items-center justify-between gap-6 shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img alt="Patient Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5XefaqDtjR4FRKYIgCLijkKKQVp-CIW_NksRddAH5eXIHo9PCPlKYiKassETFGHQVdCayT3LKNe-Mjl6AnZ3bsXqZ_tYjDchj-pIm07M5n41av6ynti0OGpAGtduT0gDNdYSPQm02kedMxHeIoqgu6gfj7GE_LhD57nZGXb1bKw8wxLBO8dM_uRtlCOlKpflnR1sFUPdVwP3dYA_4rsDsGij67nrie9EPIUjkxl-dmcmzjRl2gdbXcsCK8Rte2KIlWylZmce5YJo" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-primary tracking-tight">{patientNom}</h2>
            <div className="flex gap-4 text-sm text-on-surface-variant font-medium">
              <span className="">{patient?.dateNaissance ? `Née le ${new Date(patient.dateNaissance).toLocaleDateString('fr-FR')} (${new Date().getFullYear() - new Date(patient.dateNaissance).getFullYear()} ans)` : '—'}</span>
              <span className="text-outline-variant">•</span>
              <span className="">IPP: {patient?.idDossier || '—'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {cpaId ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase tracking-wider">✅ CPA validée</span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-wider">⚠️ CPA non réalisée</span>
          )}
          <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${estUrgent ? 'bg-tertiary text-on-tertiary' : 'bg-secondary text-on-secondary'}`}>
            {estUrgent ? 'CHIRURGIE NON PROGRAMMÉE' : 'CHIRURGIE PROGRAMMÉE'}
          </span>
        </div>
      </div>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vérification de sécurité */}
        <section className="lg:col-span-8 bg-white rounded-xl p-8 shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
            <h3 className="text-xl font-bold text-on-surface">Vérification de sécurité</h3>
          </div>
          <div className="space-y-6">
            {[
              { icon: 'badge', titre: 'Identité du patient confirmée', desc: 'Vérification du bracelet et de l\'interrogatoire', key: 'identiteConfirmee' },
              { icon: 'fastfood', titre: 'Jeûne pré-opératoire respecté', desc: 'Dernière ingestion solide > 6h / Liquide > 2h', key: 'jeuneRespected' },
              { icon: 'assignment_turned_in', titre: 'Instructions pré-anesthésiques respectées', desc: 'Arrêt des traitements (Anticoagulants, etc.)', key: 'instructionsRespectees' },
            ].map(item => (
              <div key={item.key} className="p-6 bg-surface-container-low rounded-lg flex items-center justify-between group hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{item.titre}</p>
                    <p className="text-[11px] text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
                <div className="flex bg-white/80 p-1 rounded border border-outline-variant/30">
                  <button onClick={() => setForm({...form, [item.key]: true})}
                    className={`px-5 py-1.5 rounded font-bold text-xs transition-all ${form[item.key as keyof typeof form] ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-white'}`}>OUI</button>
                  <button onClick={() => setForm({...form, [item.key]: false})}
                    className={`px-5 py-1.5 rounded font-bold text-xs transition-all ${!form[item.key as keyof typeof form] ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-white'}`}>NON</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Décision CPA */}
        <section className="lg:col-span-4 bg-surface-container-high rounded-xl p-8 flex flex-col shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">history_edu</span>
            <h3 className="text-lg font-bold text-on-surface">Décision CPA</h3>
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-secondary shadow-sm">
              <p className="text-[9px] uppercase font-bold text-secondary tracking-widest mb-1">Score ASA</p>
              <p className="text-2xl font-black text-on-surface">ASA II</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">Protocole retenu</p>
              <p className="text-sm font-semibold text-on-surface leading-relaxed">Anesthésie Générale avec IOT.</p>
            </div>
          </div>
        </section>

        {/* Prémédication & Préparation */}
        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">medication_liquid</span>
              <h3 className="text-lg font-bold text-on-surface">Prémédication</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!form.premedicationFaite} onChange={e => setForm({...form, premedicationFaite: !e.target.checked})} className="w-4 h-4 text-primary rounded" />
                <span className="text-sm font-semibold">Non-faite</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.premedicationFaite} onChange={e => setForm({...form, premedicationFaite: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                <span className="text-sm font-semibold">Faite</span>
              </label>
            </div>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">clinical_notes</span>
              <h3 className="text-lg font-bold text-on-surface">Préparation</h3>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-semibold">Jeûne complet à partir de...</label>
              <input className="w-full bg-surface-container-low border border-outline-variant/30 rounded text-sm px-3 py-2" placeholder="Heure ou instructions..." type="text" value={form.jeune} onChange={e => setForm({...form, jeune: e.target.value})} />
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <section className="lg:col-span-12 flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-surface-container text-on-surface rounded-xl shadow-sm border border-outline-variant/30">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex flex-col items-center md:items-start">
              <label className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">Heure de départ au bloc</label>
              <div className="flex items-center gap-3 text-3xl font-black">
                <span className="material-symbols-outlined text-4xl text-primary">schedule</span>
                <input className="bg-transparent border-none focus:ring-0 text-3xl p-0 font-black cursor-pointer text-primary w-24" type="time" value={form.heureDepart} onChange={e => setForm({...form, heureDepart: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button onClick={() => router.push('/bloc/checklist-oms')} className="px-6 py-4 border-2 border-primary/30 text-primary rounded-lg font-bold text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">fact_check</span> ACCÉDER À LA CHECKLIST-OMS
            </button>
            <button onClick={handleSubmit} disabled={loading || !cpaId}
              className={`px-10 py-4 rounded-lg font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 ${
                cpaId ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}>
              <span className="material-symbols-outlined font-bold">check_circle</span>
              {!cpaId ? 'CPA REQUISE' : loading ? 'VALIDATION...' : 'VALIDER LA VPA'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
