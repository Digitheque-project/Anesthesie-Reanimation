import { apiClient } from './client';

export const planningService = {
  async getJour(date: string, type?: 'CPA' | 'VPA') {
    const { data } = await apiClient.get('/planning/jour', { params: { date, type } });
    return data;
  },
  async reserverCreneau(dto: {
    patientId: string; chirurgienId: string; date: string;
    heureDebut: string; heureFin: string; salle: string;
    estUrgence?: boolean; type?: 'CPA' | 'VPA';
  }) {
    const { data } = await apiClient.post('/planning/reserver', dto);
    return data;
  },
};
