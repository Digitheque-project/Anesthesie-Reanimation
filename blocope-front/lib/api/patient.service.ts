import { apiClient } from './client';

export const patientService = {
  async getAll(f?: any) {
    const { data } = await apiClient.get('/patients', { params: f });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/patients/${id}`);
    return data;
  },
};
