import { PrismaClient, Role, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const eriksonPhases = [
  {
    sortOrder: 1,
    name: 'Confianza básica vs. Desconfianza',
    crisis: 'Confianza vs Desconfianza',
    description: 'Etapa de la infancia (0-18 meses). Desarrollo del sentido de seguridad y confianza en el cuidador.',
    items: [
      'Muestra seguridad al explorar el entorno',
      'Confía en las figuras de cuidado',
      'Expresa necesidades de forma adecuada',
    ],
  },
  {
    sortOrder: 2,
    name: 'Autonomía vs. Vergüenza y duda',
    crisis: 'Autonomía vs Vergüenza y duda',
    description: 'Primera infancia (18 meses-3 años). Desarrollo de la autonomía y el autocontrol.',
    items: [
      'Realiza tareas simples de forma independiente',
      'Tolera la frustración sin vergüenza excesiva',
      'Expresa preferencias propias',
    ],
  },
  {
    sortOrder: 3,
    name: 'Iniciativa vs. Culpa',
    crisis: 'Iniciativa vs Culpa',
    description: 'Edad preescolar (3-5 años). Capacidad de iniciar actividades y planificar.',
    items: [
      'Inicia actividades espontáneamente',
      'Asume roles en el juego',
      'Maneja la culpa de forma proporcional',
    ],
  },
  {
    sortOrder: 4,
    name: 'Laboriosidad vs. Inferioridad',
    crisis: 'Laboriosidad vs Inferioridad',
    description: 'Edad escolar (5-12 años). Competencia y sentido de logro.',
    items: [
      'Persiste ante tareas desafiantes',
      'Valora sus logros sin sentirse inferior',
      'Colabora en actividades grupales',
    ],
  },
  {
    sortOrder: 5,
    name: 'Identidad vs. Confusión de roles',
    crisis: 'Identidad vs Confusión de roles',
    description: 'Adolescencia (12-18 años). Formación de la identidad personal.',
    items: [
      'Tiene una imagen coherente de sí mismo',
      'Explora roles sin confusión paralizante',
      'Integra valores personales y sociales',
    ],
  },
  {
    sortOrder: 6,
    name: 'Intimidad vs. Aislamiento',
    crisis: 'Intimidad vs Aislamiento',
    description: 'Adultez temprana (18-40 años). Capacidad de formar relaciones íntimas.',
    items: [
      'Establece vínculos cercanos de confianza',
      'Mantiene reciprocidad en relaciones',
      'Evita el aislamiento emocional crónico',
    ],
  },
  {
    sortOrder: 7,
    name: 'Generatividad vs. Estancamiento',
    crisis: 'Generatividad vs Estancamiento',
    description: 'Adultez media (40-65 años). Contribución a la sociedad y a las siguientes generaciones.',
    items: [
      'Se involucra en el cuidado de otros',
      'Aporta productivamente a su entorno',
      'Evita el estancamiento personal',
    ],
  },
  {
    sortOrder: 8,
    name: 'Integridad vs. Desesperación',
    crisis: 'Integridad vs Desesperación',
    description: 'Madurez (65+ años). Aceptación de la vida vivida y sentido de integridad.',
    items: [
      'Acepta el recorrido vital con coherencia',
      'Mantiene sentido de propósito',
      'Enfrenta la finitud sin desesperación paralizante',
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wandy.local' },
    update: {},
    create: {
      email: 'admin@wandy.local',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.patientType.upsert({
    where: { name: 'General' },
    update: {},
    create: {
      name: 'General',
      description: 'Tipo de paciente por defecto',
    },
  });

  const existingPhases = await prisma.phaseTemplate.count();
  if (existingPhases === 0) {
    for (const phase of eriksonPhases) {
      await prisma.phaseTemplate.create({
        data: {
          sortOrder: phase.sortOrder,
          name: phase.name,
          crisis: phase.crisis,
          description: phase.description,
          items: {
            create: phase.items.map((label, index) => ({
              sortOrder: index + 1,
              label,
            })),
          },
        },
      });
    }
  }

  const professionalPassword = await bcrypt.hash('Prof123!', 10);
  const professionalUser = await prisma.user.upsert({
    where: { email: 'profesional@wandy.local' },
    update: {},
    create: {
      email: 'profesional@wandy.local',
      passwordHash: professionalPassword,
      role: Role.PROFESSIONAL,
      professional: {
        create: {
          firstName: 'Ana',
          lastName: 'García',
          document: '10000001',
          phone: '3000000001',
          email: 'profesional@wandy.local',
          gender: Gender.FEMALE,
          specialty: 'Psicología clínica',
        },
      },
    },
  });

  console.log('Seed OK');
  console.log('Admin:', admin.email, '/ Admin123!');
  console.log('Profesional:', professionalUser.email, '/ Prof123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
