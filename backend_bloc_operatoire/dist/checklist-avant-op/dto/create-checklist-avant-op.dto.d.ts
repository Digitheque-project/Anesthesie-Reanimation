export declare class CreateChecklistAvantOpDto {
    patientId: string;
    dateCreation: string;
    identiteConfirmee?: boolean;
    interventionSiteConfirmes?: boolean;
    documentationDisponible?: boolean;
    installationConnue?: boolean;
    materielChirurgicalVerifie?: boolean;
    materielAnesthesiqueVerifie?: boolean;
    allergiePatient?: boolean;
    risqueIntubation?: boolean;
    risqueSaignement?: boolean;
    notesChirurgicales?: string;
    notesAnesthesiques?: string;
    notesIdeIbode?: string;
}
