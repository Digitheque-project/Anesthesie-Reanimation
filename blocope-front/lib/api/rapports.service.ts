import { apiClient } from './client'

const MOCK_STATS = {
  totalPatients: 42,
  totalOperations: 156,
  totalUrgences: 8,
  totalMedecins: 12,
  enAttente: 5,
  aujourdhui: 8
}

export const rapportsService = {
  getStatistiques: async (start?: string, end?: string) => {
    try {
      const { data } = await apiClient.get('/rapports/statistiques', { params: { start, end } })
      return data
    } catch (error) {
      console.warn('⚠️ API indisponible - utilisation des stats simulées')
      return MOCK_STATS
    }
  },

  getAlertes: async () => {
    try {
      const { data } = await apiClient.get('/alertes')
      return data
    } catch (error) {
      return []
    }
  },

  getRapports: async (params?: any) => {
    try {
      const { data } = await apiClient.get('/rapports', { params })
      return data
    } catch (error) {
      return { data: [], total: 0 }
    }
  }
}
