'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

const SECTIONS = [
  {
    titre: '1. SÉRUMS',
    couleur: 'bg-primary',
    items: [
      { nom: 'SGI 5%', checked: false, quantite: '', observation: '' },
      { nom: 'SSI 9%', checked: false, quantite: '', observation: '' },
      { nom: 'Ringer Lactate (RL)', checked: false, quantite: '', observation: '' },
    ]
  },
  {
    titre: '2. ANESTHÉSIQUES',
    couleur: 'bg-secondary',
    items: [
      { nom: 'Nesdonal 1g', checked: false, quantite: '', observation: '' },
      { nom: 'Propofol', checked: false, quantite: '', observation: '' },
    ]
  },
  {
    titre: '3. ANTALGIQUES',
    couleur: 'bg-tertiary',
    items: [
      { nom: 'Perfalgan', checked: false, quantite: '', observation: '' },
      { nom: 'Tramadol', checked: false, quantite: '', observation: '' },
    ]
  },
  {
    titre: '4. KIT ASEPSIE',
    couleur: 'bg-primary-container',
    items: [
      { nom: 'Blouse stérile', checked: false, quantite: '', observation: '' },
      { nom: 'Gants stériles', checked: false, quantite: '', observation: '' },
    ]
  },
  {
    titre: '5. ANTIBIOTIQUES & AUTRES',
    couleur: 'bg-error',
    items: [
      { nom: 'Flagyl', checked: false, quantite: '', observation: '' },
      { nom: 'Héparine', checked: false, quantite: '', observation: '' },
    ]
  },
  {
    titre: '6. DISPOSITIFS MÉDICAUX',
    couleur: 'bg-inverse-primary',
    items: [
      { nom: 'Perfuseur', checked: false, quantite: '', observation: '' },
      { nom: 'Cathéter', checked: false, quantite: '', observation: '' },
    ]
  },
]

const CONSOMMABLES = [
  'Coton / Alcool', 'Sparadrap', 'Dakin', 'Bétadine',
  'Seringues', 'Sécurefix', 'Lunettes nasales', 'Kit AG / ALR'
]

export default function MedicamentsAnesthesiePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''
  const patientNom = searchParams.get('patientNom') || 'RANDRIA Solomanana'

  const [sections, setSections] = useState(SECTIONS)
  const [consommables, setConsommables] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const newSections = [...sections]
    newSections[sectionIdx].items[itemIdx].checked = !newSections[sectionIdx].items[itemIdx].checked
    setSections(newSections)
  }

  const updateItem = (sectionIdx: number, itemIdx: number, field: string, value: string) => {
    const newSections = [...sections]
    ;(newSections[sectionIdx].items[itemIdx] as any)[field] = value
    setSections(newSections)
  }

  const toggleConsommable = (nom: string) => {
    setConsommables(prev => prev.includes(nom) ? prev.filter(c => c !== nom) : [...prev, nom])
  }

  const handleValider = async () => {
    setLoading(true)
    try {
      const items = sections.flatMap(s => s.items.filter(i => i.checked).map(i => ({
        nom: i.nom, selectionne: true, quantite: i.quantite, dosage: '', observation: i.observation
      })))
      await apiClient.post('/bons-commande', { patientId, dateCreation: new Date().toISOString().split('T')[0], items, consommables })
      alert('✅ Médicaments enregistrés !')
      router.back()
    } catch (err) { console.error(err); alert('❌ Erreur') }
    finally { setLoading(false) }
  }

  return (
    <main className="p-6">
      {/* Patient Context Header */}
      <div className="sticky z-30 bg-surface/80 backdrop-blur-xl p-6 rounded-xl flex flex-wrap justify-between items-center gap-6 shadow-sm border border-outline-variant/30 mb-8 top-0">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-lg bg-primary-container flex items-center justify-center overflow-hidden">
            <img alt="Patient" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt2QxzSI4tqApX7JJzCFxYK_ArY0ZbTlMhXp1iNC8BOjxVXFFBjJiUnettyE6DcYpDeoucrZ5ZGSXGwhfsfu_7H40ViweH5m5Cl8JPEiZ2Wj7UIlOwmAQTCGsXx4Ro-g3CedoIIqJDEaGbY1rQ9-2bi4jDu9SqkWgm7CtlR7npYM6eeWR24T5coeXY2U93990qZBy8nQsSAdLRhjPJlmRDXmOax4KHHwSkLGpTMuoCnz4Zzo9gGROKc7G_47yJ14AOngVBmMQrsh0" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight">{patientNom}</h1>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant font-medium mt-1">
              <span className="bg-surface-container px-2 py-0.5 rounded">ID: 882-334-91</span>
            </div>
          </div>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
          <span className="material-symbols-outlined">arrow_back</span> Retour
        </button>
      </div>

      {/* Titre principal */}
      <div className="flex justify-center mb-8">
        <h2 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight uppercase border-b-4 border-primary pb-2 px-8 text-center">
          Liste des médicaments nécessaires pour l'Anesthésie et la Réanimation
        </h2>
      </div>

      <div className="flex flex-col gap-10 pb-24 max-w-6xl mx-auto">
        {/* Sections Sérums, Anesthésiques, etc. */}
        {sections.map((section, sIdx) => (
          <section key={sIdx} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className={`w-1.5 h-6 ${section.couleur} rounded-full`}></span>
              <h3 className="text-lg font-bold font-headline text-on-surface uppercase">{section.titre}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant/20">
                  <tr>
                    <th className="py-3 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest w-12">Select</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Médicament / Matériel</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest w-64">Quantité / Dosage</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {section.items.map((item, iIdx) => (
                    <tr key={iIdx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-4">
                        <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"
                          checked={item.checked} onChange={() => toggleItem(sIdx, iIdx)} />
                      </td>
                      <td className="py-3 px-4 font-semibold text-on-surface">{item.nom}</td>
                      <td className="py-3 px-4">
                        <input className="w-full h-9 px-3 bg-surface-container-low border border-outline-variant/20 rounded focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="ex: 500ml" type="text" value={item.quantite}
                          onChange={e => updateItem(sIdx, iIdx, 'quantite', e.target.value)} />
                      </td>
                      <td className="py-3 px-4">
                        <input className="w-full h-9 px-3 bg-transparent border-none text-xs text-on-surface-variant focus:ring-0"
                          placeholder="Note..." type="text" value={item.observation}
                          onChange={e => updateItem(sIdx, iIdx, 'observation', e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {/* Consommables */}
        <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-6 bg-surface-variant rounded-full"></span>
            <h3 className="text-lg font-bold font-headline text-on-surface uppercase">7. CONSOMMABLES</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CONSOMMABLES.map((nom, i) => (
              <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors">
                <input className="w-4 h-4 rounded border-outline-variant text-secondary" type="checkbox"
                  checked={consommables.includes(nom)} onChange={() => toggleConsommable(nom)} />
                <span>{nom}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Validation */}
    </main>
  )
}
