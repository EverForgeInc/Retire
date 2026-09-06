import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { readFileSync } from "fs";
import path from "path";
import { generateMemberTasks } from "../src/lib/tasks";
import { parseDateOnly } from "../src/lib/rules/date-engine";

const prisma = new PrismaClient();

type ChecklistTask = {
  id: string;
  section_id: string;
  task: string;
  owner: string;
  evidence: string;
  required_level?: string;
  due_date_rule?: unknown;
  dependencies?: unknown;
  official_source_url?: string | null;
  source_last_verified?: string | null;
  local_override_allowed?: boolean;
};

type ChecklistSection = {
  id: string;
  section: string;
  tasks: ChecklistTask[];
};

type ChecklistData = {
  schema_version: string;
  sections: ChecklistSection[];
};

async function main() {
  const checklistPath = path.join(process.cwd(), "milretire_handoff", "checklist_data.json");
  const checklist = JSON.parse(readFileSync(checklistPath, "utf8")) as ChecklistData;

  const seen = new Set<string>();
  let sortOrder = 0;
  let duplicates = 0;

  await prisma.memberTask.deleteMany();
  await prisma.taskTemplate.deleteMany();
  await prisma.checklistTemplate.deleteMany();

  const template = await prisma.checklistTemplate.create({
    data: {
      name: "USAF Active Duty Retirement Checklist",
      branch: "USAF",
      component: "Active Duty",
      version: checklist.schema_version || "1.0.0",
      active: true,
    },
  });

  for (const section of checklist.sections) {
    for (const task of section.tasks) {
      if (seen.has(task.id)) {
        duplicates += 1;
        console.warn(`Duplicate task key skipped: ${task.id}`);
        continue;
      }
      seen.add(task.id);
      sortOrder += 1;
      await prisma.taskTemplate.create({
        data: {
          checklistTemplateId: template.id,
          externalKey: task.id,
          sectionId: section.id,
          sectionName: section.section,
          title: task.task,
          description: task.task,
          category: task.owner,
          ownerLabel: task.owner,
          evidenceLabel: task.evidence,
          requiredLevel: task.required_level ?? "verify_locally",
          dateRule: JSON.stringify(task.due_date_rule ?? { type: "section_window" }),
          dependencies: JSON.stringify(task.dependencies ?? []),
          officialSource: JSON.stringify({
            url: task.official_source_url ?? null,
            lastVerified: task.source_last_verified ?? null,
          }),
          localOverrideAllowed: task.local_override_allowed ?? true,
          sortOrder,
          active: true,
        },
      });
    }
  }

  console.log(
    `Seeded checklist template ${template.version}: ${seen.size} tasks from source version ${checklist.schema_version} (duplicates skipped: ${duplicates})`,
  );

  if (seen.size !== 93) {
    throw new Error(`Expected 93 tasks, seeded ${seen.size}`);
  }

  const email = (process.env.DEMO_USER_EMAIL || "david@example.com").toLowerCase();
  const password = process.env.DEMO_USER_PASSWORD || "changeme123";
  const passwordHash = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      displayName: "David Najera",
      role: "member",
    },
    create: {
      email,
      passwordHash,
      displayName: "David Najera",
      role: "member",
    },
  });

  const retirementDate = parseDateOnly("2027-06-01");
  const profile = await prisma.memberProfile.upsert({
    where: { userId: user.id },
    update: {
      fullName: "David Najera",
      rank: "CMSgt",
      branch: "USAF",
      component: "Active Duty",
      installation: "Misawa AB",
      timezone: "Asia/Tokyo",
      projectedRetirementDate: retirementDate,
      skillbridgeStart: parseDateOnly("2027-04-01"),
      skillbridgeEnd: parseDateOnly("2027-05-15"),
      terminalLeaveStart: parseDateOnly("2027-05-22"),
      finalDutyDay: parseDateOnly("2027-05-31"),
      retirementLocation: "Misawa, Japan",
      overseasStatus: true,
      officialSeparationDate: retirementDate,
      transitionType: "standard_retirement",
      desIdesStatus: "not_applicable",
    },
    create: {
      userId: user.id,
      fullName: "David Najera",
      rank: "CMSgt",
      branch: "USAF",
      component: "Active Duty",
      installation: "Misawa AB",
      timezone: "Asia/Tokyo",
      projectedRetirementDate: retirementDate,
      skillbridgeStart: parseDateOnly("2027-04-01"),
      skillbridgeEnd: parseDateOnly("2027-05-15"),
      terminalLeaveStart: parseDateOnly("2027-05-22"),
      finalDutyDay: parseDateOnly("2027-05-31"),
      retirementLocation: "Misawa, Japan",
      overseasStatus: true,
      officialSeparationDate: retirementDate,
      transitionType: "standard_retirement",
      desIdesStatus: "not_applicable",
    },
  });

  await prisma.digestPreference.upsert({
    where: { userId: user.id },
    update: {
      cadence: "weekly",
      deliveryLocalTime: "08:00",
      weeklyDay: 1,
      timezone: "Asia/Tokyo",
    },
    create: {
      userId: user.id,
      cadence: "weekly",
      deliveryLocalTime: "08:00",
      weeklyDay: 1,
      timezone: "Asia/Tokyo",
    },
  });

  // Sample locations for comparison module
  const locations = [
    { city: "Misawa", region: "Aomori", country: "Japan", currency: "JPY" },
    { city: "San Antonio", region: "TX", country: "USA", currency: "USD" },
    { city: "Colorado Springs", region: "CO", country: "USA", currency: "USD" },
    { city: "Tampa", region: "FL", country: "USA", currency: "USD" },
    { city: "Honolulu", region: "HI", country: "USA", currency: "USD" },
    { city: "Norfolk", region: "VA", country: "USA", currency: "USD" },
    { city: "Phoenix", region: "AZ", country: "USA", currency: "USD" },
    { city: "Boise", region: "ID", country: "USA", currency: "USD" },
    { city: "Huntsville", region: "AL", country: "USA", currency: "USD" },
    { city: "Spokane", region: "WA", country: "USA", currency: "USD" },
  ];

  await prisma.scenarioLocationSelection.deleteMany();
  await prisma.locationCostVersion.deleteMany();
  await prisma.location.deleteMany();

  const createdLocations = [];
  for (const loc of locations) {
    createdLocations.push(await prisma.location.create({ data: loc }));
  }

  const misawa = createdLocations[0];
  const expenseCats: Record<string, number> = {
    rent: 1800,
    water: 40,
    electricity: 180,
    internet: 70,
    food: 900,
    transportation: 250,
    medical: 100,
    education_or_homeschool: 200,
    miscellaneous: 300,
  };
  for (const [category, amountUsd] of Object.entries(expenseCats)) {
    await prisma.locationCostVersion.create({
      data: {
        locationId: misawa.id,
        effectiveDate: parseDateOnly("2026-08-01"),
        category,
        amountUsd,
        sourceType: "user_workbook",
        sourceUrl: "milretire_handoff/income_location_module.json",
        confidence: "medium",
        approved: true,
      },
    });
  }

  await prisma.incomeScenario.deleteMany({ where: { memberProfileId: profile.id } });
  const income = await prisma.incomeScenario.create({
    data: {
      memberProfileId: profile.id,
      name: "100% VA Scenario",
      retirementSystem: "High-3",
      high3Monthly: 8200,
      yearsService: 24,
      multiplier: 0.025,
      estimatedRetiredPay: 4920,
      memberVaRating: 100,
      memberVaPay: 3832,
      spouseVaPay: 0,
      civilianIncome: 0,
      otherIncome: 0,
      dependentConfiguration: JSON.stringify({ spouse: true, children_under_18: 2 }),
    },
  });

  for (const loc of createdLocations) {
    await prisma.scenarioLocationSelection.create({
      data: {
        incomeScenarioId: income.id,
        locationId: loc.id,
        customExpenses: JSON.stringify(loc.id === misawa.id ? expenseCats : { rent: 1600, food: 800, miscellaneous: 400 }),
        weights: JSON.stringify({ affordability: 1, va_access: 1, quality_of_life: 1 }),
      },
    });
  }

  // Sample approved VA rates (illustrative, not official)
  await prisma.vaCompensationRate.deleteMany();
  await prisma.militaryPayTable.deleteMany();
  await prisma.benefitRateVersion.deleteMany();
  const vaVersion = await prisma.benefitRateVersion.create({
    data: {
      benefitType: "va_compensation",
      effectiveDate: parseDateOnly("2025-12-01"),
      sourceUrl: "https://www.va.gov/disability/compensation-rates/",
      status: "approved",
      approvedAt: new Date(),
      approvedById: user.id,
      sourceHash: "seed-demo-va-2025",
    },
  });
  for (const rating of [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
    await prisma.vaCompensationRate.create({
      data: {
        versionId: vaVersion.id,
        rating,
        dependentKey: "veteran_spouse_two_children",
        monthlyAmount: rating === 0 ? 0 : 150 + rating * 36.8,
      },
    });
  }

  await prisma.vaCondition.deleteMany({ where: { memberProfileId: profile.id } });
  await prisma.vaCondition.create({
    data: {
      memberProfileId: profile.id,
      conditionName: "Bilateral knee arthritis",
      bodySystem: "Musculoskeletal",
      diagnosisStatus: "diagnosed",
      functionalImpactNarrative:
        "Knee arthritis limits walking to approximately 0.5 miles before rest is required.",
      claimStatus: "evidence",
      examStatus: "pending",
      limitations: {
        create: [
          {
            activity: "walking",
            limitationDescription: "Limited to about 0.5 miles before pain requires rest",
            thresholdValue: 0.5,
            thresholdUnit: "miles",
            frequency: "daily",
            severity: "moderate",
          },
        ],
      },
    },
  });

  await prisma.transitionScenario.deleteMany({ where: { memberProfileId: profile.id } });
  const scenario = await prisma.transitionScenario.create({
    data: {
      memberProfileId: profile.id,
      name: "Primary transition plan",
      projectedRetirementDate: retirementDate,
      currentLeaveBalance: 45,
      leaveAccrualPerMonth: 2.5,
      maximumSkillbridgeDays: 180,
      policyCombinationLimitDays: 20,
      active: true,
    },
  });
  await prisma.timelineEvent.createMany({
    data: [
      {
        scenarioId: scenario.id,
        eventType: "skillbridge",
        title: "SkillBridge",
        startDate: parseDateOnly("2027-04-01"),
        endDate: parseDateOnly("2027-05-15"),
        chargeableLeave: false,
      },
      {
        scenarioId: scenario.id,
        eventType: "ptdy",
        title: "PTDY",
        startDate: parseDateOnly("2027-05-18"),
        endDate: parseDateOnly("2027-05-21"),
        chargeableLeave: false,
      },
      {
        scenarioId: scenario.id,
        eventType: "terminal_leave",
        title: "Terminal Leave",
        startDate: parseDateOnly("2027-05-22"),
        endDate: parseDateOnly("2027-05-31"),
        chargeableLeave: true,
      },
      {
        scenarioId: scenario.id,
        eventType: "retirement_ceremony",
        title: "Retirement Ceremony",
        startDate: parseDateOnly("2027-05-29"),
        endDate: parseDateOnly("2027-05-29"),
        chargeableLeave: false,
      },
      {
        scenarioId: scenario.id,
        eventType: "retirement",
        title: "Retirement Date",
        startDate: retirementDate,
        endDate: retirementDate,
        chargeableLeave: false,
      },
    ],
  });

  const taskCount = await generateMemberTasks({
    memberProfileId: profile.id,
    retirementDate,
    userId: user.id,
    transitionType: profile.transitionType,
    desIdesStatus: profile.desIdesStatus,
    officialSeparationDate: profile.officialSeparationDate ?? retirementDate,
  });

  // Mark a realistic subset complete for dashboard demo
  const toComplete = await prisma.memberTask.findMany({
    where: { memberProfileId: profile.id },
    orderBy: { sortOrder: "asc" },
    take: 43,
  });
  for (const task of toComplete) {
    await prisma.memberTask.update({
      where: { id: task.id },
      data: {
        status: "complete",
        completedAt: new Date(),
        completedByUserId: user.id,
        dateCompleted: parseDateOnly("2026-07-01"),
      },
    });
  }

  console.log(`Demo user: ${email}`);
  console.log(`Member tasks generated: ${taskCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
