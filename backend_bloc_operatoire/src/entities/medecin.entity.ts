import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RoleMedecin {
  CHIRURGIEN = 'CHIRURGIEN',
  ANESTHESISTE = 'ANESTHESISTE',
  MEDECIN_RESPONSABLE = 'MEDECIN_RESPONSABLE',
  INFIRMIER = 'INFIRMIER',
  TECHNICIEN = 'TECHNICIEN',
  DIRECTEUR_MEDICAL = 'DIRECTEUR_MEDICAL',
}

export enum OrdreProfessionnel {
  ONM = 'ONM', // Ordre National des Médecins
  ONIM = 'ONIM', // Ordre National des Infirmières
  ONSFM = 'ONSFM', // Ordre National des Sages-Femmes
  ONPM = 'ONPM', // Ordre National des Pharmaciens
  AUTRE = 'AUTRE',
}

@Entity('medecins')
export class Medecin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ length: 10 })
  initiales: string;

  @Column({ type: 'enum', enum: RoleMedecin })
  role: RoleMedecin;

  @Column({ length: 50, unique: true })
  numeroOrdre: string;

  @Column({ type: 'enum', enum: OrdreProfessionnel })
  ordre: OrdreProfessionnel;

  @Column({ length: 20 })
  telephone: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 50 })
  matricule: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
