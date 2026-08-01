import { PhaseUnlockMode, PrismaClient, Role, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { equalWeights } from '../src/common/weights';

const prisma = new PrismaClient();

type SubgroupSeed = {
  sortOrder: number;
  unlockRank: number;
  name: string;
  purpose?: string;
  hideInUi?: boolean;
  criteria: string[];
};

type PhaseSeed = {
  sortOrder: number;
  name: string;
  description?: string;
  unlockMode: PhaseUnlockMode;
  subgroups: SubgroupSeed[];
};

const phases: PhaseSeed[] = [
  {
    sortOrder: 1,
    name: 'Destellos',
    description: 'Primera fase del proceso. Logros de adaptación y estabilización inicial.',
    unlockMode: PhaseUnlockMode.ALL_OPEN,
    subgroups: [
      {
        sortOrder: 1,
        unlockRank: 1,
        name: 'Adaptación a la comunidad',
        criteria: [
          'Cumple normas básicas del centro.',
          'Respeta horarios.',
          'Participa en actividades obligatorias.',
          'Muestra disposición a permanecer en tratamiento.',
          'Permanece en el programa sin intentos de fuga.',
          'Disminuye la resistencia al tratamiento.',
          'Se integra progresivamente al grupo.',
          'Participa en calistenia y meditación.',
        ],
      },
      {
        sortOrder: 2,
        unlockRank: 1,
        name: 'Desintoxicación',
        criteria: [
          'Mantiene abstinencia durante la fase.',
          'Reconoce síntomas de abstinencia.',
          'Solicita apoyo cuando presenta ansiedad o craving.',
          'Control inicial de impulsos de consumo.',
          'Reconocimiento del daño generado por la sustancia.',
        ],
      },
      {
        sortOrder: 3,
        unlockRank: 1,
        name: 'Convicción',
        criteria: [
          'Reconoce tener un problema de consumo.',
          'Expresa deseo de cambio.',
          'Identifica consecuencias negativas del consumo.',
          'Aceptación del diagnóstico de adicción.',
          'Inicio de responsabilidad personal.',
        ],
      },
      {
        sortOrder: 4,
        unlockRank: 1,
        name: 'Recuperación física',
        criteria: [
          'Mejora del sueño.',
          'Mejora del apetito.',
          'Participación en actividad física o rutinas saludables.',
          'Estabilización física básica.',
        ],
      },
      {
        sortOrder: 5,
        unlockRank: 1,
        name: 'Limpieza del organismo',
        criteria: [
          'Adherencia a indicaciones médicas.',
          'Disminución de síntomas físicos asociados al consumo.',
          'Recuperación física inicial.',
        ],
      },
      {
        sortOrder: 6,
        unlockRank: 1,
        name: 'Equilibrio emocional inicial',
        criteria: [
          'Disminución de agresividad o irritabilidad.',
          'Capacidad de expresar emociones sin violencia o apatía.',
          'Regulación emocional básica.',
        ],
      },
      {
        sortOrder: 7,
        unlockRank: 1,
        name: 'Motivación para solucionar su vida',
        criteria: [
          'Participación en terapia individual y grupal.',
          'Expresión de metas personales.',
          'Aparición de motivación intrínseca.',
        ],
      },
    ],
  },
  {
    sortOrder: 2,
    name: 'Iluminación',
    description: 'Grupos 3 → 2 → 1. Desbloqueo sucesivo con promedio > 3.',
    unlockMode: PhaseUnlockMode.SEQUENTIAL,
    subgroups: [
      {
        sortOrder: 1,
        unlockRank: 1,
        name: 'Grupo 3 — Iniciativa',
        purpose:
          'Que el estudiante pase de una adaptación al tratamiento a convertirse en una persona que empieza a actuar por iniciativa propia, preparándose para asumir niveles mayores de liderazgo y responsabilidad en los siguientes grupos.',
        criteria: [
          'Participa activamente de las actividades sin necesidad de supervisión.',
          'Realiza primera autobiografía.',
          'Realiza 10 señalamientos diarios.',
          'Tiene responsabilidad y autocontrol con la convivencia.',
          'Ha recibido terapia individual.',
        ],
      },
      {
        sortOrder: 2,
        unlockRank: 2,
        name: 'Grupo 2 — Identidad',
        purpose:
          'El estudiante deja de interpretar un personaje y empieza a vivir desde la autenticidad, siendo capaz de confrontarse a sí mismo y de confrontar a otros con un propósito terapéutico. Preparación para el Prelíder.',
        criteria: [
          'Demuestra que comprende el significado de la identidad y la refleja en su comportamiento dentro y fuera de la comunidad terapéutica.',
          'Actúa con autenticidad y coherencia.',
          'Disminuye el doble discurso, evita conductas manipuladoras y mantiene coherencia entre lo que piensa, dice y hace.',
          'Desarrolla habilidades para la confrontación terapéutica.',
          'Participa activamente en los bancos de confrontación, realiza señalamientos objetivos y respetuosos, y recibe la confrontación de sus compañeros con apertura y disposición al cambio.',
          'Realiza al menos 20 señalamientos.',
          'Tiene al menos una terapia de grupo.',
          'Reconoce sus fallas sin justificarlas, acepta la retroalimentación y demuestra disposición para corregirlas.',
          'Evidenciar relaciones interpersonales sanas y transparentes.',
          'Rompe alianzas o "contratos" entre estudiantes y construye relaciones basadas en la honestidad, el respeto y la confianza.',
        ],
      },
      {
        sortOrder: 3,
        unlockRank: 3,
        name: 'Grupo 1 — Prelíder (Generatividad)',
        purpose:
          'El prelíder ya no solo trabaja para cambiar él mismo; ahora empieza a convertirse en un instrumento para el cambio de los demás. Puente hacia el Líder.',
        criteria: [
          'Demuestra que comprende el significado de la generatividad y la expresa mediante acciones de servicio, ejemplo y compromiso con la comunidad terapéutica.',
          'Ejercer un liderazgo basado en el ejemplo.',
          'Mantiene una conducta coherente, responsable y respetuosa, convirtiéndose en un referente positivo para sus compañeros.',
          'Velar por el bienestar del grupo.',
          'Acompaña a los usuarios de grupos inferiores, promueve la integración del grupo y asume con responsabilidad el cuidado de la dinámica comunitaria, siendo el primero en levantarse y el último en acostarse cuando las responsabilidades del grupo lo requieren.',
          'Mantener relaciones terapéuticas éticas.',
          'Evita establecer contratos, alianzas o vínculos inadecuados con usuarios de grupos inferiores y ejerce su rol con imparcialidad, respeto y sentido de servicio.',
          'Demuestra madurez emocional y estabilidad en el proceso de recuperación.',
          'Maneja adecuadamente los conflictos, regula sus emociones, acepta la retroalimentación y responde con criterio y responsabilidad ante las diferentes situaciones de la comunidad.',
          'Realiza 10 observaciones.',
        ],
      },
    ],
  },
  {
    sortOrder: 3,
    name: 'Resplandor',
    description: 'Líderes 1 → 2 → 3. Desbloqueo sucesivo con promedio > 3.',
    unlockMode: PhaseUnlockMode.SEQUENTIAL,
    subgroups: [
      {
        sortOrder: 1,
        unlockRank: 1,
        name: 'Líder 1',
        purpose:
          'Comprende que liderar no significa ejercer poder sobre los demás. Diferencia autoridad (ejemplo, servicio, coherencia, respeto) de autoritarismo (miedo, control, abuso).',
        criteria: [
          'Conocer, comprender y aplicar la capacidad del carácter: Trascendencia.',
          'Demuestra la capacidad de superar límites, afrontar los contratiempos con madurez y perseverar en su proceso de recuperación, convirtiéndose en un ejemplo de resiliencia para los demás.',
          'Coordinar y supervisar el funcionamiento de su grupo.',
          'Garantiza el cumplimiento de las normas, horarios y actividades asignadas.',
          'Resolver conflictos con criterio terapéutico.',
          'Interviene de manera oportuna, justa y respetuosa ante las dificultades de convivencia, siguiendo los lineamientos de la comunidad terapéutica.',
          'Comprende los límites de su rol como líder.',
          'Ejerce su liderazgo desde el ejemplo y el servicio, sin autorizar préstamos, canalizar solicitudes personales o asumir funciones que corresponden al equipo terapéutico o a líderes de mayor jerarquía.',
          'Ser ejemplo permanente de coherencia y disciplina.',
          'Mantiene una conducta estable, responsable y alineada con la filosofía y las normas de la comunidad terapéutica.',
        ],
      },
      {
        sortOrder: 2,
        unlockRank: 2,
        name: 'Líder 2',
        purpose:
          'Un buen líder también sabe obedecer. Ejerce autoridad con justicia y servicio dentro de la estructura de liderazgo. "Quien no sabe obedecer difícilmente sabrá dirigir".',
        criteria: [
          'Consolidar las capacidades del carácter: Identidad y Trascendencia.',
          'Conserva la coherencia entre lo que piensa, dice y hace, aun frente a la presión de otros usuarios; ejerce un liderazgo íntegro, supera los desafíos propios del cargo y no se deja involucrar en manipulaciones, favoritismos o conductas contrarias a la filosofía de la comunidad.',
          'Coordinar el funcionamiento de la comunidad bajo la orientación del Líder 3.',
          'Supervisa el cumplimiento de las normas, organiza las actividades diarias y responde por la adecuada dinámica del grupo.',
          'Ejercer con justicia las funciones propias de su liderazgo.',
          'Canaliza solicitudes, autoriza los asuntos que le corresponden según el reglamento y toma decisiones con imparcialidad, evitando privilegios o favoritismos.',
          'Acompañar y supervisar el desempeño de los Líderes 1 y los Prelíderes.',
          'Orienta, retroalimenta y fortalece el ejercicio del liderazgo, promoviendo el crecimiento de quienes están bajo su responsabilidad.',
          'Demuestra criterio, equilibrio y obediencia a la estructura de liderazgo.',
          'Actúa con madurez en la toma de decisiones, respeta la jerarquía institucional y mantiene una comunicación permanente con el Líder 3 y el equipo terapéutico.',
        ],
      },
      {
        sortOrder: 3,
        unlockRank: 3,
        name: 'Líder 3',
        purpose:
          'La autoridad es una responsabilidad y no un privilegio. Antes de culminar debe interiorizar la identidad institucional: Honestidad · Gratitud · Humildad.',
        criteria: [
          'Consolida todas las capacidades del carácter.',
          'Evidencia la integración de las ocho capacidades del carácter en su forma de pensar, sentir y actuar, convirtiéndose en un modelo de coherencia, madurez y servicio para toda la comunidad terapéutica.',
          'Liderar integralmente la comunidad terapéutica.',
          'Coordina el trabajo de los Líderes 2, Líderes 1, Prelíderes y demás usuarios, garantizando el cumplimiento de las normas, la organización y el adecuado funcionamiento de la comunidad.',
          'Representa a la comunidad ante el equipo terapéutico.',
          'Canaliza las necesidades, inquietudes y propuestas de los usuarios con objetividad, respeto y responsabilidad, manteniendo una comunicación permanente con el equipo interdisciplinario.',
          'Forma y fortalece el equipo de liderazgo.',
          'Acompaña, supervisa y evalúa el desempeño de los demás líderes, promoviendo su crecimiento y corrigiendo oportunamente las dificultades que se presenten.',
          'Demostrar sabiduría, equilibrio y espíritu de servicio.',
          'Ejerce su autoridad con humildad, toma decisiones justas, evita privilegios y favoritismos, y antepone siempre el bienestar de la comunidad al interés personal.',
        ],
      },
    ],
  },
  {
    sortOrder: 4,
    name: 'Esplendor',
    description: 'Reeducación. Criterios de calificación directa sin subgrupos visibles.',
    unlockMode: PhaseUnlockMode.ALL_OPEN,
    subgroups: [
      {
        sortOrder: 1,
        unlockRank: 1,
        name: 'Reeducación',
        hideInUi: true,
        criteria: [
          'Logra incorporar las habilidades trabajadas.',
          'Consolida la conciencia de cambio.',
          'Ayuda a través del servicio dentro de la comunidad terapéutica.',
          'Ayuda a usuarios nuevos.',
          'Es considerado confiable.',
          'Tiene autonomía y toma decisiones.',
          'Tiene compromiso con un estilo de vida saludable.',
          'El usuario está preparado para la reintegración.',
        ],
      },
    ],
  },
];

async function seedPhases() {
  // Wipe clinical + template data (dev reset of old Erikson model).
  await prisma.scoreChangeLog.deleteMany();
  await prisma.patientCriterionScore.deleteMany();
  await prisma.patientSubgroup.deleteMany();
  await prisma.patientPhase.deleteMany();
  await prisma.clinicalHistory.deleteMany();
  await prisma.criterionTemplate.deleteMany();
  await prisma.subgroupTemplate.deleteMany();
  await prisma.phaseTemplate.deleteMany();

  const phaseWeights = equalWeights(phases.length);

  for (let pi = 0; pi < phases.length; pi += 1) {
    const phase = phases[pi];
    const sgWeights = equalWeights(phase.subgroups.length);
    await prisma.phaseTemplate.create({
      data: {
        sortOrder: phase.sortOrder,
        name: phase.name,
        description: phase.description,
        unlockMode: phase.unlockMode,
        weightPct: phaseWeights[pi],
        subgroups: {
          create: phase.subgroups.map((sg, si) => {
            const cWeights = equalWeights(sg.criteria.length);
            return {
              sortOrder: sg.sortOrder,
              unlockRank: sg.unlockRank,
              name: sg.name,
              purpose: sg.purpose,
              hideInUi: sg.hideInUi ?? false,
              weightPct: sgWeights[si],
              criteria: {
                create: sg.criteria.map((label, index) => ({
                  sortOrder: index + 1,
                  label,
                  weightPct: cWeights[index],
                })),
              },
            };
          }),
        },
      },
    });
  }
}

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

  await seedPhases();

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

  console.log('Seed OK — fases Destellos / Iluminación / Resplandor / Esplendor');
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
