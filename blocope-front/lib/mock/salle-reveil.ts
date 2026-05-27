import { PatientSortie, ServiceDestination } from "@/types/bloc";

export const mockPatientSortie: PatientSortie = {
  id: "1",
  nom: "JEAN-PIERRE",
  prenom: "Marc",
  idDossier: "#PX-90442-24",
  chambre: "Bloc B - 402",
  intervention: "Cholecystectomie",
  statut: "stable",
  scoreSCCRE: 9,
  heureValidation: "14:45",
};

export const mockServicesDestination: ServiceDestination[] = [
  { id: "1", label: "Chirurgie générale" },
  { id: "2", label: "Médecine interne" },
  { id: "3", label: "Cardiologie" },
  { id: "4", label: "Orthopédie" },
  { id: "5", label: "Réanimation" },
  { id: "6", label: "Soins intensifs" },
];
