import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hash } from 'bcryptjs';
import { Role } from '../auth/roles.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ name: 'mot_de_passe', length: 255, select: false })
  motDePasse: string;

  @Column({ type: 'enum', enum: Role, default: Role.CHIRURGIEN })
  role: Role;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.motDePasse) return;
    const isHashed =
      this.motDePasse.startsWith('$2a$') || this.motDePasse.startsWith('$2b$');
    if (!isHashed) this.motDePasse = await hash(this.motDePasse, 10);
  }
}
