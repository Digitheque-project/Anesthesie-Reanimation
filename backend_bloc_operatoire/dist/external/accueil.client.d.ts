export declare class AccueilClient {
    private readonly baseUrl;
    constructor(baseUrl?: string);
    getAccueilData(): Promise<any>;
    getPatientData(patientId: string): Promise<any>;
    getPatient(patientId: string): Promise<any>;
    searchPatients(q: string): Promise<any[]>;
    registerPatient(identite: any, createdBy?: string): Promise<any>;
    enrichWithIdentity<T extends {
        patientId?: string;
    } | Array<{
        patientId?: string;
    }>>(data: T): Promise<any>;
    get(endpoint: string): Promise<any>;
    post(endpoint: string, data: any): Promise<any>;
}
export default AccueilClient;
