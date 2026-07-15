"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  createdAt: string;
  category: { name: string } | null;
}

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs?limit=6");
      const data = await response.json();
      if (Array.isArray(data)) {
        setBlogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBlogs();
  }, []);

  return (
    <section id="blog" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Thoughts, tutorials, and insights on technology
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 text-foreground/60">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <GlassPanel className="text-center py-12">
            <p className="text-foreground/60">No blog posts yet. Write your first blog from the admin dashboard!</p>
          </GlassPanel>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/blog/${blog.slug}`}>
                  <GlassPanel hover glow="primary" className="h-full flex flex-col cursor-pointer">
                    {blog.image && (
                      <div className="h-48 rounded-xl overflow-hidden mb-4 bg-glass-bg">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 text-sm text-foreground/60">
                        <Calendar size={14} />
                        <span>
                          {new Date(blog.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        {blog.category && (
                          <>
                            <span>•</span>
                            <Tag size={14} />
                            <span>{blog.category.name}</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {blog.title}
                      </h3>

                      <p className="text-foreground/60 text-sm line-clamp-3">
                        {blog.excerpt || "Read more to discover insights and tutorials..."}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-glass-border">
                      <span className="flex items-center gap-1 text-primary text-sm font-medium">
                        Read More <ArrowRight size={14} />
                      </span>
                    </div>
                  </GlassPanel>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {blogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              View All Posts <ArrowRight size={18} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
