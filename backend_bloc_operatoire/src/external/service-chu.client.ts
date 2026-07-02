import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ServiceChuClient {
  private readonly logger = new Logger(ServiceChuClient.name);
  private readonly baseUrl: string;
  private readonly chuId: string;
  private readonly serviceId: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('externalServices.serviceChuApiUrl') ?? '';
    this.chuId = this.config.get<string>('externalServices.chuId') ?? '';
    this.serviceId = this.config.get<string>('externalServices.serviceId') ?? '';
  }

  async getChu(id?: string): Promise<any> {
    const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/chu/${id ?? this.chuId}`));
    return data;
  }

  async getService(id?: string): Promise<any> {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/service/chu/${this.chuId}/service/${id ?? this.serviceId}`),
    );
    return data;
  }
}
