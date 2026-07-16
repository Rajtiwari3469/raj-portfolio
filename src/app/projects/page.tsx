import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Projects from "@/components/sections/Projects";
import ChatWidget from "@/components/ui/ChatWidget";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <Projects />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
