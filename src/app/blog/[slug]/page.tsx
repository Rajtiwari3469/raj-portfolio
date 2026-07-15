"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  createdAt: string;
  category: { name: string } | null;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
    });
  }, [params]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs?slug=${slug}`);
      const data = await response.json();
      if (data && !data.error) {
        setBlog(data);
      }
    } catch (error) {
      console.error("Failed to fetch blog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchBlog();
    }
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Blog
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-12 text-foreground/60">Loading blog post...</div>
          ) : !blog ? (
            <GlassPanel className="text-center py-12">
              <p className="text-foreground/60">Blog post not found.</p>
            </GlassPanel>
          ) : (
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {blog.image && (
                <div className="h-64 md:h-96 rounded-2xl overflow-hidden mb-8 bg-glass-bg">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <GlassPanel className="mb-8">
                <div className="flex items-center gap-4 text-sm text-foreground/60 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {blog.category && (
                    <div className="flex items-center gap-2">
                      <Tag size={14} />
                      <span>{blog.category.name}</span>
                    </div>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {blog.title}
                </h1>

                {blog.excerpt && (
                  <p className="text-lg text-foreground/70 mb-6">
                    {blog.excerpt}
                  </p>
                )}
              </GlassPanel>

              <GlassPanel>
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                    {blog.content}
                  </div>
                </div>
              </GlassPanel>
            </motion.article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
