'use client'

import { useState, useEffect } from 'react'
import PatientStatsCards from '@/components/bloc/patient-du-jour/PatientStatsCards'
import PatientFilters from '@/components/bloc/patient-du-jour/PatientFilters'
import PatientsListTable from '@/components/bloc/patient-du-jour/PatientsListTable'
import { patientService, notificationService } from '@/lib/api'

export default function PatientDuJourPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtres, setFiltres] = useState({ statut: '', recherche: '' })

  useEffect(() => { charger() }, [filtres])

  const charger = async () => {
    try {
      setLoading(true)
      // "À opérer aujourd'hui" = seulement les patients encore en phase opératoire (prêts ou en
      // cours). Une fois passés en salle de réveil ou sortis, ils ne doivent plus apparaître ici.
      const [pretRes, encoursRes, notifsRes] = await Promise.all([
        patientService.getAll({ statut: 'PRET_POUR_BLOC', recherche: filtres.recherche || undefined, limite: 100 }),
        patientService.getAll({ statut: 'EN_COURS_OPERATION', recherche: filtres.recherche || undefined, limite: 100 }),
        notificationService.getAll(1, 100),
      ])
      const notifsData = notifsRes.data || []
      const data = [...(pretRes.data || []), ...(encoursRes.data || [])]

      // Fusionner : associer chaque patient à sa notification (si existe)
      let liste = data.map((p: any) => {
        const notif = notifsData.find((n: any) => n.patientId === p.id || n.patient?.id === p.id)
        return {
          id: p.idDossier || p.id, realId: p.id,
          nom: p.nom,
          prenom: p.prenom,
          operation: notif?.intervention || p.libelle || 'Non spécifiée',
          etat: p.niveauUrgence === 'STAT' ? 'STAT' : p.niveauUrgence === 'URGENT' ? 'Urgent' : 'Stable',
          chirurgien: notif?.chirurgien?.nom || p.chirurgien_nom || '',
        }
      })

      if (filtres.statut) {
        liste = liste.filter(p => p.etat === filtres.statut)
      }

      setPatients(liste)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: patients.length,
    stat: patients.filter(p => p.etat === 'STAT').length,
    urgents: patients.filter(p => p.etat === 'Urgent').length,
    normaux: patients.filter(p => p.etat === 'Stable').length,
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-on-surface font-headline tracking-tight">
          Patients du Jour
        </h1>
        <p className="text-on-surface-variant text-sm font-medium mt-1">
          Liste des patients à opérer aujourd'hui
        </p>
      </div>

      <PatientStatsCards stats={stats} />
      <PatientFilters onFilterChange={(f: any) => setFiltres({ statut: f.statut === 'Tous les statuts' ? '' : f.statut, recherche: f.specialite === 'Toutes les spécialités' ? '' : f.specialite })} />

      {loading ? (
        <div className="text-center py-12 text-gray-500">🔄 Chargement des patients...</div>
      ) : (
        <PatientsListTable patients={patients} />
      )}
    </div>
  )
}
