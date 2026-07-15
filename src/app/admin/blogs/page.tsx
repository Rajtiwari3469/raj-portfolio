"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  published: boolean;
  createdAt: string;
  category: { name: string } | null;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image: "",
    published: false,
    categoryId: "",
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/admin/blogs");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        excerpt: formData.excerpt || null,
        image: formData.image || null,
        categoryId: formData.categoryId || null,
      };

      if (editingBlog) {
        await fetch("/api/admin/blogs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingBlog.id, ...payload }),
        });
      } else {
        await fetch("/api/admin/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      fetchBlogs();
      closeModal();
    } catch (error) {
      console.error("Failed to save blog:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
      fetchBlogs();
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  };

  const togglePublish = async (blog: Blog) => {
    try {
      await fetch("/api/admin/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blog.id, published: !blog.published }),
      });
      fetchBlogs();
    } catch (error) {
      console.error("Failed to toggle publish:", error);
    }
  };

  const openModal = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || "",
        image: blog.image || "",
        published: blog.published,
        categoryId: "",
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        image: "",
        published: false,
        categoryId: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blogs</h1>
          <p className="text-foreground/60 mt-1">Manage your blog posts</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={20} />
          New Blog
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading blogs...</div>
      ) : blogs.length === 0 ? (
        <GlassPanel className="text-center py-12">
          <p className="text-foreground/60">No blogs yet. Write your first blog!</p>
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {blogs.map((blog) => (
              <motion.div
                key={blog.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassPanel hover className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{blog.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        blog.published
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {blog.published ? "Published" : "Draft"}
                      </span>
                      {blog.category && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                          {blog.category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/60 line-clamp-1">
                      {blog.excerpt || blog.content.substring(0, 100)}
                    </p>
                    <p className="text-xs text-foreground/40 mt-1">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublish(blog)}
                      className={`p-2 rounded-lg ${
                        blog.published
                          ? "hover:bg-yellow-500/20 text-yellow-400"
                          : "hover:bg-green-500/20 text-green-400"
                      }`}
                      title={blog.published ? "Unpublish" : "Publish"}
                    >
                      {blog.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => openModal(blog)}
                      className="p-2 rounded-lg hover:bg-primary/20 text-primary"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBlog ? "Edit Blog" : "New Blog"}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            required
          />
          <Textarea
            label="Excerpt (optional)"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            placeholder="Brief summary of the blog post..."
          />
          <Input
            label="Featured Image URL (optional)"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://..."
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="rounded border-glass-border"
            />
            <label htmlFor="published" className="text-sm">Publish immediately</label>
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingBlog ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
