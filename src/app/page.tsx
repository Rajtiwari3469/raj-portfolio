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
import ChatWidget from "@/components/ui/ChatWidget";

export default function Home() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Certificates />
      <Education />
      <Skills />
      <Experience />
      <Contact />
      <Footer />
      <ChatWidget />
    </main>
  );
}
