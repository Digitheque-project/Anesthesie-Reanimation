import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProtocoleOperatoire } from './protocole-operatoire.entity';

export enum TypeDrainage {
  SONDE_NASO_GASTRIQUE = 'SONDE_NASO_GASTRIQUE',
  DRAIN_CRANE = 'DRAIN_CRANE',
  DRAIN_THORAX = 'DRAIN_THORAX',
  DRAIN_ABDOMEN = 'DRAIN_ABDOMEN',
}

export enum ModeDrainage {
  SIPHON = 'SIPHON',
  ASPIRATION = 'ASPIRATION',
  REDON = 'REDON',
}

export enum CoteDrainage {
  GAUCHE = 'GAUCHE',
  DROITE = 'DROITE',
}

@Entity('drainages')
export class Drainage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TypeDrainage })
  type: TypeDrainage;

  @Column({ type: 'enum', enum: ModeDrainage })
  mode: ModeDrainage;

  @Column({ type: 'enum', enum: CoteDrainage, nullable: true })
  cote: CoteDrainage;

  @ManyToOne(() => ProtocoleOperatoire, (protocole) => protocole.drainages, {
    onDelete: 'CASCADE',
  })
  protocole: ProtocoleOperatoire;
}
