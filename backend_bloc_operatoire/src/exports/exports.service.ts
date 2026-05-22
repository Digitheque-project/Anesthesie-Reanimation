import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(ActivitePerOp) private activiteRepo: Repository<ActivitePerOp>,
  ) {}

  async exportPatientsExcel(): Promise<ExcelJS.Buffer> {
    const patients = await this.patientRepo.find({ order: { nom: 'ASC' } });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Patients');

    sheet.columns = [
      { header: 'ID Dossier', key: 'idDossier', width: 15 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Statut', key: 'statut', width: 20 },
      { header: 'Urgence', key: 'niveauUrgence', width: 15 },
      { header: 'Chambre', key: 'chambre', width: 10 },
    ];

    patients.forEach((p) => sheet.addRow(p));
    return workbook.xlsx.writeBuffer();
  }

  async exportPlanningExcel(date: string): Promise<ExcelJS.Buffer> {
    const activites = await this.activiteRepo.find({ where: { dateOperation: new Date(date) }, relations: ['patient', 'chirurgien'] });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Planning');

    sheet.columns = [
      { header: 'Patient', key: 'patient', width: 30 },
      { header: 'Chirurgien', key: 'chirurgien', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
    ];

    activites.forEach((a) => sheet.addRow({ patient: `${a.patient.nom} ${a.patient.prenom}`, chirurgien: `${a.chirurgien.nom} ${a.chirurgien.prenom}`, date: a.dateOperation }));
    return workbook.xlsx.writeBuffer();
  }

  async exportPatientJSON(patientId: string): Promise<any> {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient non trouvé');
    return patient;
  }
}
