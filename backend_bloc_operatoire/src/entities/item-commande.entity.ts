import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BonCommandeAnesthesie } from './bon-commande-anesthesie.entity';

@Entity('items_commande')
export class ItemCommande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ default: false })
  selectionne: boolean;

  @Column({ nullable: true })
  quantite: string;

  @Column({ nullable: true })
  dosage: string;

  @Column({ nullable: true })
  observation: string;

  @ManyToOne(() => BonCommandeAnesthesie, (bon) => bon.items)
  bonCommande: BonCommandeAnesthesie;
}
