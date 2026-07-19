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
    const skills = await prisma.skill.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
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
    const { name, category, level, icon, order } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        level: level || 0,
        icon: icon || null,
        order: order || 0,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
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
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const skill = await prisma.skill.update({
      where: { id },
      data,
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error("Update skill error:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
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
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    await prisma.skill.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Delete skill error:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
