export interface CentralUser {
    userId: string;
    nom: string;
    prenom: string;
    email: string;
    serviceId: string;
    roleId: string;
    role: string;
    permissions: string[];
    accesExterne: boolean;
    chu: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
        responsable?: string;
        logoUrl?: string;
    };
}
