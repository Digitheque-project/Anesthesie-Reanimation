export interface CentralUser {
  userId: string;
  nom: string;
  prenom: string;
  email: string;
  serviceId: string;
  roleId: string;
  role: string;
  permissions: string[];
  // true lorsque l'utilisateur n'appartient PAS au service Bloc Operatoire et a ete autorise par
  // permission depuis un autre service du CHU (lecture transversale). Le garde refuse a ces
  // acces toute route protegee par @RequireRoleClinique, donc toute ecriture.
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
