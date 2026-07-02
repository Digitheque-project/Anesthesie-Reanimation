import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('patients/excel')
  async exportPatientsExcel(@Res() res: Response) {
    const buffer = await this.exportsService.exportPatientsExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=patients.xlsx');
    res.send(buffer);
  }

  @Get('planning/excel')
  async exportPlanningExcel(@Query('date') date: string, @Res() res: Response) {
    const buffer = await this.exportsService.exportPlanningExcel(date);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=planning_${date}.xlsx`);
    res.send(buffer);
  }

  @Get('patient/:id/pdf')
  async exportPatientJSON(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.exportsService.exportPatientJSON(id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=dossier_json_${id}.pdf`);
    res.send(buffer);
  }
}
