import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Seed projects
  const projects = [
    {
      title: "Nebula Portfolio",
      description: "A stunning 3D space-themed portfolio website built with Next.js, Three.js, and PostgreSQL. Features admin dashboard for content management.",
      technology: ["Next.js", "TypeScript", "Three.js", "Prisma", "PostgreSQL"],
      category: "Full Stack",
      subCategory: "Web App",
      status: "active",
      featured: true,
      order: 1,
    },
    {
      title: "AI Chat Assistant",
      description: "An intelligent chatbot powered by Google Gemini API with context-aware responses and conversation memory.",
      technology: ["React", "Node.js", "Google Gemini API", "WebSocket"],
      category: "AI/ML",
      subCategory: "Chatbot",
      status: "active",
      featured: true,
      order: 2,
    },
    {
      title: "E-Commerce Platform",
      description: "Full-featured e-commerce platform with product management, cart, checkout, and payment integration.",
      technology: ["Next.js", "Stripe", "PostgreSQL", "Tailwind CSS"],
      category: "Full Stack",
      subCategory: "E-commerce",
      status: "completed",
      featured: false,
      order: 3,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.title.toLowerCase().replace(/\s+/g, "-") },
      update: project,
      create: {
        id: project.title.toLowerCase().replace(/\s+/g, "-"),
        ...project,
      },
    });
  }
  console.log("✓ Projects seeded");

  // Seed skills
  const skills = [
    { name: "React", category: "Frontend", level: 90, order: 1 },
    { name: "Next.js", category: "Frontend", level: 85, order: 2 },
    { name: "TypeScript", category: "Frontend", level: 80, order: 3 },
    { name: "Tailwind CSS", category: "Frontend", level: 85, order: 4 },
    { name: "Three.js", category: "Frontend", level: 70, order: 5 },
    { name: "Node.js", category: "Backend", level: 85, order: 6 },
    { name: "Python", category: "Backend", level: 75, order: 7 },
    { name: "Java", category: "Backend", level: 70, order: 8 },
    { name: "PostgreSQL", category: "Database", level: 80, order: 9 },
    { name: "MongoDB", category: "Database", level: 70, order: 10 },
    { name: "Git", category: "Tools", level: 85, order: 11 },
    { name: "Docker", category: "Tools", level: 65, order: 12 },
    { name: "Linux", category: "Tools", level: 75, order: 13 },
  ];

  for (const skill of skills) {
    const id = skill.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    await prisma.skill.upsert({
      where: { id },
      update: skill,
      create: { id, ...skill },
    });
  }
  console.log("✓ Skills seeded");

  // Seed certificates
  const certificates = [
    {
      name: "AWS Cloud Practitioner",
      organization: "Amazon Web Services",
      date: new Date("2024-06-15"),
      description: "Foundational understanding of AWS Cloud services and cloud computing",
    },
    {
      name: "Meta Front-End Developer",
      organization: "Meta (Coursera)",
      date: new Date("2024-03-20"),
      description: "Professional certificate in front-end development with React",
    },
    {
      name: "Google IT Support",
      organization: "Google (Coursera)",
      date: new Date("2023-11-10"),
      description: "Foundational IT support skills including networking, system administration, and security",
    },
  ];

  for (const cert of certificates) {
    const id = cert.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    await prisma.certificate.upsert({
      where: { id },
      update: cert,
      create: { id, ...cert },
    });
  }
  console.log("✓ Certificates seeded");

  // Seed settings (section content)
  const settings = [
    {
      key: "aboutContent",
      value: JSON.stringify({
        bio: [
          "I am Raj Tiwari, a passionate BCA Computer Science & Information Technology student with a deep interest in software development, artificial intelligence, and modern technologies.",
          "I enjoy creating innovative digital solutions, building full-stack applications, and exploring AI-powered technologies. My journey in tech is driven by curiosity and a desire to make a meaningful impact through code.",
        ],
        careerGoals: [
          "Become a proficient Full Stack Developer",
          "Contribute to AI/ML projects",
          "Build scalable and impactful applications",
          "Collaborate with innovative teams",
        ],
      }),
    },
    {
      key: "techStack",
      value: JSON.stringify({
        tags: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "Three.js", "Python", "Java", "Git"],
      }),
    },
    {
      key: "educationContent",
      value: JSON.stringify({
        entries: [
          {
            icon: "GraduationCap",
            title: "Bachelor of Computer Applications (BCA)",
            subtitle: "Computer Science & Information Technology",
            institution: "University Name",
            year: "2022 - 2025",
            description: "Pursuing BCA with specialization in Computer Science and Information Technology. Focusing on software development, data structures, algorithms, and database management.",
            highlights: ["Dean's List", "Programming Club Lead", "Hackathon Winner"],
          },
          {
            icon: "BookOpen",
            title: "Higher Secondary (12th)",
            subtitle: "Science Stream",
            institution: "School Name",
            year: "2020 - 2022",
            description: "Completed higher secondary education with focus on Physics, Chemistry, and Mathematics. Developed strong analytical and problem-solving skills.",
            highlights: ["Science Exhibition", "Math Olympiad"],
          },
        ],
      }),
    },
    {
      key: "experienceContent",
      value: JSON.stringify({
        entries: [
          {
            title: "Full Stack Developer Intern",
            company: "Tech Company",
            period: "2024 - Present",
            description: "Developed and maintained web applications using React, Node.js, and PostgreSQL. Implemented RESTful APIs and integrated third-party services.",
            technologies: ["React", "Node.js", "PostgreSQL", "TypeScript"],
            achievements: [
              "Built scalable REST APIs serving 10K+ requests daily",
              "Implemented real-time features using WebSockets",
              "Reduced load time by 40% through optimization",
            ],
          },
          {
            title: "Web Development Freelancer",
            company: "Self-Employed",
            period: "2023 - 2024",
            description: "Provided web development services to small businesses and startups. Built responsive websites and web applications tailored to client needs.",
            technologies: ["React", "Next.js", "Tailwind CSS", "MongoDB"],
            achievements: [
              "Delivered 10+ successful projects",
              "Maintained 100% client satisfaction rate",
              "Specialized in modern, responsive designs",
            ],
          },
        ],
      }),
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }
  console.log("✓ Settings/Content seeded");

  console.log("\n✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
