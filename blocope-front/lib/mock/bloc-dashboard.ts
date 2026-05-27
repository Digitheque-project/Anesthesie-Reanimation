import { StatCard, Medecin, PatientBloc, PatientReveil } from "@/types/bloc";

export const mockMedecin: Medecin = {
  id: "1",
  nom: "RASOANIRINA",
  prenom: "Sarah",
  role: "Directeur Médical",
  initiales: "SR",
};

export const dashboardStats: StatCard[] = [
  {
    label: "Patients opérés",
    value: "6",
    subLabel: "Aujourd'hui",
    icon: "groups",
    color: "primary",
  },
  {
    label: "En salle de réveil",
    value: "2",
    subLabel: "En cours",
    icon: "bed",
    color: "secondary",
  },
  {
    label: "Checklists validées",
    value: "4",
    subLabel: "Complètes",
    icon: "fact_check",
    color: "emerald-600",
  },
  {
    label: "Alertes actives",
    value: "1",
    subLabel: "À traiter",
    icon: "warning",
    color: "tertiary",
  },
];

export const mockPatientsJour: PatientBloc[] = [
  {
    id: "1",
    nom: "RANDRIANIRINA",
    prenom: "Marc",
    patientId: "88201-B",
    intervention: "Appendicectomie aiguë",
    heure: "08:00",
    dureePrevue: "01:30",
    departBloc: "08:15",
    priorite: "STAT",
  },
  {
    id: "2",
    nom: "SULVIN",
    prenom: "Elena",
    patientId: "44921-X",
    intervention: "Ostéosynthèse Fémur",
    heure: "10:45",
    dureePrevue: "03:00",
    departBloc: "10:15",
    priorite: "URGENT",
  },
  {
    id: "3",
    nom: "MORASATA",
    prenom: "Ricardo",
    patientId: "11029-C",
    intervention: "Cholecystectomie Laparo",
    heure: "11:30",
    dureePrevue: "02:00",
    departBloc: "11:30",
    priorite: "NORMAL",
  },
  {
    id: "4",
    nom: "MARTIN",
    prenom: "Lantonirina",
    patientId: "22541-Z",
    intervention: "Septoplastie nasale",
    heure: "14:00",
    dureePrevue: "01:45",
    departBloc: "13:45",
    priorite: "NORMAL",
  },
];

export const mockPatientsReveil: PatientReveil[] = [
  {
    id: "r1",
    nom: "DORA",
    prenom: "Claire",
    patientId: "55231-M",
    intervention: "Arthroscopie épaule",
    salleLit: "Réveil 01",
    dureePrevue: "02:00",
    statut: "Stable",
  },
  {
    id: "r2",
    nom: "SITRAKA",
    prenom: "Marie",
    patientId: "99104-D",
    intervention: "Résection pulmonaire",
    salleLit: "Réveil 03",
    dureePrevue: "04:00",
    statut: "Stable",
  },
];

export const mockEtatGlobal = {
  total: 4,
  stat: 1,
  urgent: 1,
  normal: 2,
};
