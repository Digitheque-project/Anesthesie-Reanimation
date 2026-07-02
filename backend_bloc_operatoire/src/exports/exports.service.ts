import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { AccueilClient } from '../external/accueil.client';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(PatientBloc) private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(ActivitePerOp) private activiteRepo: Repository<ActivitePerOp>,
    private accueilClient: AccueilClient,
  ) {}

  async exportPatientsExcel(): Promise<ExcelJS.Buffer> {
    const patients = await this.patientBlocRepo.find({ order: { createdAt: 'DESC' } });
    const enriched = await this.accueilClient.enrichWithIdentity(patients);
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

    enriched.forEach((p) => sheet.addRow({
      idDossier: p.idDossier,
      nom: p.patient?.nom ?? '',
      prenom: p.patient?.prenom ?? '',
      statut: p.statut,
      niveauUrgence: p.niveauUrgence,
      chambre: p.chambre,
    }));
    return workbook.xlsx.writeBuffer();
  }

  async exportPlanningExcel(date: string): Promise<ExcelJS.Buffer> {
    const activites = await this.activiteRepo.find({ where: { dateOperation: new Date(date) }, relations: ['chirurgien'] });
    const enriched = await this.accueilClient.enrichWithIdentity(activites);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Planning');

    sheet.columns = [
      { header: 'Patient', key: 'patient', width: 30 },
      { header: 'Chirurgien', key: 'chirurgien', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
    ];

    enriched.forEach((a) => sheet.addRow({
      patient: a.patient ? `${a.patient.nom} ${a.patient.prenom}` : a.patientId,
      chirurgien: `${a.chirurgien.nom} ${a.chirurgien.prenom}`,
      date: a.dateOperation,
    }));
    return workbook.xlsx.writeBuffer();
  }

  async exportPatientJSON(patientId: string): Promise<any> {
    const patient = await this.patientBlocRepo.findOne({ where: { patientId } });
    if (!patient) throw new NotFoundException('Patient non trouvé');
    const identite = await this.accueilClient.getPatient(patientId);
    return { ...patient, ...identite, patientId };
  }
}
