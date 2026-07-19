import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Get admin projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, image, images, githubUrl, liveUrl, technology, category, subCategory, status, featured, order } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const project = await prisma.project.create({
      data: {
        title,
        description,
        image: image || null,
        images: images || [],
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
        technology: technology || [],
        category: category || "Other",
        subCategory: subCategory || null,
        status: status || "active",
        featured: featured || false,
        order: order || 0,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const project = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
