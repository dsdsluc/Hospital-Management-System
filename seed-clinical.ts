import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
} as any);

async function main() {
  console.log("Seeding Prescriptions and TestResults...");

  // 1. Get existing patients and doctors
  const patients = await prisma.patient.findMany({ take: 3 });
  const doctors = await prisma.doctor.findMany({ take: 2 });

  if (patients.length === 0 || doctors.length === 0) {
    console.log("Not enough patients or doctors to seed. Skipping.");
    return;
  }

  const medications = [
    {
      name: "Amoxicillin",
      dosage: "500mg",
      freq: "3x/day",
      duration: "7 days",
    },
    { name: "Lisinopril", dosage: "10mg", freq: "1x/day", duration: "30 days" },
    { name: "Metformin", dosage: "500mg", freq: "2x/day", duration: "90 days" },
    {
      name: "Ibuprofen",
      dosage: "400mg",
      freq: "As needed",
      duration: "5 days",
    },
  ];

  const testTypes = [
    "Complete Blood Count",
    "Lipid Panel",
    "X-Ray Chest",
    "MRI Scan",
  ];

  // 2. Iterate through patients and add records
  for (const patient of patients) {
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];

    // Create a Medical Record first (Parent)
    const record = await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        diagnosis: "Routine Checkup / Seeded Condition",
        vitals: { bp: "120/80", heartRate: 75, temp: 36.6 },
        encounterDate: new Date(),
      },
    });

    console.log(
      `Created MedicalRecord ${record.id} for Patient ${patient.name}`,
    );

    // Create Prescriptions
    await prisma.prescription.create({
      data: {
        medicalRecordId: record.id,
        patientId: patient.id,
        doctorId: doctor.id,
        medications: [
          medications[Math.floor(Math.random() * medications.length)],
          medications[Math.floor(Math.random() * medications.length)],
        ],
        instructions: "Take with food. Do not operate heavy machinery.",
      },
    });
    console.log(`  - Added Prescription`);

    // Create Test Results
    await prisma.testResult.create({
      data: {
        medicalRecordId: record.id,
        patientId: patient.id,
        orderedByDoctorId: doctor.id,
        type: testTypes[Math.floor(Math.random() * testTypes.length)],
        resultSummary: "Values within normal range. No anomalies detected.",
        reportedAt: new Date(),
      },
    });
    console.log(`  - Added TestResult`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
