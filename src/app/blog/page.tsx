import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Blog from "@/components/sections/Blog";

export default function BlogPage() {
  return (
    <main className="flex-1">
      <Navbar />
      <div className="pt-20">
        <Blog />
      </div>
      <Footer />
    </main>
  );
}
