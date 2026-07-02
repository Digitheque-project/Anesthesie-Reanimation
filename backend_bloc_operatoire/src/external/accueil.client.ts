import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ExternalPatient } from './dto/external-patient.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';

@Injectable()
export class AccueilClient {
  private readonly logger = new Logger(AccueilClient.name);
  private readonly baseUrl: string;
  private readonly chuId: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('externalServices.accueilApiUrl') ?? '';
    this.chuId = this.config.get<string>('externalServices.chuId') ?? '';
  }

  async listPatients(chuId?: string): Promise<ExternalPatient[]> {
    const { data } = await firstValueFrom(
      this.http.get<ExternalPatient[]>(`${this.baseUrl}/patients`, {
        params: { chuId: chuId ?? this.chuId },
      }),
    );
    return data ?? [];
  }

  async getPatient(id: string, chuId?: string): Promise<ExternalPatient | null> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<ExternalPatient>(`${this.baseUrl}/patients/${id}`, {
          params: { chuId: chuId ?? this.chuId },
        }),
      );
      return data ?? null;
    } catch (err) {
      if ((err as AxiosError).response?.status === 404) return null;
      this.logger.error(`Erreur getPatient(${id}): ${(err as Error).message}`);
      throw err;
    }
  }

  async registerPatient(dto: RegisterPatientDto, createdBy: string): Promise<ExternalPatient> {
    const { data } = await firstValueFrom(
      this.http.post<ExternalPatient>(`${this.baseUrl}/patients/register`, {
        ...dto,
        chuId: this.chuId,
        createdBy,
      }),
    );
    return data;
  }

  async searchPatients(query: string, chuId?: string): Promise<ExternalPatient[]> {
    const all = await this.listPatients(chuId);
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter(
      (p) =>
        p.nom?.toLowerCase().includes(q) ||
        p.prenom?.toLowerCase().includes(q) ||
        p.cin?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q),
    );
  }

  async enrichWithIdentity<T extends { patientId: string }>(
    records: T[],
    chuId?: string,
  ): Promise<Array<T & { patient: ExternalPatient | null }>> {
    if (records.length === 0) return [];
    let patients: ExternalPatient[] = [];
    try {
      patients = await this.listPatients(chuId);
    } catch (err) {
      this.logger.error(`enrichWithIdentity: échec listPatients: ${(err as Error).message}`);
    }
    const byId = new Map(patients.map((p) => [p.id, p]));
    return records.map((record) => ({ ...record, patient: byId.get(record.patientId) ?? null }));
  }
}
