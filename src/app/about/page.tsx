import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import About from "@/components/sections/About";
import Education from "@/components/sections/Education";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import ChatWidget from "@/components/ui/ChatWidget";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <About />
        <div className="section-divider mx-auto max-w-4xl" />
        <Skills />
        <div className="section-divider mx-auto max-w-4xl" />
        <Education />
        <div className="section-divider mx-auto max-w-4xl" />
        <Experience />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
