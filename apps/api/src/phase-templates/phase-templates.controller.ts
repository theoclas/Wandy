import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PhaseTemplatesService } from './phase-templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.decorator';

@Controller('phase-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PhaseTemplatesController {
  constructor(private service: PhaseTemplatesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
