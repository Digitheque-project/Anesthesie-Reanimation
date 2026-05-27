export interface MembreEquipe {
  id: string;
  nom: string;
  role: string;
  specialite: string;
  image?: string;
}

export const equipeOperatoire: MembreEquipe[] = [
  {
    id: "1",
    nom: "Dr. RANDRIAMANANA Martin",
    role: "Chirurgien Principal",
    specialite: "Chirurgie Digestive",
  },
  {
    id: "2",
    nom: "Dr. ANDRIANASOLO Jean",
    role: "Anesthésiste",
    specialite: "Réanimation",
  },
  {
    id: "3",
    nom: "Mme. RASOAMANANA Bakoly",
    role: "Infirmière IBODE",
    specialite: "Bloc Opératoire",
  },
  {
    id: "4",
    nom: "M. RAZAFINDRAKOTO Luc",
    role: "Aide Opératoire",
    specialite: "Interne",
  },
];
