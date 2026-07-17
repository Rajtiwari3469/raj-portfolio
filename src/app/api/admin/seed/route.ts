import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

const demoProjects = [
  {
    id: "demo-nebula-portfolio",
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
    id: "demo-ai-chat",
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
    id: "demo-ecommerce",
    title: "E-Commerce Platform",
    description: "Full-featured e-commerce platform with product management, cart, checkout, and payment integration.",
    technology: ["Next.js", "Stripe", "PostgreSQL", "Tailwind CSS"],
    category: "Full Stack",
    subCategory: "E-commerce",
    status: "completed",
    featured: false,
    order: 3,
  },
  {
    id: "demo-mobile-fitness",
    title: "FitTrack Mobile App",
    description: "Cross-platform fitness tracking app with workout plans, calorie counting, and progress analytics.",
    technology: ["React Native", "Firebase", "Redux", "Charts.js"],
    category: "Mobile",
    subCategory: "Cross-platform",
    status: "active",
    featured: false,
    order: 4,
  },
  {
    id: "demo-dashboard",
    title: "Analytics Dashboard",
    description: "Real-time analytics dashboard with interactive charts, data filtering, and export capabilities.",
    technology: ["React", "D3.js", "Node.js", "MongoDB"],
    category: "Full Stack",
    subCategory: "Dashboard",
    status: "completed",
    featured: false,
    order: 5,
  },
  {
    id: "demo-rest-api",
    title: "Task Manager API",
    description: "RESTful API for task management with JWT auth, rate limiting, and comprehensive documentation.",
    technology: ["Node.js", "Express", "PostgreSQL", "Swagger"],
    category: "Backend",
    subCategory: "REST API",
    status: "completed",
    featured: false,
    order: 6,
  },
  {
    id: "demo-computer-vision",
    title: "Image Classifier",
    description: "Deep learning model for real-time image classification using convolutional neural networks.",
    technology: ["Python", "TensorFlow", "OpenCV", "FastAPI"],
    category: "AI/ML",
    subCategory: "Computer Vision",
    status: "in-progress",
    featured: false,
    order: 7,
  },
  {
    id: "demo-portfolio-frontend",
    title: "Creative Portfolio",
    description: "Minimalist portfolio website with smooth animations, dark theme, and responsive design.",
    technology: ["HTML", "CSS", "JavaScript", "GSAP"],
    category: "Frontend",
    subCategory: "SPA",
    status: "completed",
    featured: false,
    order: 8,
  },
  {
    id: "demo-electron-app",
    title: "Note taking Desktop App",
    description: "Cross-platform desktop note-taking app with markdown support, tags, and local storage.",
    technology: ["Electron", "React", "TypeScript", "SQLite"],
    category: "Desktop",
    subCategory: "Electron",
    status: "active",
    featured: false,
    order: 9,
  },
  {
    id: "demo-landing-page",
    title: "SaaS Landing Page",
    description: "High-converting SaaS landing page with hero section, features, pricing, and testimonials.",
    technology: ["Next.js", "Tailwind CSS", "Framer Motion"],
    category: "Frontend",
    subCategory: "Landing Page",
    status: "completed",
    featured: false,
    order: 10,
  },
];

export async function POST() {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const created = await prisma.project.createMany({
      data: demoProjects,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `${created.count} demo projects created`,
      projects: demoProjects.map((p) => p.id),
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed demo data" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ids = demoProjects.map((p) => p.id);

    const deleted = await prisma.project.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ message: `${deleted.count} demo projects deleted` });
  } catch (error) {
    console.error("Delete demo error:", error);
    return NextResponse.json({ error: "Failed to delete demo data" }, { status: 500 });
  }
}
