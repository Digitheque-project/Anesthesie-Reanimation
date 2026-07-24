import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Medecin } from '../entities/medecin.entity';
import { CreateMedecinDto } from './dto/create-medecin.dto';
import { UpdateMedecinDto } from './dto/update-medecin.dto';

@Injectable()
export class MedecinService {
  constructor(
    @InjectRepository(Medecin)
    private medecinRepository: Repository<Medecin>,
  ) {}

  async create(createMedecinDto: CreateMedecinDto): Promise<Medecin> {
    const medecin = this.medecinRepository.create(createMedecinDto);
    return this.medecinRepository.save(medecin);
  }

  async findAll(filters?: {
    role?: string;
    recherche?: string;
    page?: number;
    limite?: number;
  }): Promise<{ data: Medecin[]; total: number; page: number; pages: number }> {
    const { role, recherche, page = 1, limite = 10 } = filters || {};
    const skip = (page - 1) * limite;

    let where: FindOptionsWhere<Medecin>[] | FindOptionsWhere<Medecin> = {};

    if (role) {
      where = { ...where, role: role as any };
    }
    if (recherche) {
      where = [
        { ...where, nom: Like(`%${recherche}%`) },
        { ...where, prenom: Like(`%${recherche}%`) },
        { ...where, matricule: Like(`%${recherche}%`) },
      ];
    }

    const [data, total] = await this.medecinRepository.findAndCount({
      where,
      skip,
      take: limite,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, pages: Math.ceil(total / limite) };
  }

  // Utilisé pour relier automatiquement l'utilisateur SSO connecté à sa fiche Médecin locale
  // (ex: anesthésiste réalisant une CPA) — pas de création automatique, la fiche doit exister
  // avec les vraies informations d'ordre professionnel.
  async findByEmail(email: string): Promise<Medecin | null> {
    if (!email) return null;
    return this.medecinRepository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<Medecin> {
    const medecin = await this.medecinRepository.findOne({ where: { id } });
    if (!medecin) {
      throw new NotFoundException(`Médecin avec l'ID ${id} non trouvé`);
    }
    return medecin;
  }

  async update(
    id: string,
    updateMedecinDto: UpdateMedecinDto,
  ): Promise<Medecin> {
    const medecin = await this.findOne(id);
    Object.assign(medecin, updateMedecinDto);
    return this.medecinRepository.save(medecin);
  }

  async remove(id: string): Promise<{ message: string }> {
    const medecin = await this.findOne(id);
    await this.medecinRepository.remove(medecin);
    return { message: 'Médecin supprimé avec succès' };
  }
}
