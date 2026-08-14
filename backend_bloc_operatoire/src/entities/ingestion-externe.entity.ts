import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

export enum CanalIngestion {
  PRESCRIPTION_BLOC = 'PRESCRIPTION_BLOC',
  PRESCRIPTION_IMAGERIE = 'PRESCRIPTION_IMAGERIE',
  WEBHOOK_SERVICE = 'WEBHOOK_SERVICE',
}

// Journal durable de tout ce que le Bloc a déjà ingéré, quelle que soit la porte d'entrée.
//
// Il n'existait aucune trace de ce genre : la déduplication reposait sur
// `PatientBloc.prescriptionExterneId`, une colonne UNIQUE qui ne garde qu'UNE seule référence par
// patient — la plus récente, puisque chaque nouvelle prescription l'écrase. Conséquences :
//  - une prescription plus ancienne re-poussée par le service source n'était plus reconnue comme
//    déjà ingérée (la colonne portait entre-temps la référence d'une autre prescription) : le
//    patient ré-apparaissait dans la cloche avec un carillon, pour une prescription déjà traitée ;
//  - la prescription imagerie n'avait, elle, aucune référence enregistrée du tout : sa seule
//    protection était l'état courant du patient, ce qui la ré-ingérait à chaque évènement dès que
//    l'épisode précédent était clos ;
//  - une prescription sans acte nommé échappait à toutes les gardes fondées sur le libellé, et
//    était donc ré-ingérée à chaque cycle de polling (une notification toutes les 15 secondes).
// Une ligne par (canal, référence externe) règle les trois cas d'un coup, sans dépendre de l'état
// courant du patient.
@Entity('ingestions_externes')
@Unique('UQ_ingestion_canal_reference', ['canal', 'referenceExterne'])
export class IngestionExterne {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CanalIngestion })
  canal: CanalIngestion;

  // Identifiant de la prescription / demande tel que porté par le service source.
  @Column({ length: 150 })
  referenceExterne: string;

  @Index()
  @Column({ length: 50 })
  patientId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serviceSourceId: string | null;

  // Libellé retenu au moment de l'ingestion — utile pour tracer ce qui est réellement entré au
  // bloc quand le service source a modifié sa prescription depuis.
  @Column({ type: 'varchar', length: 255, nullable: true })
  libelle: string | null;

  @CreateDateColumn()
  ingereeLe: Date;
}
