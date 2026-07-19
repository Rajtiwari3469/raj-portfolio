import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await isAuthenticated();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const resumes = await prisma.resume.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Get resumes error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, content, pdfUrl, candidatePhoto, active } = body;

    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const prisma = getPrisma();
    const resume = await prisma.resume.create({
      data: {
        name,
        content: content || "",
        url: pdfUrl || "",
        pdfUrl: pdfUrl || null,
        candidatePhoto: candidatePhoto || null,
        active: active !== false,
        size: 0,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Create resume error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, name, content, pdfUrl, candidatePhoto, active } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const prisma = getPrisma();
    const resume = await prisma.resume.update({
      where: { id },
      data: {
        name,
        content: content || "",
        url: pdfUrl || "",
        pdfUrl: pdfUrl || null,
        candidatePhoto: candidatePhoto || null,
        active,
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Update resume error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const prisma = getPrisma();
    await prisma.resume.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
