'use client'
import { Suspense } from "react";

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

export default function ActivitePendantOperationPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ActivitePendantOperationPageContent />
    </Suspense>
  );
}

function ActivitePendantOperationPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'RADALO Jean-Pierre'
  const intervention = searchParams.get('intervention') || 'Chirurgie Digestive'

  // État du formulaire
  const [form, setForm] = useState({
    dateOperation: new Date().toISOString().split('T')[0],
    chirurgienId: '', anesthesisteId: '',
    perfusions: '', transfusions: '', journalSorties: '',
    fc: '', ta: '', spo2: '', spo3: '', score: '', capnie: '', temperature: '',
    intubationOT: false, sArme: false, masqueLarynge: false,
    ventilationSpontanee: '', ventilationAssistee: '', ventilationControlee: '', ventilationPEEP: '', ventilationCircuitFerme: '',
    etatArrivee: '',
  })

  // 🔄 État pour la liste des constantes
  const [constantesList, setConstantesList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [chrono, setChrono] = useState(0) // en secondes
  const [isChronoRunning, setIsChronoRunning] = useState(false)
  const [showAlerte, setShowAlerte] = useState(false)
  const chronoInterval = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Créer l'élément audio pour la sonnerie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Créer un son simple avec Web Audio API
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContext) {
          const ctx = new AudioContext()
          const oscillator = ctx.createOscillator()
          const gain = ctx.createGain()
          oscillator.connect(gain)
          gain.connect(ctx.destination)
          oscillator.type = 'sine'
          oscillator.frequency.value = 800
          gain.gain.value = 0.3
          // Stocker pour jouer plus tard
          audioRef.current = {
            play: () => {
              try {
                const ctx2 = new AudioContext()
                const osc = ctx2.createOscillator()
                const gain2 = ctx2.createGain()
                osc.connect(gain2)
                gain2.connect(ctx2.destination)
                osc.type = 'square'
                osc.frequency.value = 880
                gain2.gain.value = 0.2
                osc.start()
                setTimeout(() => {
                  osc.frequency.value = 660
                  setTimeout(() => {
                    osc.frequency.value = 880
                    setTimeout(() => {
                      osc.stop()
                      ctx2.close()
                    }, 300)
                  }, 300)
                }, 300)
                setTimeout(() => {
                  try { osc.stop(); ctx2.close() } catch(e) {}
                }, 2000)
              } catch(e) { /* fallback */ }
            }
          } as any
        }
      } catch(e) { /* fallback */ }
    }
  }, [])

  // Vérifier les 5 minutes (300 secondes)
  useEffect(() => {
    if (chrono >= 300 && isChronoRunning) {
      // Alerter
      setShowAlerte(true)
      
      // Jouer la sonnerie
      if (audioRef.current) {
        try { (audioRef.current as any).play() } catch(e) {}
      }
      
      // Alternative: utiliser l'API Notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ ALERTE 5 MINUTES ÉCOULÉES !', {
          body: 'Veuillez ajouter de nouvelles constantes vitales.',
          icon: '/images/chu-logo.svg'
        })
      }
      
      // Demander la permission de notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [chrono, isChronoRunning])

  // Démarrer le chrono au chargement
  useEffect(() => {
    demarrerChrono()
    return () => {
      if (chronoInterval.current) clearInterval(chronoInterval.current)
    }
  }, [])

  // Fonction pour démarrer le chrono
  const demarrerChrono = () => {
    if (chronoInterval.current) clearInterval(chronoInterval.current)
    setIsChronoRunning(true)
    chronoInterval.current = setInterval(() => {
      setChrono(prev => prev + 1)
    }, 1000)
  }

  // Fonction pour arrêter le chrono
  const arreterChrono = () => {
    if (chronoInterval.current) {
      clearInterval(chronoInterval.current)
      chronoInterval.current = null
    }
    setIsChronoRunning(false)
  }

  // Fonction pour réinitialiser le chrono
  const reinitialiserChrono = () => {
    setChrono(0)
    setShowAlerte(false)
    if (!isChronoRunning) {
      demarrerChrono()
    }
  }

  // Formater le temps (MM:SS)
  const formaterTemps = (secondes: number) => {
    const mins = Math.floor(secondes / 60)
    const secs = secondes % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Ajouter une nouvelle mesure de constantes
  const ajouterConstantes = () => {
    const nouvelleConstante = {
      heure: new Date().toTimeString().split(' ')[0].substring(0, 5),
      tempsOperation: formaterTemps(chrono),
      fc: form.fc || '0',
      ta: form.ta || '0/0',
      spo2: form.spo2 || '0',
      spo3: form.spo3 || '0',
      score: form.score || '0',
      capnie: form.capnie || '0',
      temperature: form.temperature || '0',
    }
    setConstantesList([...constantesList, nouvelleConstante])
    
    // Réinitialiser les champs pour la prochaine saisie
    setForm({
      ...form,
      fc: '',
      ta: '',
      spo2: '',
      spo3: '',
      score: '',
      capnie: '',
      temperature: '',
    })
    
    // Réinitialiser le chrono pour la prochaine mesure
    reinitialiserChrono()
    setShowAlerte(false)
  }

  // Supprimer une mesure de constantes
  const supprimerConstante = (index: number) => {
    setConstantesList(constantesList.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const constantes = constantesList.map(c => ({
        heure: c.heure,
        fc: Number(c.fc) || 0,
        ta: c.ta || '0/0',
        spo2: Number(c.spo2) || 0,
        temperature: Number(c.temperature) || 0,
        capnie: Number(c.capnie) || 0,
        score: Number(c.score) || 0,
      }))

      await apiClient.post('/activites-per-op', {
        patientId,
        chirurgienId: '',
        anesthesisteId: '',
        dateOperation: form.dateOperation,
        perfusions: form.perfusions,
        transfusions: form.transfusions,
        journalSorties: form.journalSorties,
        intubationOT: form.intubationOT,
        sArme: form.sArme,
        masqueLarynge: form.masqueLarynge,
        ventilation: {
          spontanee: form.ventilationSpontanee,
          assistee: form.ventilationAssistee,
          controlee: form.ventilationControlee,
          peep: form.ventilationPEEP,
          circuitFerme: form.ventilationCircuitFerme,
        },
        constantes,
        etatArrivee: form.etatArrivee ? [form.etatArrivee] : [],
      })
      
      alert(`✅ Activité enregistrée avec ${constantesList.length} mesures de constantes !`)
      router.push('/bloc/protocole-operatoire?patientId=' + patientId + '&patientNom=' + encodeURIComponent(patientNom))
    } catch (err) {
      console.error(err)
      alert('❌ Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const ETATS = ['CALME', 'DETENDU', 'ANXIEUX', 'AGITE']

  return (
    <main className="p-6">
      {/* 🚨 ALERTE 5 MINUTES - FENÊTRE MODALE D'URGENCE */}
      {showAlerte && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-pulse">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-red-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-4xl">🚨</span>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-red-600">ALERTE 5 MINUTES !</h2>
                <p className="text-sm text-red-500 font-bold">Temps écoulé sans surveillance</p>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
              <p className="text-lg font-bold text-red-700 text-center">
                ⏱ {formaterTemps(chrono)} écoulés
              </p>
              <p className="text-sm text-red-600 text-center mt-1">
                Veuillez ajouter de nouvelles constantes vitales
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  // Faire défiler jusqu'au formulaire
                  document.getElementById('constantes-form')?.scrollIntoView({ behavior: 'smooth' })
                  setShowAlerte(false)
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span className="text-xl">📝</span>
                Ajouter les constantes maintenant
              </button>
              <button
                onClick={() => {
                  reinitialiserChrono()
                  setShowAlerte(false)
                }}
                className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all"
              >
                ⏱ Réinitialiser le chrono
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-xl z-50 sticky top-0 border-b border-surface-container-highest shadow-sm flex justify-between items-center w-full px-6 py-2">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-0.5">Patient en cours</span>
            <h2 className="font-headline font-bold text-lg text-on-surface leading-tight">{patientNom}</h2>
          </div>
          <div className="h-10 w-px bg-surface-container-highest"></div>
          <div className="grid grid-cols-4 gap-x-8 gap-y-1">
            <div><p className="text-[9px] text-on-surface-variant font-semibold uppercase tracking-tighter">ID / MRN</p><p className="font-label text-xs font-bold text-on-surface">#982-CH-2024</p></div>
            <div><p className="text-[9px] text-on-surface-variant font-semibold uppercase tracking-tighter">Opération</p><p className="font-label text-xs font-bold text-on-surface truncate">{intervention}</p></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Retour
          </button>
          <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 border ${chrono >= 300 && isChronoRunning ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-tertiary/10 text-tertiary border-tertiary/20'}`}>
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full ${chrono >= 300 && isChronoRunning ? 'bg-white animate-ping' : 'bg-tertiary opacity-75'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${chrono >= 300 && isChronoRunning ? 'bg-white' : 'bg-tertiary'}`}></span>
            </span>
            <span className="text-[10px] font-extrabold tracking-wider">
              {chrono >= 300 && isChronoRunning ? '⚠️ ALERTE 5 MIN' : 'PROCÉDURE EN COURS'}
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        {/* Section 1: APPORTS */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">input</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">APPORTS (ENTRÉES)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">PERFUSIONS</label><textarea className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" rows={3} placeholder="Saisir les détails..." value={form.perfusions} onChange={e => setForm({...form, perfusions: e.target.value})}></textarea></div>
            <div className="space-y-2"><label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">TRANSFUSIONS</label><textarea className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none" rows={3} placeholder="Saisir les détails..." value={form.transfusions} onChange={e => setForm({...form, transfusions: e.target.value})}></textarea></div>
          </div>
        </section>

        {/* Section 2: SORTIES */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">output</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">SORTIES</h3>
          </div>
          <div className="p-6"><div className="space-y-2"><label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">JOURNAL DES SORTIES</label><textarea className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-4 text-sm focus:ring-2 focus:ring-primary outline-none" rows={4} placeholder="Quantifier et décrire..." value={form.journalSorties} onChange={e => setForm({...form, journalSorties: e.target.value})}></textarea></div></div>
        </section>

        {/* Section 3: SURVEILLANCE DES CONSTANTES - MODIFIÉE AVEC CHRONO */}
        <section id="constantes-form" className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">monitoring</span>
              <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">SURVEILLANCE DES CONSTANTES</h3>
            </div>
            {/* 🟢 Chronomètre avec alerte visuelle */}
            <div className="flex items-center gap-3">
              <div className={`px-4 py-1.5 rounded-lg border ${chrono >= 300 && isChronoRunning ? 'bg-red-100 border-red-300 animate-pulse' : 'bg-secondary/10 border-secondary/20'}`}>
                <span className="text-xs font-bold uppercase tracking-wider">⏱ Temps écoulé</span>
                <span className={`ml-2 text-lg font-black font-mono ${chrono >= 300 && isChronoRunning ? 'text-red-600' : 'text-secondary'}`}>
                  {formaterTemps(chrono)}
                </span>
                {chrono >= 300 && isChronoRunning && (
                  <span className="ml-2 text-red-500 text-xs font-bold animate-pulse">🚨 ALERTE</span>
                )}
              </div>
              <button
                onClick={reinitialiserChrono}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600"
                title="Réinitialiser le chrono"
              >
                ↺
              </button>
            </div>
          </div>
          
          {/* Liste des constantes enregistrées */}
          {constantesList.length > 0 && (
            <div className="px-6 pt-4">
              <p className="text-xs font-bold text-on-surface-variant mb-2">📊 Mesures enregistrées ({constantesList.length})</p>
              <div className="max-h-48 overflow-y-auto border border-outline-variant/20 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-surface-container-low sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-bold text-on-surface-variant">Heure</th>
                      <th className="px-2 py-1.5 text-left font-bold text-on-surface-variant">Temps op</th>
                      <th className="px-2 py-1.5 text-left font-bold text-on-surface-variant">FC</th>
                      <th className="px-2 py-1.5 text-left font-bold text-on-surface-variant">TA</th>
                      <th className="px-2 py-1.5 text-left font-bold text-on-surface-variant">SPO2</th>
                      <th className="px-2 py-1.5 text-left font-bold text-on-surface-variant">Temp</th>
                      <th className="px-2 py-1.5 text-left font-bold text-on-surface-variant">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {constantesList.map((c, index) => (
                      <tr key={index} className="hover:bg-surface-container-low/50">
                        <td className="px-2 py-1.5 font-mono">{c.heure}</td>
                        <td className="px-2 py-1.5 font-mono">{c.tempsOperation}</td>
                        <td className="px-2 py-1.5">{c.fc}</td>
                        <td className="px-2 py-1.5">{c.ta}</td>
                        <td className="px-2 py-1.5">{c.spo2}</td>
                        <td className="px-2 py-1.5">{c.temperature}</td>
                        <td className="px-2 py-1.5">
                          <button
                            onClick={() => supprimerConstante(index)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Formulaire de saisie des constantes */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: 'FC (BPM)', key: 'fc' },
                { label: 'TA (MMHG)', key: 'ta' },
                { label: 'SPO2 (%)', key: 'spo2' },
                { label: 'SPO3 (%)', key: 'spo3' },
                { label: 'SCORE', key: 'score' },
                { label: 'CAPNIE', key: 'capnie' },
                { label: 'TEMPÉRATURE (°C)', key: 'temperature' }
              ].map(item => (
                <div key={item.key} className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase">{item.label}</label>
                  <input
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                    placeholder="--"
                    type="text"
                    value={form[item.key as keyof typeof form] as string}
                    onChange={e => setForm({...form, [item.key]: e.target.value})}
                  />
                </div>
              ))}
            </div>
            
            {/* 🟢 Bouton Ajouter une surveillance */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={ajouterConstantes}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Ajouter une surveillance
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: VENTILATION */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">ventilator</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">VENTILATION</h3>
          </div>
          <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: 'intubationOT', label: 'INTUB - OT' },
              { key: 'sArme', label: 'S.ARMEE' },
              { key: 'masqueLarynge', label: 'M.LARYNCE' }
            ].map(item => (
              <div key={item.key} className="flex items-center gap-4 bg-background p-4 rounded-lg border border-surface-container-highest">
                <input
                  className="w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary cursor-pointer"
                  type="checkbox"
                  checked={form[item.key as keyof typeof form] as boolean}
                  onChange={e => setForm({...form, [item.key]: e.target.checked})}
                />
                <span className="text-xs font-bold text-on-surface uppercase">{item.label}</span>
              </div>
            ))}
          </div></div>
        </section>

        {/* Section 5: OPTIONS DE VENTILATION */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">settings_input_component</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">OPTIONS DE VENTILATION</h3>
          </div>
          <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { label: 'Spontanée', key: 'ventilationSpontanee' },
              { label: 'Assistée', key: 'ventilationAssistee' },
              { label: 'Controlée', key: 'ventilationControlee' },
              { label: 'PEEP', key: 'ventilationPEEP' },
              { label: 'Circuit fermé', key: 'ventilationCircuitFerme' }
            ].map(item => (
              <div key={item.key} className="flex flex-col gap-2">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</label>
                <input
                  className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Détails..."
                  type="text"
                  value={form[item.key as keyof typeof form] as string}
                  onChange={e => setForm({...form, [item.key]: e.target.value})}
                />
              </div>
            ))}
          </div></div>
        </section>

        {/* Section 6: PATIENT À L'ARRIVÉE */}
        <section className="bg-white rounded-xl shadow-sm border border-surface-container-highest overflow-hidden">
          <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">psychology</span>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-wide text-sm">PATIENT À L'ARRIVÉE</h3>
          </div>
          <div className="p-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ETATS.map(etat => (
              <label key={etat} className={`flex items-center justify-center gap-4 p-5 bg-background rounded-xl border-2 cursor-pointer hover:bg-surface-container-low transition-all group ${form.etatArrivee === etat ? 'border-primary bg-primary/5' : 'border-surface-container-highest'}`}>
                <input
                  className="w-6 h-6 text-primary border-outline-variant rounded focus:ring-primary cursor-pointer"
                  type="radio"
                  name="etatArrivee"
                  checked={form.etatArrivee === etat}
                  onChange={() => setForm({...form, etatArrivee: etat})}
                />
                <span className="text-sm font-extrabold text-on-surface-variant uppercase tracking-widest group-hover:text-primary">{etat}</span>
              </label>
            ))}
          </div></div>
        </section>

        {/* VALIDER */}
        <div className="flex justify-end pt-4 pb-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary text-white px-8 py-4 rounded-xl font-headline font-extrabold shadow-lg hover:bg-primary-container hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <span className="material-symbols-outlined">save</span>
            {loading ? 'ENREGISTREMENT...' : `VALIDER (${constantesList.length} mesures)`}
          </button>
        </div>
      </div>
    </main>
  )
}
