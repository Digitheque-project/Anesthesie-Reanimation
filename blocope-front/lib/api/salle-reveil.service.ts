import { apiClient } from './client';

export const salleReveilService = {
  getPatientsEnReveil: async () => {
    const { data } = await apiClient.get('/sorties-reveil');
    return data?.data ?? [];
  },

  getPatientSuivi: async (id: string) => {
    const { data } = await apiClient.get(`/sorties-reveil/${id}`);
    return data;
  },

  enregistrerScore: async (payload: any) => {
    const { data } = await apiClient.post('/scores-sccre', payload);
    return data;
  },

  validerSortie: async (payload: any) => {
    const { data } = await apiClient.post('/sorties-reveil', payload);
    return data;
  },
};
