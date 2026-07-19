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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { charger() }, [filtres, selectedDate])

  const charger = async () => {
    try {
      setLoading(true)
      // Le programme opératoire n'est plus figé sur "aujourd'hui" : on peut naviguer vers
      // n'importe quelle date. Les patients prêts/en cours dont l'intervention est prévue ce
      // jour-là (ou sans date renseignée, à traiter en priorité) y apparaissent.
      const [pretRes, encoursRes, notifsRes] = await Promise.all([
        patientService.getAll({ statut: 'PRET_POUR_BLOC', recherche: filtres.recherche || undefined, limite: 100 }),
        patientService.getAll({ statut: 'EN_COURS_OPERATION', recherche: filtres.recherche || undefined, limite: 100 }),
        notificationService.getAll(1, 100),
      ])
      const notifsData = notifsRes.data || []
      const estDateSelectionnee = (p: any) => !p.dateIntervention || new Date(p.dateIntervention).toISOString().split('T')[0] === selectedDate
      const data = [...(pretRes.data || []), ...(encoursRes.data || [])].filter(estDateSelectionnee)

      // Fusionner : associer chaque patient à sa notification (si existe)
      let liste = data.map((p: any) => {
        const notif = notifsData.find((n: any) => n.patientId === p.id || n.patient?.id === p.id)
        return {
          id: p.idDossier || p.id, realId: p.id,
          nom: p.nom,
          prenom: p.prenom,
          operation: notif?.intervention || p.libelle || 'Non spécifiée',
          etat: p.niveauUrgence === 'STAT' ? 'STAT' : p.niveauUrgence === 'URGENT' ? 'URGENT' : 'NORMAL',
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
    urgents: patients.filter(p => p.etat === 'URGENT').length,
    normaux: patients.filter(p => p.etat === 'NORMAL').length,
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-on-surface font-headline tracking-tight">
          Programme Opératoire
        </h1>
        <p className="text-on-surface-variant text-sm font-medium mt-1">
          Liste des patients à opérer — {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <PatientStatsCards stats={stats} />
      <PatientFilters
        date={selectedDate}
        onDateChange={setSelectedDate}
        onFilterChange={(f: any) => setFiltres({ statut: f.statut === 'Tous les statuts' ? '' : f.statut, recherche: f.specialite === 'Toutes les spécialités' ? '' : f.specialite })}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-500">🔄 Chargement des patients...</div>
      ) : (
        <PatientsListTable patients={patients} />
      )}
    </div>
  )
}
