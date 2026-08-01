import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PhaseTemplatesService } from './phase-templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/roles.decorator';
import { UpdateWeightsDto } from './dto/phase-template.dto';

@Controller('phase-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PhaseTemplatesController {
  constructor(private service: PhaseTemplatesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch('weights')
  @Roles(Role.ADMIN)
  updateWeights(@Body() dto: UpdateWeightsDto) {
    return this.service.updateWeights(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
