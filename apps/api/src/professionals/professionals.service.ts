import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProfessionalDto,
  UpdateProfessionalDto,
} from './dto/professional.dto';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.professional.findMany({
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.professional.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    });
    if (!item) throw new NotFoundException('Profesional no encontrado');
    return item;
  }

  async create(dto: CreateProfessionalDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.userEmail.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('El email de usuario ya está en uso');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.professional.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          document: dto.document,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          gender: dto.gender,
          specialty: dto.specialty,
          user: {
            create: {
              email: dto.userEmail.toLowerCase(),
              passwordHash,
              role: Role.PROFESSIONAL,
            },
          },
        },
        include: {
          user: { select: { id: true, email: true, role: true } },
        },
      });
    } catch {
      throw new ConflictException(
        'No se pudo crear el profesional (documento o email duplicado)',
      );
    }
  }

  async update(id: string, dto: UpdateProfessionalDto) {
    const professional = await this.findOne(id);
    const { password, ...rest } = dto;

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await this.prisma.user.update({
        where: { id: professional.userId },
        data: { passwordHash },
      });
    }

    try {
      return await this.prisma.professional.update({
        where: { id },
        data: rest,
        include: {
          user: { select: { id: true, email: true, role: true } },
        },
      });
    } catch {
      throw new ConflictException('Documento o datos duplicados');
    }
  }

  async remove(id: string) {
    const professional = await this.findOne(id);
    await this.prisma.user.delete({ where: { id: professional.userId } });
    return { deleted: true };
  }
}
