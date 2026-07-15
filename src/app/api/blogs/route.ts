import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");
    const slug = searchParams.get("slug");

    // If slug is provided, fetch single blog post
    if (slug) {
      const blog = await prisma.blog.findUnique({
        where: { slug },
        include: { category: true },
      });

      if (!blog) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(blog);
    }

    // Otherwise, fetch multiple blog posts
    const where: Record<string, unknown> = {
      published: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    const blogs = await prisma.blog.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Get blogs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
