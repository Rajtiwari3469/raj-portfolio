import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Certificates from "@/components/sections/Certificates";
import Education from "@/components/sections/Education";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import ResumeSection from "@/components/sections/Resume";
import ChatWidget from "@/components/ui/ChatWidget";
import { getPrisma } from "@/lib/prisma";

async function getSettings() {
  try {
    const prisma = getPrisma();
    const settings = await prisma.setting.findMany();
    const obj: Record<string, string> = {};
    settings.forEach((s) => { obj[s.key] = s.value; });
    return obj;
  } catch {
    return {};
  }
}

export default async function Home() {
  const settings = await getSettings();

  let profileImage: string | null = null;
  if (settings.profileImage) {
    try { profileImage = JSON.parse(settings.profileImage); } catch { profileImage = settings.profileImage; }
  }

  return (
    <main className="flex-1">
      <Navbar />
      <Hero
        profileImage={profileImage}
        heroTitle={settings.heroTitle || "BCA CS & IT Student"}
        heroSubtitle={settings.heroSubtitle || "Software Development & AI Technology"}
      />
      <About />
      <Projects />
      <Certificates />
      <Education />
      <Skills />
      <Experience />
      <ResumeSection />
      <Contact />
      <Footer />
      <ChatWidget />
    </main>
  );
}
