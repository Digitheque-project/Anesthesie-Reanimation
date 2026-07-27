'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from 'recharts'
import { rapportsService } from '@/lib/api'
import { obtenirSessionValide } from '@/lib/auth/central-session'
import ExportToolbar from '@/components/bloc/layout/ExportToolbar'
import { exporterCSV, exporterExcel, exporterPDF, imprimerSection, Colonne } from '@/lib/export/export'
import { libelleUrgence, styleUrgence } from '@/lib/urgence'

const fmtDate = (v: any) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—')

const DECISION_STYLE: Record<string, { label: string; couleur: string; hex: string }> = {
  APTE: { label: 'APTE', couleur: 'text-emerald-700', hex: '#10b981' },
  INAPTE: { label: 'INAPTE', couleur: 'text-red-700', hex: '#ef4444' },
  REPORT: { label: 'REPORT', couleur: 'text-orange-700', hex: '#f97316' },
}

const PALETTE_URGENCE: Record<string, string> = { NORMAL: '#3b82f6', URGENT: '#f97316', TRES_URGENT: '#ef4444' }
const PALETTE_DONUT = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1']

type Granularite = 'jour' | 'semaine' | 'mois' | 'annee'

// Regroupe une série quotidienne {date, nbOperations} par jour/semaine/mois/année — calculé
// côté client à partir des données déjà quotidiennes renvoyées par le backend, sans avoir besoin
// d'un endpoint séparé par granularité.
function cleEtLabel(dateStr: string, granularite: Granularite): { cle: string; label: string } {
  const d = new Date(dateStr)
  if (granularite === 'annee') {
    const y = d.getFullYear()
    return { cle: String(y), label: String(y) }
  }
  if (granularite === 'mois') {
    const cle = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { cle, label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }) }
  }
  if (granularite === 'semaine') {
    const debutSemaine = new Date(d)
    const jourSemaine = (d.getDay() + 6) % 7 // lundi = 0
    debutSemaine.setDate(d.getDate() - jourSemaine)
    const cle = debutSemaine.toISOString().split('T')[0]
    return { cle, label: `Sem. ${debutSemaine.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}` }
  }
  return { cle: dateStr, label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) }
}

const GRANULARITES: { valeur: Granularite; label: string }[] = [
  { valeur: 'jour', label: 'Jour' },
  { valeur: 'semaine', label: 'Semaine' },
  { valeur: 'mois', label: 'Mois' },
  { valeur: 'annee', label: 'Année' },
]

export default function RapportsPage() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [rechercheDetail, setRechercheDetail] = useState('')
  const [session, setSession] = useState<ReturnType<typeof obtenirSessionValide>>(null)
  // Distingue "erreur technique de chargement" de "aucune donnée pour l'instant" — sans quoi
  // les deux cas rendent le même tableau de bord vide, sans que l'utilisateur sache s'il doit
  // s'inquiéter d'un problème ou si c'est juste qu'aucune activité ne correspond encore.
  const [erreurChargement, setErreurChargement] = useState(false)
  const [granulariteEvolution, setGranulariteEvolution] = useState<Granularite>('jour')

  useEffect(() => { setSession(obtenirSessionValide()) }, [])
  useEffect(() => { charger() }, [])

  const charger = async () => {
    setLoading(true)
    setErreurChargement(false)
    try {
      const data = await rapportsService.getTableauDeBord(dateDebut || undefined, dateFin || undefined)
      setDashboard(data)
    } catch (err) {
      console.error('Erreur chargement tableau de bord:', err)
      setErreurChargement(true)
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

  const evolutionAgregee = useMemo(() => {
    const map = new Map<string, { cle: string; label: string; nbOperations: number }>()
    for (const e of evolution) {
      const { cle, label } = cleEtLabel(e.date, granulariteEvolution)
      const existant = map.get(cle)
      if (existant) existant.nbOperations += Number(e.nbOperations) || 0
      else map.set(cle, { cle, label, nbOperations: Number(e.nbOperations) || 0 })
    }
    return Array.from(map.values()).sort((a, b) => a.cle.localeCompare(b.cle))
  }, [evolution, granulariteEvolution])

  const decisionsCPAGraph = decisionsCPA.map((d: any) => ({
    name: DECISION_STYLE[d.decision]?.label || d.decision,
    value: Number(d.count) || 0,
    fill: DECISION_STYLE[d.decision]?.hex || '#94a3b8',
  }))
  const patientsParStatutGraph = patientsParStatut.map((s: any, i: number) => ({
    name: s.statut, value: Number(s.count) || 0, fill: PALETTE_DONUT[i % PALETTE_DONUT.length],
  }))
  const urgencesParNiveauGraph = urgencesParNiveau.map((u: any) => ({
    name: libelleUrgence(u.niveauUrgence), value: Number(u.count) || 0, fill: PALETTE_URGENCE[u.niveauUrgence] || '#94a3b8',
  }))
  const typesChirurgieGraph = typesChirurgie.slice(0, 8).map((t: any) => ({ name: t.type, count: Number(t.count) || 0 }))
  const activiteChirurgiensGraph = activiteChirurgiens.map((c: any) => ({
    name: c.nomComplet?.trim() || 'Non renseigné', nbOperations: Number(c.nbOperations) || 0,
  }))
  const activiteAnesthesistesGraph = activiteAnesthesistes.map((a: any) => ({
    name: a.nomComplet?.trim() || 'Non renseigné',
    CPA: Number(a.nbCPA) || 0, Opérations: Number(a.nbOperations) || 0, 'Scores SCCRE': Number(a.nbScoresSCCRE) || 0,
  }))

  // ————— Colonnes / lignes pour les exports —————
  const colonnesChirurgiens: Colonne[] = [{ cle: 'nomComplet', titre: 'Chirurgien' }, { cle: 'nbOperations', titre: "Nb opérations" }]
  const colonnesAnesthesistes: Colonne[] = [{ cle: 'nomComplet', titre: 'Anesthésiste' }, { cle: 'nbCPA', titre: 'CPA réalisées' }, { cle: 'nbOperations', titre: 'Opérations suivies' }, { cle: 'nbScoresSCCRE', titre: 'Scores SCCRE' }]
  const colonnesDetail: Colonne[] = [
    { cle: 'patientNom', titre: 'Patient' }, { cle: 'libelle', titre: 'Intervention' }, { cle: 'typeChirurgie', titre: 'Type' },
    { cle: 'niveauUrgence', titre: 'Urgence' }, { cle: 'statut', titre: 'Statut' }, { cle: 'dateOperationTxt', titre: 'Date' },
    { cle: 'chirurgien', titre: 'Chirurgien' }, { cle: 'anesthesiste', titre: 'Anesthésiste' },
    { cle: 'compteRenduTxt', titre: 'Compte-rendu' },
  ]
  const lignesDetailExport = detailFiltre.map((o: any) => ({ ...o, niveauUrgence: libelleUrgence(o.niveauUrgence), dateOperationTxt: fmtDate(o.dateOperation), compteRenduTxt: o.compteRenduDisponible ? 'Disponible' : '—' }))

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

      {erreurChargement && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-800 print:hidden">
          <span className="material-symbols-outlined">error</span>
          <span>Le tableau de bord n'a pas pu être chargé (erreur technique) — ce n'est pas forcément qu'il n'y a aucune activité. Réessayez ou contactez le support si le problème persiste.</span>
          <button onClick={charger} className="ml-auto px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg">Réessayer</button>
        </div>
      )}

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <TacheCard label="Check-lists Sign In" val={taches.checklistsAvantOp} icone="checklist" couleur="blue" />
          <TacheCard label="Check-lists Time Out" val={taches.checklistsPendantOp} icone="pause_circle" couleur="teal" />
          <TacheCard label="Check-lists Sign Out" val={taches.checklistsApresOp} icone="assignment_turned_in" couleur="indigo" />
          <TacheCard label="Moments horodatés" val={taches.momentsOperatoires} icone="timeline" couleur="rose" />
          <TacheCard label="Comptes-rendus opératoires" val={taches.comptesRendusOperatoires} icone="description" couleur="amber" />
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Décisions CPA */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-amber-600">gavel</span> Décisions CPA
          </h3>
          {decisionsCPAGraph.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={decisionsCPAGraph} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {decisionsCPAGraph.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Évolution des opérations */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-bold flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
              <span className="material-symbols-outlined text-emerald-600">show_chart</span> Évolution des opérations
            </h3>
            <div className="flex bg-surface-container-low rounded-lg p-0.5 print:hidden">
              {GRANULARITES.map(g => (
                <button key={g.valeur} onClick={() => setGranulariteEvolution(g.valeur)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${granulariteEvolution === g.valeur ? 'bg-emerald-500 text-white shadow-sm' : 'text-on-surface-variant hover:bg-white'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          {evolutionAgregee.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée sur la période.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={evolutionAgregee}>
                <defs>
                  <linearGradient id="degradeEvolution" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                <Tooltip />
                <Area type="monotone" dataKey="nbOperations" name="Opérations" stroke="#10b981" fill="url(#degradeEvolution)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Types de chirurgie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-violet-600">biotech</span> Types de chirurgie
          </h3>
          {typesChirurgieGraph.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typesChirurgieGraph} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" name="Nb" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Répartition patients / urgences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-blue-600">pie_chart</span> Patients par statut
          </h3>
          {patientsParStatutGraph.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée.</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={patientsParStatutGraph} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {patientsParStatutGraph.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-red-600">emergency</span> Urgences par niveau (patients actifs)
          </h3>
          {urgencesParNiveauGraph.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée.</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={urgencesParNiveauGraph} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {urgencesParNiveauGraph.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activité par personnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-blue-600">content_cut</span> Activité par chirurgien
          </h3>
          {activiteChirurgiensGraph.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée.</p> : (
            <ResponsiveContainer width="100%" height={Math.max(220, activiteChirurgiensGraph.length * 32)}>
              <BarChart data={activiteChirurgiensGraph} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Bar dataKey="nbOperations" name="Opérations" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface-variant uppercase tracking-widest">
            <span className="material-symbols-outlined text-secondary">medical_services</span> Activité par anesthésiste
          </h3>
          {activiteAnesthesistesGraph.length === 0 ? <p className="text-xs text-on-surface-variant italic">Aucune donnée.</p> : (
            <ResponsiveContainer width="100%" height={Math.max(220, activiteAnesthesistesGraph.length * 40)}>
              <BarChart data={activiteAnesthesistesGraph} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="CPA" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="Opérations" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Scores SCCRE" stackId="a" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
                <th className="px-4 py-3">Compte-rendu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-on-surface-variant">Chargement...</td></tr>
              ) : detailFiltre.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-on-surface-variant">Aucune opération sur cette période</td></tr>
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
                    <td className="px-4 py-3">
                      {o.compteRenduDisponible ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-green-700">
                          <span className="material-symbols-outlined text-sm">check_circle</span> Disponible
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-on-surface-variant/60">—</span>
                      )}
                    </td>
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
