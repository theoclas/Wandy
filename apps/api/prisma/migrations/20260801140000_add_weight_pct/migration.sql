-- AlterTable
ALTER TABLE "PhaseTemplate" ADD COLUMN "weightPct" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "SubgroupTemplate" ADD COLUMN "weightPct" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "CriterionTemplate" ADD COLUMN "weightPct" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Backfill equal weights for phases (active)
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "sortOrder") AS rn,
    COUNT(*) OVER () AS n
  FROM "PhaseTemplate"
  WHERE active = true
)
UPDATE "PhaseTemplate" p
SET "weightPct" = CASE
  WHEN r.n = 0 THEN 0
  WHEN r.rn = r.n THEN ROUND((100 - ROUND((100.0 / r.n)::numeric, 2) * (r.n - 1))::numeric, 2)::double precision
  ELSE ROUND((100.0 / r.n)::numeric, 2)::double precision
END
FROM ranked r
WHERE p.id = r.id;

-- Backfill equal weights for subgroups within each phase
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "phaseTemplateId" ORDER BY "sortOrder") AS rn,
    COUNT(*) OVER (PARTITION BY "phaseTemplateId") AS n
  FROM "SubgroupTemplate"
  WHERE active = true
)
UPDATE "SubgroupTemplate" s
SET "weightPct" = CASE
  WHEN r.n = 0 THEN 0
  WHEN r.rn = r.n THEN ROUND((100 - ROUND((100.0 / r.n)::numeric, 2) * (r.n - 1))::numeric, 2)::double precision
  ELSE ROUND((100.0 / r.n)::numeric, 2)::double precision
END
FROM ranked r
WHERE s.id = r.id;

-- Backfill equal weights for criteria within each subgroup
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "subgroupTemplateId" ORDER BY "sortOrder") AS rn,
    COUNT(*) OVER (PARTITION BY "subgroupTemplateId") AS n
  FROM "CriterionTemplate"
  WHERE active = true
)
UPDATE "CriterionTemplate" c
SET "weightPct" = CASE
  WHEN r.n = 0 THEN 0
  WHEN r.rn = r.n THEN ROUND((100 - ROUND((100.0 / r.n)::numeric, 2) * (r.n - 1))::numeric, 2)::double precision
  ELSE ROUND((100.0 / r.n)::numeric, 2)::double precision
END
FROM ranked r
WHERE c.id = r.id;
