import axios from 'axios';

// Fonction utilitaire pour vérifier les erreurs Axios
function isAxiosError(error: any): boolean {
  return error && error.isAxiosError === true;
}

// Sans timeout explicite, un appel vers Accueil resterait en attente indéfiniment si le
// service est lent/endormi (Render free tier) — avec jusqu'à des centaines d'appels en
// parallèle (voir enrichWithIdentity, appelé pour chaque opération du Rapport), cela suffit à
// dépasser le timeout de la plateforme et faire échouer toute la requête (y compris les
// sections qui n'avaient pourtant pas besoin d'Accueil). 8s : assez court pour ne jamais faire
// traîner tout un tableau de bord, assez long pour un aller-retour normal.
const TIMEOUT_MS = 8000;

// L'identité d'un patient (nom, prénom, date de naissance...) ne change pratiquement jamais, mais
// elle était redemandée au service Accueil à CHAQUE affichage de liste — or la cloche de
// notifications interroge le backend toutes les 10 secondes, et plusieurs postes du bloc sont
// connectés en même temps. Ce cache court évite de marteler un service externe (hébergé sur une
// offre qui s'endort, d'où des réponses de plusieurs secondes) pour une donnée quasi figée.
const CACHE_IDENTITE_MS = 5 * 60 * 1000;

// Classe AccueilClient qui gère les appels vers l'API externe
export class AccueilClient {
  private readonly baseUrl: string;
  private readonly cacheIdentites = new Map<
    string,
    { valeur: any; expireLe: number }
  >();
  // Requêtes en vol : sans cela, une liste de 40 patients affichée simultanément sur 3 postes
  // déclenchait 3 appels identiques par patient. On partage la même promesse.
  private readonly enVol = new Map<string, Promise<any>>();

  // `baseUrl` reçu ici est la racine nue du service Accueil (ex. https://acceuil-back.onrender.com,
  // voir ACCUEIL_API_URL) — le suffixe `/accueil` vivait auparavant dans la variable
  // d'environnement elle-même ; il est maintenant posé une bonne fois pour toutes ici, pour que
  // toutes les URLs construites plus bas (`${this.baseUrl}/patients/...`, etc.) continuent de
  // résoudre exactement comme avant.
  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl.replace(/\/+$/, '')}/accueil`;
  }

  private async getPatientCache(patientId: string): Promise<any> {
    const enCache = this.cacheIdentites.get(patientId);
    if (enCache && enCache.expireLe > Date.now()) return enCache.valeur;

    const dejaEnVol = this.enVol.get(patientId);
    if (dejaEnVol) return dejaEnVol;

    const requete = this.getPatientData(patientId)
      .then((valeur) => {
        // Un patient introuvable (null) est mis en cache lui aussi : sans cela, chaque
        // rafraîchissement relançait un appel voué au même 404.
        this.cacheIdentites.set(patientId, {
          valeur,
          expireLe: Date.now() + CACHE_IDENTITE_MS,
        });
        return valeur;
      })
      .finally(() => {
        this.enVol.delete(patientId);
      });
    this.enVol.set(patientId, requete);
    return requete;
  }

  // Méthode pour récupérer les données d'accueil
  async getAccueilData(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/accueil`, { timeout: TIMEOUT_MS });
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
      const response = await axios.get(`${this.baseUrl}/patients/${patientId}`, { timeout: TIMEOUT_MS });
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
          const p = await this.getPatientCache(id);
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
      const response = await axios.get(`${this.baseUrl}${endpoint}`, { timeout: TIMEOUT_MS });
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
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data, { timeout: TIMEOUT_MS });
      return response.data;
    } catch (err) {
      console.error(`Erreur POST ${endpoint}:`, err);
      throw err;
    }
  }
}

// Export par défaut pour faciliter l'import
export default AccueilClient;
