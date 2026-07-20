'use client'

import { useState, useEffect, useMemo } from 'react'
import { rapportsService } from '@/lib/api'
import { obtenirSessionValide } from '@/lib/auth/central-session'
import ExportToolbar from '@/components/bloc/layout/ExportToolbar'
import { exporterCSV, exporterExcel, exporterPDF, imprimerSection, Colonne } from '@/lib/export/export'
import { libelleUrgence, styleUrgence } from '@/lib/urgence'

const fmtDate = (v: any) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—')

const DECISION_STYLE: Record<string, { label: string; couleur: string; barre: string }> = {
  APTE: { label: 'APTE', couleur: 'text-emerald-700', barre: 'bg-emerald-500' },
  INAPTE: { label: 'INAPTE', couleur: 'text-red-700', barre: 'bg-red-500' },
  REPORT: { label: 'REPORT', couleur: 'text-orange-700', barre: 'bg-orange-500' },
}

export default function RapportsPage() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [rechercheDetail, setRechercheDetail] = useState('')
  const [session, setSession] = useState<ReturnType<typeof obtenirSessionValide>>(null)

  useEffect(() => { setSession(obtenirSessionValide()) }, [])
  useEffect(() => { charger() }, [])

  const charger = async () => {
    setLoading(true)
    try {
      const data = await rapportsService.getTableauDeBord(dateDebut || undefined, dateFin || undefined)
      setDashboard(data)
    } catch (err) {
      console.error('Erreur chargement tableau de bord:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = dashboard?.statistiques || {}
  const activiteChirurgiens: any[] = dashboard?.activiteParChirurgien || []
  const activiteAnesthesistes: any[] = dashboard?.activiteParAnesthesiste || []
  const decisionsCPA: any[] = dashboard?.decisionsCPA || []
  const typesChirurgie: any[] = dashboard?.typesChirurgie || []
  const evolution: any[] = dashboard?.evolutionQuotidienne || []
  const taches = dashboard?.tachesAccomplies || {}
  const patientsParStatut: any[] = stats.patientsParStatut || []
  const urgencesParNiveau: any[] = stats.urgencesParNiveau || []
  const operationsDetail: any[] = dashboard?.operationsDetail || []

  const detailFiltre = useMemo(() => {
    if (!rechercheDetail.trim()) return operationsDetail
    const q = rechercheDetail.trim().toLowerCase()
    return operationsDetail.filter((o: any) =>
      [o.patientNom, o.libelle, o.chirurgien, o.anesthesiste, o.typeChirurgie].some((v: any) => String(v || '').toLowerCase().includes(q))
    )
  }, [operationsDetail, rechercheDetail])

  const maxOperationsChir = Math.max(1, ...activiteChirurgiens.map(c => Number(c.nbOperations) || 0))
  const maxActiviteAnesth = Math.max(1, ...activiteAnesthesistes.map(a => (Number(a.nbCPA) || 0) + (Number(a.nbOperations) || 0) + (Number(a.nbScoresSCCRE) || 0)))
  const maxEvolution = Math.max(1, ...evolution.map(e => Number(e.nbOperations) || 0))
  const totalTypes = typesChirurgie.reduce((s, t) => s + Number(t.count || 0), 0) || 1

  // ————— Colonnes / lignes pour les exports —————
  const colonnesChirurgiens: Colonne[] = [{ cle: 'nomComplet', titre: 'Chirurgien' }, { cle: 'nbOperations', titre: "Nb opérations" }]
  const colonnesAnesthesistes: Colonne[] = [{ cle: 'nomComplet', titre: 'Anesthésiste' }, { cle: 'nbCPA', titre: 'CPA réalisées' }, { cle: 'nbOperations', titre: 'Opérations suivies' }, { cle: 'nbScoresSCCRE', titre: 'Scores SCCRE' }]
  const colonnesDetail: Colonne[] = [
    { cle: 'patientNom', titre: 'Patient' }, { cle: 'libelle', titre: 'Intervention' }, { cle: 'typeChirurgie', titre: 'Type' },
    { cle: 'niveauUrgence', titre: 'Urgence' }, { cle: 'statut', titre: 'Statut' }, { cle: 'dateOperationTxt', titre: 'Date' },
    { cle: 'chirurgien', titre: 'Chirurgien' }, { cle: 'anesthesiste', titre: 'Anesthésiste' },
  ]
  const lignesDetailExport = detailFiltre.map((o: any) => ({ ...o, niveauUrgence: libelleUrgence(o.niveauUrgence), dateOperationTxt: fmtDate(o.dateOperation) }))

  const nomFichier = `rapport-bloc-operatoire${dateDebut && dateFin ? `-${dateDebut}-${dateFin}` : ''}`

  const handleCSV = () => exporterCSV(colonnesDetail, lignesDetailExport, nomFichier)
  const handleExcel = () => exporterExcel([
    { nom: 'Détail opérations', colonnes: colonnesDetail, lignes: lignesDetailExport },
    { nom: 'Chirurgiens', colonnes: colonnesChirurgiens, lignes: activiteChirurgiens },
    { nom: 'Anesthésistes', colonnes: colonnesAnesthesistes, lignes: activiteAnesthesistes },
  ], nomFichier)
  const handlePDF = () => exporterPDF(
    'Rapport d\'activité — Service Anesthésie-Réanimation',
    `Période : ${dateDebut ? fmtDate(dateDebut) : 'Depuis le début'} → ${dateFin ? fmtDate(dateFin) : "Aujourd'hui"} — ${session?.acces.chu?.name || ''}`,
    [
      { titre: 'Activité par chirurgien', colonnes: colonnesChirurgiens, lignes: activiteChirurgiens },
      { titre: 'Activité par anesthésiste', colonnes: colonnesAnesthesistes, lignes: activiteAnesthesistes },
      { titre: 'Détail des opérations', colonnes: colonnesDetail, lignes: lignesDetailExport },
    ],
    nomFichier
  )

  return (
    <main className="p-4 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
            Rapports d'activité du Service Anesthésie-Réanimation
          </h1>
          <p className="text-sm text-on-surface-variant">Statistiques, activité par personnel et détail des interventions</p>
        </div>
        <ExportToolbar onImprimer={imprimerSection} onCSV={handleCSV} onExcel={handleExcel} onPDF={handlePDF} />
      </div>

      {/* Filtre de période */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-wrap items-end gap-3 print:hidden">
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Date début</label>
          <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="bg-surface-container-low border-none rounded-lg p-2 text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Date fin</label>
          <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="bg-surface-container-low border-none rounded-lg p-2 text-sm" />
        </div>
        <button onClick={charger} className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-lg">filter_alt</span> Appliquer
        </button>
        {(dateDebut || dateFin) && (
          <button onClick={() => { setDateDebut(''); setDateFin(''); setTimeout(charger, 0) }} className="text-xs font-bold text-on-surface-variant hover:text-primary underline">
            Réinitialiser
          </button>
        )}
        {dashboard?.genereLe && <span className="ml-auto text-[10px] text-on-surface-variant">Généré le {new Date(dashboard.genereLe).toLocaleString('fr-FR')}</span>}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Patients (total)', val: stats.totalPatients, icon: 'groups', couleur: 'blue' },
          { label: 'Patients actifs', val: stats.totalPatientsActifs, icon: 'directions_walk', couleur: 'cyan' },
          { label: 'Opérations', val: stats.totalOperations, icon: 'monitor_heart', couleur: 'emerald' },
          { label: 'Urgences en cours', val: stats.totalUrgences, icon: 'warning', couleur: 'red' },
          { label: 'CPA réalisées', val: decisionsCPA.reduce((s, d) => s + Number(d.count || 0), 0), icon: 'assignment_turned_in', couleur: 'amber' },
          { label: 'Scores SCCRE', val: stats.totalScores, icon: 'bed', couleur: 'violet' },
          { label: 'Sorties de réveil', val: stats.totalSortiesReveil, icon: 'exit_to_app', couleur: 'teal' },
          { label: 'Médecins actifs', val: stats.totalMedecins, icon: 'medical_information', couleur: 'indigo' },
        ].map((kpi, i) => (
          <KpiCard key={i} label={kpi.label} valeur={loading ? '…' : (kpi.val ?? 0)} icone={kpi.icon} couleur={kpi.couleur} />
        ))}
      </div>

      {/* Tâches accomplies */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">task_alt</span> Tâches accomplies dans le bloc
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TacheCard label="Check-lists Sign In" val={taches.checklistsAvantOp} icone="checklist" couleur="blue" />
          <TacheCard label="Check-lists Time Out" val={taches.checklistsPendantOp} icone="pause_circle" couleur="teal" />
          <TacheCard label="Check-lists Sign Out" val={taches.checklistsApresOp} icone="assignment_turned_in" couleur="indigo" />
          <TacheCard label="Moments horodatés" val={taches.momentsOperatoires} icone="timeline" couleur="rose" />
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Décisions CPA */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-amber-600">gavel</span> Décisions CPA
          </h3>
          {decisionsCPA.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée.</p> : (
            <div className="space-y-3">
              {decisionsCPA.map((d: any, i: number) => {
                const style = DECISION_STYLE[d.decision] || DECISION_STYLE.REPORT
                const total = decisionsCPA.reduce((s, x) => s + Number(x.count || 0), 0) || 1
                return (
                  <div key={i} className="space-y-1">
                    <div className={`flex justify-between text-[11px] font-bold ${style.couleur}`}><span>{style.label}</span><span>{d.count}</span></div>
                    <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${style.barre}`} style={{ width: `${(Number(d.count) / total) * 100}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Évolution quotidienne */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-emerald-600">show_chart</span> Évolution des opérations
          </h3>
          {evolution.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée sur la période.</p> : (
            <>
              <div className="flex items-end gap-1 h-32">
                {evolution.slice(-14).map((e: any, i: number) => (
                  <div key={i} className="flex-1 bg-emerald-400 rounded-t-sm hover:bg-emerald-500 transition-colors" title={`${fmtDate(e.date)} : ${e.nbOperations}`}
                    style={{ height: `${Math.max(4, (Number(e.nbOperations) / maxEvolution) * 100)}%` }}></div>
                ))}
              </div>
              <p className="text-[10px] text-on-surface-variant mt-2 text-center">{evolution.length} jour(s) avec activité — {evolution.slice(-14).length} derniers affichés</p>
            </>
          )}
        </div>

        {/* Types de chirurgie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-violet-600">biotech</span> Types de chirurgie
          </h3>
          {typesChirurgie.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée.</p> : (
            <div className="space-y-2.5">
              {typesChirurgie.slice(0, 6).map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold w-24 truncate" title={t.type}>{t.type}</span>
                  <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(Number(t.count) / totalTypes) * 100}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant w-8 text-right">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Répartition patients / urgences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-blue-600">pie_chart</span> Patients par statut
          </h3>
          <div className="flex flex-wrap gap-2">
            {patientsParStatut.map((s: any, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-800">
                {s.statut} <span className="text-blue-500">· {s.count}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-red-600">emergency</span> Urgences par niveau (patients actifs)
          </h3>
          <div className="flex flex-wrap gap-2">
            {urgencesParNiveau.map((u: any, i: number) => {
              const style = styleUrgence(u.niveauUrgence)
              return (
                <span key={i} className={`px-3 py-1.5 bg-white border rounded-full text-xs font-bold ${style.texte}`} style={{ borderColor: 'currentColor' }}>
                  {libelleUrgence(u.niveauUrgence)} · {u.count}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Activité par personnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-blue-600">content_cut</span> Activité par chirurgien
          </h3>
          {activiteChirurgiens.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée.</p> : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activiteChirurgiens.map((c: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-on-surface"><span>{c.nomComplet?.trim() || 'Non renseigné'}</span><span>{c.nbOperations}</span></div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(Number(c.nbOperations) / maxOperationsChir) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-secondary">medical_services</span> Activité par anesthésiste
          </h3>
          {activiteAnesthesistes.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée.</p> : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activiteAnesthesistes.map((a: any, i: number) => {
                const totalPerso = (Number(a.nbCPA) || 0) + (Number(a.nbOperations) || 0) + (Number(a.nbScoresSCCRE) || 0)
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-on-surface">
                      <span>{a.nomComplet?.trim() || 'Non renseigné'}</span>
                      <span>{a.nbCPA} CPA · {a.nbOperations} op. · {a.nbScoresSCCRE} SCCRE</span>
                    </div>
                    <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: `${(totalPerso / maxActiviteAnesth) * 100}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Détail des opérations */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="p-5 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/10">
          <h3 className="text-sm font-bold flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-primary">table_rows</span> Détail des opérations ({detailFiltre.length})
          </h3>
          <div className="relative print:hidden">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input value={rechercheDetail} onChange={e => setRechercheDetail(e.target.value)} placeholder="Filtrer (dossier, intervention, personnel...)"
              className="pl-9 pr-4 py-2 bg-surface-container-low rounded-lg text-xs border-none focus:ring-2 focus:ring-primary/20 w-72" />
          </div>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low sticky top-0">
              <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Intervention</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Urgence</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Chirurgien</th>
                <th className="px-4 py-3">Anesthésiste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-on-surface-variant">Chargement...</td></tr>
              ) : detailFiltre.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-on-surface-variant">Aucune opération sur cette période</td></tr>
              ) : detailFiltre.map((o: any, i: number) => {
                return (
                  <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-primary font-bold">{o.patientNom}</td>
                    <td className="px-4 py-3 font-medium">{o.libelle}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{o.typeChirurgie}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase ${styleUrgence(o.niveauUrgence).texte}`}>{libelleUrgence(o.niveauUrgence)}</span></td>
                    <td className="px-4 py-3 text-on-surface-variant">{o.statut}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{fmtDate(o.dateOperation)}</td>
                    <td className="px-4 py-3">{o.chirurgien}</td>
                    <td className="px-4 py-3">{o.anesthesiste}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

const KPI_COULEUR: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  red: { bg: 'bg-red-100', text: 'text-red-700' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-700' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
}

function KpiCard({ label, valeur, icone, couleur }: { label: string; valeur: any; icone: string; couleur: string }) {
  const c = KPI_COULEUR[couleur] || KPI_COULEUR.blue
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${c.bg} rounded-full flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined text-2xl ${c.text}`}>{icone}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-extrabold ${c.text}`}>{valeur}</p>
      </div>
    </div>
  )
}

function TacheCard({ label, val, icone, couleur }: { label: string; val: any; icone: string; couleur: string }) {
  const c = KPI_COULEUR[couleur] || KPI_COULEUR.blue
  return (
    <div className={`p-4 rounded-xl ${c.bg} flex flex-col items-center text-center gap-1.5`}>
      <span className={`material-symbols-outlined ${c.text}`}>{icone}</span>
      <span className={`text-xl font-extrabold ${c.text}`}>{val ?? 0}</span>
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">{label}</span>
    </div>
  )
}
