import axios from 'axios';

// Fonction utilitaire pour vérifier les erreurs Axios
function isAxiosError(error: any): boolean {
  return error && error.isAxiosError === true;
}

// Classe AccueilClient qui gère les appels vers l'API externe
export class AccueilClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Méthode pour récupérer les données d'accueil
  async getAccueilData(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/accueil`);
      return response.data;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      console.error('Erreur getAccueilData:', err);
      throw err;
    }
  }

  // Autres méthodes utiles
  async getPatientData(patientId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/patients/${patientId}`);
      return response.data;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      console.error('Erreur getPatientData:', err);
      throw err;
    }
  }

  // Alias for compatibility with callers expecting `getPatient`
  async getPatient(patientId: string): Promise<any> {
    return this.getPatientData(patientId);
  }

  // Search patients by query string
  async searchPatients(q: string): Promise<any[]> {
    const endpoint = `/patients?search=${encodeURIComponent(q)}`;
    return this.get(endpoint);
  }

  // Register a new patient in the external service
  async registerPatient(identite: any, createdBy?: string): Promise<any> {
    const payload: any = { ...identite };
    if (createdBy) payload.createdBy = createdBy;
    return this.post('/patients', payload);
  }

  // Enrich one or many local records with identity data fetched from the external service.
  // Accepts an array of records or a single record. Looks for `patientId` property on each record.
  async enrichWithIdentity<
    T extends { patientId?: string } | Array<{ patientId?: string }>,
  >(data: T): Promise<any> {
    const isArray = Array.isArray(data);
    const records: Array<any> = isArray ? (data as any) : [data as any];

    // gather unique ids
    const ids = Array.from(
      new Set(records.map((r) => r?.patientId).filter(Boolean)),
    );
    const identities: Record<string, any> = {};
    await Promise.all(
      ids.map(async (id) => {
        try {
          const p = await this.getPatient(id);
          if (p) identities[id] = p;
        } catch (e) {
          // ignore individual failures but log
          console.error(`Failed to fetch identity for ${id}:`, e?.message ?? e);
        }
      }),
    );

    const enriched = records.map((r) => {
      const id = r?.patientId;
      const identity = id ? identities[id] || null : null;
      // L'identité Accueil ne doit qu'ajouter des champs (nom, prénom, idDossier...), jamais
      // écraser un champ déjà présent sur l'enregistrement local — notamment `id`, qui pour la
      // plupart des entités (CPA, ActivitePerOp, NotificationCPA...) est leur propre clé
      // primaire, distincte de l'id du patient côté Accueil. Priorité au record local en cas de
      // collision de nom de champ.
      return { ...(identity || {}), ...r };
    });

    return isArray ? enriched : enriched[0];
  }

  // Méthode générique pour les requêtes GET
  async get(endpoint: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`);
      return response.data;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      console.error(`Erreur GET ${endpoint}:`, err);
      throw err;
    }
  }

  // Méthode générique pour les requêtes POST
  async post(endpoint: string, data: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data);
      return response.data;
    } catch (err) {
      console.error(`Erreur POST ${endpoint}:`, err);
      throw err;
    }
  }
}

// Export par défaut pour faciliter l'import
export default AccueilClient;
