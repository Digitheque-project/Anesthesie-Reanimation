'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

export default function ArchiveDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [dossier, setDossier] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patientId) return
    ;(async () => {
      setLoading(true)
      try {
        const { data } = await apiClient.get(`/archives/dossier/${patientId}`)
        setDossier(data)
      } catch (err) {
        console.error('Erreur chargement dossier:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [patientId])

  if (loading) return <main className="md:pl-72 p-8"><div className="max-w-4xl mx-auto text-on-surface-variant">Chargement du dossier...</div></main>
  if (!dossier) return <main className="md:pl-72 p-8"><div className="max-w-4xl mx-auto text-on-surface-variant">Dossier introuvable.</div></main>

  const p = dossier.patient || {}
  const protocole = dossier.protocolesOperatoires?.[0] || {}
  const activite = dossier.activitesPerOp?.[0] || {}
  const score = dossier.scoresSCCRE?.[0] || {}
  const sortie = dossier.sortiesReveil?.[0] || {}

  // Calculs d'affichage
  const age = p.dateNaissance ? new Date().getFullYear() - new Date(p.dateNaissance).getFullYear() : '?'
  const dateIntervention = activite.dateOperation || protocole.dateOperation || '—'
  const chirurgienNom = activite.chirurgien?.nom || protocole.chirurgien?.nom || '—'
  const procedure = activite.description || protocole.compteRenduIntervention?.substring(0, 60) || 'Non spécifiée'
  const duree = activite.heureFin && activite.heureDebut ? '—' : '—' // À adapter si dispo
  const succes = score.scoreTotal >= 9
  const observations = protocole.compteRenduIntervention || 'Aucune observation enregistrée.'

  return (
    <main className="md:pl-72 min-h-screen flex flex-col">
      {/* Top Filter Bar */}
      <div className="sticky z-30 bg-white border-b border-surface-variant/20 px-8 py-3 flex items-center gap-6 shadow-sm top-0">
        <button onClick={() => router.push('/bloc/archives')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold">
          <span className="material-symbols-outlined">arrow_back</span>
          Archives
        </button>
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl border-none text-xs focus:ring-2 focus:ring-primary" placeholder="Rechercher un dossier..." type="text" />
        </div>
        <div className="ml-6">
          <span className="text-sm font-bold text-primary font-headline">Bloc Opératoire</span>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <button className="relative text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>

      {/* Contenu centré */}
      <div className="flex-1 overflow-y-auto p-8 bg-surface">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Patient Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-headline text-3xl font-extrabold text-on-surface">{p.nom} {p.prenom}</h1>
              <p className="text-sm text-on-surface-variant flex items-center gap-3 mt-1">
                <span className="font-mono bg-surface-container px-2 py-0.5 rounded text-xs">{p.idDossier || '—'}</span>
                <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full opacity-30"></span>
                <span className="">Né le {p.dateNaissance ? new Date(p.dateNaissance).toLocaleDateString('fr-FR') : '—'} ({age} ans)</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="bg-surface-container-lowest text-primary px-4 py-2.5 rounded-lg text-xs font-bold border border-surface-variant/30 hover:bg-white shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">print</span>
                Imprimer
              </button>
              <button onClick={() => window.open(`http://localhost:3000/api/archives/dossier/${patientId}`, '_blank')}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 hover:opacity-90">
                <span className="material-symbols-outlined text-sm">download</span>
                Full ZIP
              </button>
            </div>
          </div>

          {/* Résumé Bloc Opératoire */}
          <div className="bg-white p-8 rounded-2xl shadow-sm ring-1 ring-black/5 border border-surface-variant/10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center border border-primary/10">
                  <span className="material-symbols-outlined text-2xl">clinical_notes</span>
                </div>
                <div>
                  <h2 className="font-headline text-xl font-bold text-on-surface">Résumé Bloc Opératoire</h2>
                  <p className="text-xs text-on-surface-variant">Synthèse archivée de l'acte chirurgical</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-y-8 gap-x-12">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">ID Intervention</p>
                <p className="font-mono text-sm font-bold text-primary">{p.idDossier || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Chirurgien</p>
                <p className="text-sm font-bold">{chirurgienNom}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Date</p>
                <p className="text-sm font-bold">{dateIntervention ? new Date(dateIntervention).toLocaleDateString('fr-FR') : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Procédure</p>
                <p className="text-sm font-bold">{procedure}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Durée</p>
                <p className="text-sm font-bold">{duree}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Statut</p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${succes ? 'bg-secondary' : 'bg-tertiary'}`}></span>
                  <p className={`text-sm font-bold uppercase tracking-tight ${succes ? 'text-secondary' : 'text-tertiary'}`}>{succes ? 'Succès' : 'Complication'}</p>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-surface-container-low">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Observations Post-Opératoires</p>
              <p className="text-sm text-on-surface-variant leading-relaxed bg-surface-container-low/30 p-4 rounded-xl border border-surface-variant/10">
                {observations}
              </p>
            </div>
          </div>

          {/* Équipe du bloc */}
          <div className="space-y-4 pt-4">
            <h2 className="font-headline text-2xl font-extrabold text-on-surface">Équipe du bloc opératoire</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { titre: 'Équipe chirurgicale', icon: 'groups', couleur: 'primary', membres: [
                  { nom: activite.chirurgien?.nom || '—', role: 'Chirurgien' },
                  { nom: protocole.aideOperatoire?.nom || '—', role: 'Assistant' },
                  { nom: '—', role: 'Instrumentiste' }
                ]},
                { titre: 'Équipe anesthésique', icon: 'medical_services', couleur: 'secondary', membres: [
                  { nom: activite.anesthesiste?.nom || '—', role: 'Anesthésiste' },
                  { nom: '—', role: 'Infirmière Anesthésiste' }
                ]},
                { titre: 'Équipe paramédicale', icon: 'personal_injury', couleur: 'surface-container-highest', membres: [
                  { nom: '—', role: 'Infirmière Circulante' },
                  { nom: '—', role: 'Aide-Soignant' }
                ]},
                { titre: 'Autres intervenants', icon: 'biotech', couleur: 'tertiary', membres: [
                  { nom: '—', role: 'Technicien Biomédical' },
                  { nom: '—', role: 'Radiologue' }
                ]}
              ].map((equipe, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-surface-variant/10 flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 bg-${equipe.couleur}/5 text-${equipe.couleur} rounded-lg flex items-center justify-center`}>
                      <span className="material-symbols-outlined">{equipe.icon}</span>
                    </div>
                    <h3 className="font-headline font-bold text-on-surface">{equipe.titre}</h3>
                  </div>
                  <ul className="space-y-4 flex-1">
                    {equipe.membres.map((m, j) => (
                      <li key={j} className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{m.nom}</span>
                          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{m.role}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
