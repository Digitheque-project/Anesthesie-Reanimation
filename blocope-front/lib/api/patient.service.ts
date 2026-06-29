import { apiClient } from './client';

export const patientService = {
  async getAll(f?: any) { 
    const { data } = await apiClient.get('/patients', { params: f }); 
    return data; 
  },
  
  async getById(id: string) { 
    try {
      // Si c'est un UUID, appel normal
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (isUUID) {
        const { data } = await apiClient.get(`/patients/${id}`);
        return data;
      }
      
      // Sinon, recherche par idDossier
      const { data } = await apiClient.get('/patients', { 
        params: { recherche: id } 
      });
      
      if (data.data && data.data.length > 0) {
        return data.data[0];
      }
      throw new Error('Patient non trouvé');
    } catch (error) {
      console.error('Erreur getById:', error);
      throw error;
    }
  },
};
