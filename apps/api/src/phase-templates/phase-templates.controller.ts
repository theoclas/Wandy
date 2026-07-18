import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PhaseTemplatesService } from './phase-templates.service';
import {
  CreatePhaseItemDto,
  CreatePhaseTemplateDto,
  UpdatePhaseItemDto,
  UpdatePhaseTemplateDto,
} from './dto/phase-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/roles.decorator';

@Controller('phase-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PhaseTemplatesController {
  constructor(private service: PhaseTemplatesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreatePhaseTemplateDto) {
    return this.service.create(dto);
  }

  @Patch('items/:itemId')
  @Roles(Role.ADMIN)
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdatePhaseItemDto,
  ) {
    return this.service.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @Roles(Role.ADMIN)
  removeItem(@Param('itemId') itemId: string) {
    return this.service.removeItem(itemId);
  }

  @Post(':id/items')
  @Roles(Role.ADMIN)
  addItem(@Param('id') id: string, @Body() dto: CreatePhaseItemDto) {
    return this.service.addItem(id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePhaseTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
