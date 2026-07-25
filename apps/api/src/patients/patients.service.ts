import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClinicalHistoriesService } from '../clinical-histories/clinical-histories.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    private prisma: PrismaService,
    private clinicalHistories: ClinicalHistoriesService,
  ) {}

  findAll() {
    return this.prisma.patient.findMany({
      include: {
        patientType: true,
        professional: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        patientType: true,
        professional: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
    if (!item) throw new NotFoundException('Paciente no encontrado');
    return item;
  }

  async create(dto: CreatePatientDto) {
    try {
      const patient = await this.prisma.patient.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          document: dto.document,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          gender: dto.gender,
          birthDate: new Date(dto.birthDate),
          centerEntryDate: new Date(dto.centerEntryDate),
          patientTypeId: dto.patientTypeId,
          professionalId: dto.professionalId,
        },
        include: {
          patientType: true,
          professional: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      await this.clinicalHistories.ensureHistory(patient.id);
      return patient;
    } catch {
      throw new ConflictException(
        'No se pudo crear el paciente (documento duplicado o datos inválidos)',
      );
    }
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };
    delete data.systemEntryDate;

    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    if (dto.centerEntryDate) {
      data.centerEntryDate = new Date(dto.centerEntryDate);
    }

    try {
      return await this.prisma.patient.update({
        where: { id },
        data,
        include: {
          patientType: true,
          professional: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
    } catch {
      throw new ConflictException('Documento o datos duplicados');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.patient.delete({ where: { id } });
    return { deleted: true };
  }
}
