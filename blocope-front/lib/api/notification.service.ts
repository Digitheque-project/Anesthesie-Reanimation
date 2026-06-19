import { apiClient } from './client';

export const notificationService = {
  async getAll(page?: number, limite?: number) {
    const { data } = await apiClient.get('/notifications-cpa', { params: { page, limite } });
    return data;
  },

  async getUnreadCount() {
    const { data } = await apiClient.get('/webhook-notification/unread/count');
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/webhook-notification/${id}`);
    return data;
  },
};
