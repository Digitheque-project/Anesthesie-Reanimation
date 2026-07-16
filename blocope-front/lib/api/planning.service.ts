import { apiClient } from './client'

export const planningService = {
  reserverCreneau: async (dto: {
    patientId: string;
    chirurgienId?: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    salle?: string;
    estUrgence?: boolean;
    type?: 'CPA' | 'VPA';
    motif?: string;
  }) => {
    // SIMULATION DIRECTE - pas d'appel API
    console.log('📋 Planification simulée:', dto)
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Retourner une réponse simulée
    return {
      id: 'rdv-' + Date.now(),
      patientId: dto.patientId,
      date: dto.date,
      heureDebut: dto.heureDebut,
      heureFin: dto.heureFin,
      salle: dto.salle || 'Salle CPA',
      type: dto.type || 'CPA',
      estUrgence: dto.estUrgence || false,
      motif: dto.motif || 'Consultation',
      statut: 'RESERVE',
      message: '✅ Rendez-vous planifié avec succès (simulé)'
    }
  },

  getCreneaux: async (date?: string) => {
    // Simulation
    return [
      { id: '1', heureDebut: '08:00', heureFin: '08:30', disponible: true },
      { id: '2', heureDebut: '09:00', heureFin: '09:30', disponible: true },
      { id: '3', heureDebut: '10:00', heureFin: '10:30', disponible: false },
    ]
  },

  getPlanningJour: async (date: string) => {
    return []
  }
}
