# Plan: rediseño de historias clínicas por fases

Documento de captura. **No implementa código.** Se irá completando fase por fase hasta que se indique el inicio del desarrollo.

## Identidad visual

- Color principal de la aplicación: **azul rey** (`#1e4dd8` / profundo `#0b1f4a`).
- Color secundario/de acento: **amarillo** (`#f5c518`).
- Tokens aplicados en `apps/web/src/styles.css`.

## Reglas generales de calificación

- Valor inicial por subtarea: **0** (todas las subtareas nacen en `0` por defecto).
- Escala de calificación: **0 a 5**, con decimales (ej. `0`, `1`, `1.2`, `1.5`, `3.7`).
- Todas las subtareas **pesan igual** (promedio simple).
- **Nota de una subfase / grupo / líder** = promedio (ponderado simple) de sus subtareas/criterios.
- **Nota de una fase** = promedio (ponderado) de las notas de sus subfases / grupos / líderes.
- Un grupo/subfase/líder se aprueba para desbloqueo interno cuando su promedio es **superior a 3** (`> 3`).
- **Desbloqueo entre fases (cadena):** Fase 1 disponible al inicio. Fase 2 se desbloquea cuando el promedio de Fase 1 es `> 3`. Fase 3 cuando Fase 2 es `> 3`. Fase 4 cuando Fase 3 es `> 3`.

### Resumen de cálculo

```
nota_subtarea          = 0..5 (inicia en 0)
nota_subfase_o_grupo   = promedio(subtareas)
nota_fase              = promedio(subfases | grupos | líderes)
desbloqueo_fase_N+1    = nota_fase_N > 3
```

Asumido por ahora: dentro de una fase, **todas las subfases/grupos/líderes pesan igual**. Si alguna pesa más, se define peso explícito.

## Jerarquía (misma lógica en todas las fases)

```
Fase
 └── Subfase / Logro / Grupo  (mismo nivel; el nombre cambia según la fase)
      └── Subtarea / Criterio de evaluación
```

---

## Fase 1 — Destellos

### Estructura

7 subfases (logros). Cada una tiene subtareas = criterios de evaluación.

### Desbloqueo interno

Las **7 subfases están disponibles a la vez** (no hay desbloqueo sucesivo entre ellas). La nota de Destellos es el promedio de las 7.

### 1. Adaptación a la comunidad

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Cumple normas básicas del centro. |
| 2 | Respeta horarios. |
| 3 | Participa en actividades obligatorias. |
| 4 | Muestra disposición a permanecer en tratamiento. |
| 5 | Permanece en el programa sin intentos de fuga. |
| 6 | Disminuye la resistencia al tratamiento. |
| 7 | Se integra progresivamente al grupo. |
| 8 | Participa en calistenia y meditación. |

### 2. Desintoxicación

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Mantiene abstinencia durante la fase. |
| 2 | Reconoce síntomas de abstinencia. |
| 3 | Solicita apoyo cuando presenta ansiedad o craving. |
| 4 | Control inicial de impulsos de consumo. |
| 5 | Reconocimiento del daño generado por la sustancia. |

### 3. Convicción

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Reconoce tener un problema de consumo. |
| 2 | Expresa deseo de cambio. |
| 3 | Identifica consecuencias negativas del consumo. |
| 4 | Aceptación del diagnóstico de adicción. |
| 5 | Inicio de responsabilidad personal. |

### 4. Recuperación física

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Mejora del sueño. |
| 2 | Mejora del apetito. |
| 3 | Participación en actividad física o rutinas saludables. |
| 4 | Estabilización física básica. |

### 5. Limpieza del organismo

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Adherencia a indicaciones médicas. |
| 2 | Disminución de síntomas físicos asociados al consumo. |
| 3 | Recuperación física inicial. |

### 6. Equilibrio emocional inicial

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Disminución de agresividad o irritabilidad. |
| 2 | Capacidad de expresar emociones sin violencia o apatía. |
| 3 | Regulación emocional básica. |

### 7. Motivación para solucionar su vida

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Participación en terapia individual y grupal. |
| 2 | Expresión de metas personales. |
| 3 | Aparición de motivación intrínseca. |

---

## Fase 2 — Iluminación

Misma estructura que Destellos: la fase se divide en **grupos** (equivalente a subfases/logros) y cada grupo en **criterios** (subtareas).

### Orden y desbloqueo (regla de progresión)

Los grupos van del **3 al 1** (3 → 2 → 1). No se puede avanzar al siguiente hasta completar el anterior:

| Grupo | Nombre | Se desbloquea cuando… |
|-------|--------|------------------------|
| 3 | Iniciativa | Disponible al iniciar la fase |
| 2 | Identidad | El promedio del Grupo 3 es **superior a 3** |
| 1 | Prelíder (Generatividad) | Los promedios del Grupo 3 y Grupo 2 son **superiores a 3** |

Para efectos de progresión, un grupo se considera **completo/aprobado** cuando su promedio es estrictamente superior a `3` (`> 3`). Un promedio igual a `3` no desbloquea el siguiente grupo. Las subtareas inician en `0`, así que el promedio arranca en `0` hasta que se califiquen.

### Grupo 3 — Iniciativa

**Propósito:** que el estudiante pase de una adaptación al tratamiento a convertirse en una persona que empieza a actuar por iniciativa propia, preparándose para asumir niveles mayores de liderazgo y responsabilidad en los siguientes grupos.

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Participa activamente de las actividades sin necesidad de supervisión. |
| 2 | Realiza primera autobiografía. |
| 3 | Realiza 10 señalamientos diarios. |
| 4 | Tiene responsabilidad y autocontrol con la convivencia. |
| 5 | Ha recibido terapia individual. |

### Grupo 2 — Identidad

**Propósito / hilo conductor:** el estudiante deja de interpretar un personaje y empieza a vivir desde la autenticidad, siendo capaz de confrontarse a sí mismo y de confrontar a otros con un propósito terapéutico. Preparación para el siguiente grupo, Prelíder, donde comenzará a influir positivamente en sus compañeros desde el ejemplo.

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Demuestra que comprende el significado de la identidad y la refleja en su comportamiento dentro y fuera de la comunidad terapéutica. |
| 2 | Actúa con autenticidad y coherencia. |
| 3 | Disminuye el doble discurso, evita conductas manipuladoras y mantiene coherencia entre lo que piensa, dice y hace. |
| 4 | Desarrolla habilidades para la confrontación terapéutica. |
| 5 | Participa activamente en los bancos de confrontación, realiza señalamientos objetivos y respetuosos, y recibe la confrontación de sus compañeros con apertura y disposición al cambio. |
| 6 | Realiza al menos 20 señalamientos. |
| 7 | Tiene al menos una terapia de grupo. |
| 8 | Reconoce sus fallas sin justificarlas, acepta la retroalimentación y demuestra disposición para corregirlas. |
| 9 | Evidenciar relaciones interpersonales sanas y transparentes. |
| 10 | Rompe alianzas o "contratos" entre estudiantes y construye relaciones basadas en la honestidad, el respeto y la confianza. |

### Grupo 1 — Prelíder (Generatividad)

**Propósito / hilo conductor:** el prelíder ya no solo trabaja para cambiar él mismo; ahora empieza a convertirse en un instrumento para el cambio de los demás. Ese es el puente hacia el Líder, donde la influencia deja de ser ocasional y pasa a ser una responsabilidad permanente dentro de la comunidad terapéutica.

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Demuestra que comprende el significado de la generatividad y la expresa mediante acciones de servicio, ejemplo y compromiso con la comunidad terapéutica. |
| 2 | Ejercer un liderazgo basado en el ejemplo. |
| 3 | Mantiene una conducta coherente, responsable y respetuosa, convirtiéndose en un referente positivo para sus compañeros. |
| 4 | Velar por el bienestar del grupo. |
| 5 | Acompaña a los usuarios de grupos inferiores, promueve la integración del grupo y asume con responsabilidad el cuidado de la dinámica comunitaria, siendo el primero en levantarse y el último en acostarse cuando las responsabilidades del grupo lo requieren. |
| 6 | Mantener relaciones terapéuticas éticas. |
| 7 | Evita establecer contratos, alianzas o vínculos inadecuados con usuarios de grupos inferiores y ejerce su rol con imparcialidad, respeto y sentido de servicio. |
| 8 | Demuestra madurez emocional y estabilidad en el proceso de recuperación. |
| 9 | Maneja adecuadamente los conflictos, regula sus emociones, acepta la retroalimentación y responde con criterio y responsabilidad ante las diferentes situaciones de la comunidad. |
| 10 | Realiza 10 observaciones. |
---

## Fase 3 — Resplandor

Misma estructura: la fase se divide en **líderes** (equivalente a grupos/subfases) y cada uno en **criterios** (subtareas).

### Orden y desbloqueo (regla de progresión)

Los líderes van del **1 al 3** (1 → 2 → 3). Misma regla de aprobación: promedio **> 3**.

| Líder | Se desbloquea cuando… |
|-------|------------------------|
| 1 | Disponible al iniciar la fase |
| 2 | El promedio del Líder 1 es **superior a 3** |
| 3 | Los promedios del Líder 1 y Líder 2 son **superiores a 3** |

### Líder 1

**Propósito / hilo conductor:** comprende que liderar no significa ejercer poder sobre los demás. Aprende a diferenciar entre autoridad y autoritarismo: la verdadera autoridad se gana con el ejemplo, el servicio, la coherencia y el respeto; el autoritarismo se impone mediante el miedo, el control o el abuso de la posición.

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Conocer, comprender y aplicar la capacidad del carácter: Trascendencia. |
| 2 | Demuestra la capacidad de superar límites, afrontar los contratiempos con madurez y perseverar en su proceso de recuperación, convirtiéndose en un ejemplo de resiliencia para los demás. |
| 3 | Coordinar y supervisar el funcionamiento de su grupo. |
| 4 | Garantiza el cumplimiento de las normas, horarios y actividades asignadas. |
| 5 | Resolver conflictos con criterio terapéutico. |
| 6 | Interviene de manera oportuna, justa y respetuosa ante las dificultades de convivencia, siguiendo los lineamientos de la comunidad terapéutica. |
| 7 | Comprende los límites de su rol como líder. |
| 8 | Ejerce su liderazgo desde el ejemplo y el servicio, sin autorizar préstamos, canalizar solicitudes personales o asumir funciones que corresponden al equipo terapéutico o a líderes de mayor jerarquía. |
| 9 | Ser ejemplo permanente de coherencia y disciplina. |
| 10 | Mantiene una conducta estable, responsable y alineada con la filosofía y las normas de la comunidad terapéutica. |

### Líder 2

**Propósito / hilo conductor:** un buen líder también sabe obedecer. Ejerce autoridad con justicia y servicio, reconociendo que hace parte de una estructura de liderazgo donde la honestidad, la gratitud, la humildad y el trabajo en equipo son indispensables. *"Quien no sabe obedecer difícilmente sabrá dirigir".* Su ascenso no depende solo de dirigir bien, sino de mantener la firmeza de su carácter mientras ejerce el liderazgo (diferencia valiosa respecto al Líder 1).

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Consolidar las capacidades del carácter: Identidad y Trascendencia. |
| 2 | Conserva la coherencia entre lo que piensa, dice y hace, aun frente a la presión de otros usuarios; ejerce un liderazgo íntegro, supera los desafíos propios del cargo y no se deja involucrar en manipulaciones, favoritismos o conductas contrarias a la filosofía de la comunidad. |
| 3 | Coordinar el funcionamiento de la comunidad bajo la orientación del Líder 3. |
| 4 | Supervisa el cumplimiento de las normas, organiza las actividades diarias y responde por la adecuada dinámica del grupo. |
| 5 | Ejercer con justicia las funciones propias de su liderazgo. |
| 6 | Canaliza solicitudes, autoriza los asuntos que le corresponden según el reglamento y toma decisiones con imparcialidad, evitando privilegios o favoritismos. |
| 7 | Acompañar y supervisar el desempeño de los Líderes 1 y los Prelíderes. |
| 8 | Orienta, retroalimenta y fortalece el ejercicio del liderazgo, promoviendo el crecimiento de quienes están bajo su responsabilidad. |
| 9 | Demuestra criterio, equilibrio y obediencia a la estructura de liderazgo. |
| 10 | Actúa con madurez en la toma de decisiones, respeta la jerarquía institucional y mantiene una comunicación permanente con el Líder 3 y el equipo terapéutico. |

### Líder 3

**Propósito / hilo conductor:** la autoridad es una responsabilidad y no un privilegio. Su mayor fortaleza no es el poder que ejerce, sino la confianza que inspira, la coherencia con la que vive y el servicio que brinda. Antes de culminar el proceso de reeducación, debe comprender, interiorizar y aplicar la identidad institucional de la Corporación Destellos: **Honestidad · Gratitud · Humildad**.

| # | Subtarea / criterio |
|---|---------------------|
| 1 | Consolida todas las capacidades del carácter. |
| 2 | Evidencia la integración de las ocho capacidades del carácter en su forma de pensar, sentir y actuar, convirtiéndose en un modelo de coherencia, madurez y servicio para toda la comunidad terapéutica. |
| 3 | Liderar integralmente la comunidad terapéutica. |
| 4 | Coordina el trabajo de los Líderes 2, Líderes 1, Prelíderes y demás usuarios, garantizando el cumplimiento de las normas, la organización y el adecuado funcionamiento de la comunidad. |
| 5 | Representa a la comunidad ante el equipo terapéutico. |
| 6 | Canaliza las necesidades, inquietudes y propuestas de los usuarios con objetividad, respeto y responsabilidad, manteniendo una comunicación permanente con el equipo interdisciplinario. |
| 7 | Forma y fortalece el equipo de liderazgo. |
| 8 | Acompaña, supervisa y evalúa el desempeño de los demás líderes, promoviendo su crecimiento y corrigiendo oportunamente las dificultades que se presenten. |
| 9 | Demostrar sabiduría, equilibrio y espíritu de servicio. |
| 10 | Ejerce su autoridad con humildad, toma decisiones justas, evita privilegios y favoritismos, y antepone siempre el bienestar de la comunidad al interés personal. |

---

## Fase 4 — Esplendor

**Estructura distinta:** no hay subfases/grupos con subtareas anidadas. Se califican **directamente** estos criterios; la nota de la fase es el promedio de ellos.

### Criterios (calificación directa)

| # | Criterio |
|---|----------|
| 1 | Logra incorporar las habilidades trabajadas. |
| 2 | Consolida la conciencia de cambio. |
| 3 | Ayuda a través del servicio dentro de la comunidad terapéutica. |
| 4 | Ayuda a usuarios nuevos. |
| 5 | Es considerado confiable. |
| 6 | Tiene autonomía y toma decisiones. |
| 7 | Tiene compromiso con un estilo de vida saludable. |
| 8 | El usuario está preparado para la reintegración. |

- Cada criterio inicia en `0`, escala `0..5` con decimales.
- **Nota de Esplendor** = promedio simple de los 8 criterios.
- No aplica desbloqueo interno (no hay grupos/líderes sucesivos en esta fase).

---

## Alcance de fases

Solo existen **4 fases**:

1. Destellos  
2. Iluminación  
3. Resplandor  
4. Esplendor  

No hay fase 5+.

## Decisiones de comportamiento

- **Historial de calificaciones:** cada cambio de nota de una subtarea se guarda con **fecha y usuario** que lo hizo (auditoría completa, no solo la nota actual).
- **Datos existentes:** las historias clínicas del modelo viejo (fases de Erikson) **se borran**; se arranca de cero con este modelo. El proyecto está en desarrollo, no hay datos que conservar. Ver reset VPS: [`docs/reset-vps-fases-destellos.md`](reset-vps-fases-destellos.md).
- **Quién califica:** **cualquier profesional** puede calificar (no solo el asignado al paciente).

## Pendientes de captura (antes de implementar)

1. ~~Grupo 1 — Prelíder~~ → **resuelto:** Prelíder (Generatividad) con 10 criterios.
2. ~~Destellos desbloqueo interno~~ → **resuelto:** las 7 subfases a la vez.
3. ~~Desbloqueo entre fases~~ → **resuelto:** cadena 1→2→3→4 con promedio `> 3`.
4. **Pesos:** todas las subfases/grupos/líderes pesan igual.
5. ~~Historial, datos viejos y permisos~~ → **resuelto:** ver "Decisiones de comportamiento".
6. ~~Implementación~~ → modelo, API, UI y tema aplicados; reset VPS documentado en [`reset-vps-fases-destellos.md`](reset-vps-fases-destellos.md).
