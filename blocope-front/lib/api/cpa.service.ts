import { apiClient } from './client';
export const cpaService = {
  async getAll(p?: number, l?: number) { const { data } = await apiClient.get('/cpa', { params: { page: p, limite: l } }); return data; },
  async getById(id: string) { const { data } = await apiClient.get(`/cpa/${id}`); return data; },
  async valider(id: string, dto?: { commentaireValidation?: string }) { const { data } = await apiClient.patch(`/cpa/${id}/valider`, dto || {}); return data; },
};
