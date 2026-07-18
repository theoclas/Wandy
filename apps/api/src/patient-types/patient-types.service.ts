import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePatientTypeDto,
  UpdatePatientTypeDto,
} from './dto/patient-type.dto';

@Injectable()
export class PatientTypesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.patientType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.patientType.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Tipo de paciente no encontrado');
    return item;
  }

  async create(dto: CreatePatientTypeDto) {
    try {
      return await this.prisma.patientType.create({ data: dto });
    } catch {
      throw new ConflictException('Ya existe un tipo con ese nombre');
    }
  }

  async update(id: string, dto: UpdatePatientTypeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.patientType.update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new ConflictException('Ya existe un tipo con ese nombre');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.patientType.delete({ where: { id } });
  }
}
