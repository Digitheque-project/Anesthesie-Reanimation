import { apiClient } from './client';
export const notificationService = {
  async getAll(p?: number, l?: number) { const { data } = await apiClient.get('/notifications-cpa', { params: { page: p, limite: l } }); return data; },
};
