'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { patientService } from '@/lib/api'
import { apiClient } from '@/lib/api/client'
import ExportToolbar from '@/components/bloc/layout/ExportToolbar'
import { exporterCSV, exporterExcel, exporterPDF, imprimerSection, Colonne } from '@/lib/export/export'
import { fmtDate, fmtDateHeure, collecterEquipe, construireChronologie } from '@/lib/export/dossier-patient'
import { formaterNomPatient } from '@/lib/patient'

const STATUT_STYLE: Record<string, string> = {
  SORTI: 'bg-emerald-100 text-emerald-700',
  EN_SALLE_REVEIL: 'bg-cyan-100 text-cyan-700',
  EN_COURS_OPERATION: 'bg-rose-100 text-rose-700',
  PRET_POUR_BLOC: 'bg-blue-100 text-blue-700',
}

export default function ArchivesPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [recherche, setRecherche] = useState('')
  const [showFiltres, setShowFiltres] = useState(false)
  const [filtreSexe, setFiltreSexe] = useState('Tous')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [exportPdfEnCours, setExportPdfEnCours] = useState<string | null>(null)

  useEffect(() => { charger() }, [page, recherche, filtreSexe, dateDebut, dateFin])

  const filtresActifs = (liste: any[]) => {
    let filtered = liste
    if (filtreSexe !== 'Tous') filtered = filtered.filter((p: any) => p.sexe === filtreSexe)
    if (dateDebut) filtered = filtered.filter((p: any) => new Date(p.dateIntervention || p.updatedAt) >= new Date(dateDebut))
    if (dateFin) filtered = filtered.filter((p: any) => new Date(p.dateIntervention || p.updatedAt) <= new Date(dateFin))
    return filtered
  }

  const charger = async () => {
    setLoading(true)
    try {
      const data = await patientService.getAll({
        statut: 'SORTI',
        page,
        limite: 12,
        recherche: recherche || undefined,
      })
      setPatients(filtresActifs(data.data || []))
      setTotal(data.total || 0)
      setPages(data.pages || 0)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  // Récupère l'ensemble des patients archivés correspondant aux filtres (pas seulement la page
  // affichée), pour les exports Excel/CSV/PDF/impression du tableau complet.
  const chargerTousLesPatients = async () => {
    const data = await patientService.getAll({ statut: 'SORTI', page: 1, limite: 1000, recherche: recherche || undefined })
    return filtresActifs(data.data || [])
  }

  const colonnesListe: Colonne[] = [
    { cle: 'idDossier', titre: 'ID Dossier' },
    { cle: 'nomComplet', titre: 'Nom & Prénom' },
    { cle: 'sexe', titre: 'Sexe' },
    { cle: 'dateOperation', titre: "Date d'opération" },
    { cle: 'intervention', titre: 'Intervention' },
    { cle: 'chirurgien', titre: 'Chirurgien' },
    { cle: 'statut', titre: 'Statut' },
  ]
  const versLignesExport = (liste: any[]) => liste.map(p => ({
    idDossier: p.idDossier || p.id,
    nomComplet: formaterNomPatient(p),
    sexe: p.sexe || 'H',
    dateOperation: fmtDate(p.dateIntervention || p.updatedAt),
    intervention: p.libelle || '—',
    chirurgien: p.chirurgien_nom || '—',
    statut: p.statut || '—',
  }))

  const handleExportCSV = async () => exporterCSV(colonnesListe, versLignesExport(await chargerTousLesPatients()), 'archives-bloc-operatoire')
  const handleExportExcel = async () => exporterExcel([{ nom: 'Archives', colonnes: colonnesListe, lignes: versLignesExport(await chargerTousLesPatients()) }], 'archives-bloc-operatoire')
  const handleExportPDF = async () => exporterPDF('Archives opératoires', `${total} patient(s) archivé(s)`, [{ titre: 'Patients archivés', colonnes: colonnesListe, lignes: versLignesExport(await chargerTousLesPatients()) }], 'archives-bloc-operatoire')

  // Export PDF complet d'un dossier patient (même contenu que la page détail), directement
  // depuis la liste — pratique pour imprimer/partager un dossier sans l'ouvrir.
  const handleExportDossierPDF = async (patientId: string, nomAffiche: string) => {
    setExportPdfEnCours(patientId)
    try {
      const { data: dossier } = await apiClient.get(`/archives/dossier/${patientId}`)
      const chronologie = construireChronologie(dossier)
      const equipe = collecterEquipe(dossier).map(m => ({ nom: m.nom, role: m.role, etapesTxt: Array.from(m.etapes).join(', ') }))
      await exporterPDF(
        `Dossier patient — ${nomAffiche}`,
        `${dossier.patient?.idDossier || patientId} — Généré le ${fmtDateHeure(new Date())}`,
        [
          { titre: 'Chronologie du parcours', colonnes: [{ cle: 'etape', titre: 'Étape' }, { cle: 'date', titre: 'Date / Heure' }, { cle: 'detail', titre: 'Détail' }, { cle: 'personnel', titre: 'Personnel' }], lignes: chronologie },
          { titre: 'Personnel intervenu', colonnes: [{ cle: 'nom', titre: 'Nom' }, { cle: 'role', titre: 'Rôle' }, { cle: 'etapesTxt', titre: 'Étapes' }], lignes: equipe },
        ],
        `dossier-${dossier.patient?.idDossier || patientId}`
      )
    } catch (err) {
      console.error(err)
      alert("❌ Erreur lors de l'export du dossier")
    } finally {
      setExportPdfEnCours(null)
    }
  }

  return (
    <main className="p-4">
      <div className="">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-on-surface tracking-tight">Archives opératoires</h2>
            <p className="text-on-surface-variant mt-1">Dossiers complets des patients sortis du bloc opératoire</p>
          </div>
          <ExportToolbar onImprimer={imprimerSection} onCSV={handleExportCSV} onExcel={handleExportExcel} onPDF={handleExportPDF} />
        </div>

        {/* Filtres avancés */}
        <section className="bg-surface-container-low rounded-3xl p-6 mb-8 border border-white/40 shadow-sm print:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">filter_alt</span>
              <h3 className="font-headline font-bold text-on-surface">Filtres Avancés</h3>
            </div>
            <button onClick={() => setShowFiltres(!showFiltres)}
              className="text-primary text-sm font-bold hover:underline">
              {showFiltres ? 'Masquer' : 'Afficher'} les filtres
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Nom du Patient</label>
              <input className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
                placeholder="Rechercher..." type="text" value={recherche}
                onChange={e => { setRecherche(e.target.value); setPage(1) }} />
            </div>

            {showFiltres && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Sexe</label>
                  <div className="flex bg-white rounded-xl p-1 shadow-sm">
                    {['Tous', 'H', 'F'].map(s => (
                      <button key={s} onClick={() => setFiltreSexe(s)}
                        className={`flex-1 rounded-lg text-xs font-bold py-2 ${filtreSexe === s ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Date début</label>
                  <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                    className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Date fin</label>
                  <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                    className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm" />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={charger}
              className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">search_check</span>
              Appliquer le filtre
            </button>
          </div>
        </section>

        {/* Tableau */}
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-surface-container">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-dim/30 border-b border-surface-container sticky top-0 z-10">
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Nom &amp; Prénom</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center">Sexe</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Date d'opération</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Intervention</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Chirurgien</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">Chargement...</td></tr>
                ) : patients.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">Aucun patient archivé</td></tr>
                ) : patients.map(p => (
                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer" onClick={() => router.push(`/bloc/archives/${p.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.sexe === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                          <span className="material-symbols-outlined text-[18px]">person</span>
                        </div>
                        <span className="text-sm font-bold text-on-surface">{formaterNomPatient(p)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${p.sexe === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                        {p.sexe || 'H'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {fmtDate(p.dateIntervention || p.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{p.libelle || '—'}</td>
                    <td className="px-6 py-4 text-sm">{p.chirurgien_nom || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${STATUT_STYLE[p.statut] || 'bg-surface-variant text-on-surface-variant'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>{p.statut || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right print:hidden" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleExportDossierPDF(p.id, formaterNomPatient(p))} disabled={exportPdfEnCours === p.id}
                          className="px-2 py-1.5 rounded-lg border text-[11px] font-bold hover:bg-surface-container transition-colors text-red-600 disabled:opacity-50"
                          title="Exporter le dossier complet en PDF">
                          <span className="material-symbols-outlined text-sm">{exportPdfEnCours === p.id ? 'progress_activity' : 'picture_as_pdf'}</span>
                        </button>
                        <button onClick={() => router.push(`/bloc/archives/${p.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-bold hover:bg-primary-container transition-colors">
                          Informations
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="p-6 bg-surface-container-low flex items-center justify-between print:hidden">
            <p className="text-xs font-medium text-on-surface-variant">
              Affichage de <span className="font-bold">{patients.length}</span> sur <span className="font-bold">{total}</span> patients archivés
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-bold hover:bg-surface-container transition-colors disabled:opacity-50">
                ← Précédent
              </button>
              <span className="text-sm font-bold text-on-surface">Page {page}/{pages || 1}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
                className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-bold hover:bg-surface-container transition-colors disabled:opacity-50">
                Suivant →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
