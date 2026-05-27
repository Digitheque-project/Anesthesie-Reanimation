import { apiClient } from './client';
export const rapportsService = {
  async getStatistiques(dd?: string, df?: string) { const { data } = await apiClient.get('/rapports/statistiques', { params: { dateDebut: dd, dateFin: df } }); return data; },
  async getAlertes() { const { data } = await apiClient.get('/alertes'); return data; },
};
