import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Blackgold7", 12);
  await prisma.adminUser.upsert({
    where: { username: "Raj@2005#" },
    update: {},
    create: {
      username: "Raj@2005#",
      password: adminPassword,
    },
  });
  console.log("Admin user created");

  // Create default settings
  const defaultSettings = [
    { key: "primaryColor", value: "#6366f1" },
    { key: "accentColor", value: "#06b6d4" },
    { key: "github", value: "https://github.com/rajtiwari" },
    { key: "linkedin", value: "https://linkedin.com/in/rajtiwari" },
    { key: "instagram", value: "https://instagram.com/rajtiwari" },
    { key: "youtube", value: "https://youtube.com/@rajtiwari" },
    { key: "email", value: "raj@example.com" },
    { key: "phone", value: "+91 XXXXX XXXXX" },
    { key: "location", value: "India" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("Default settings created");

  // Create default skills
  const defaultSkills = [
    { name: "Java", category: "Programming", level: 85, order: 1 },
    { name: "Python", category: "Programming", level: 80, order: 2 },
    { name: "JavaScript", category: "Programming", level: 90, order: 3 },
    { name: "C", category: "Programming", level: 70, order: 4 },
    { name: "C++", category: "Programming", level: 75, order: 5 },
    { name: "HTML", category: "Programming", level: 95, order: 6 },
    { name: "CSS", category: "Programming", level: 90, order: 7 },
    { name: "SQL", category: "Programming", level: 80, order: 8 },
    { name: "React", category: "Framework", level: 88, order: 9 },
    { name: "Next.js", category: "Framework", level: 85, order: 10 },
    { name: "Node.js", category: "Framework", level: 80, order: 11 },
    { name: "TypeScript", category: "Framework", level: 82, order: 12 },
  ];

  for (const skill of defaultSkills) {
    const existing = await prisma.skill.findFirst({
      where: { name: skill.name },
    });
    if (!existing) {
      await prisma.skill.create({ data: skill });
    }
  }
  console.log("Default skills created");

  // Create default social links
  const defaultSocialLinks = [
    { platform: "GitHub", url: "https://github.com/rajtiwari", order: 1 },
    { platform: "LinkedIn", url: "https://linkedin.com/in/rajtiwari", order: 2 },
    { platform: "Instagram", url: "https://instagram.com/rajtiwari", order: 3 },
    { platform: "YouTube", url: "https://youtube.com/@rajtiwari", order: 4 },
    { platform: "LeetCode", url: "https://leetcode.com/rajtiwari", order: 5 },
  ];

  for (const link of defaultSocialLinks) {
    const existing = await prisma.socialLink.findFirst({
      where: { platform: link.platform },
    });
    if (!existing) {
      await prisma.socialLink.create({ data: link });
    }
  }
  console.log("Default social links created");

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
