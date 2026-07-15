import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import About from "@/components/sections/About";
import Education from "@/components/sections/Education";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";

export default function AboutPage() {
  return (
    <main className="flex-1">
      <Navbar />
      <div className="pt-20">
        <About />
        <Skills />
        <Education />
        <Experience />
      </div>
      <Footer />
    </main>
  );
}
