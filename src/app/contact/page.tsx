import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Contact from "@/components/sections/Contact";
import ChatWidget from "@/components/ui/ChatWidget";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
