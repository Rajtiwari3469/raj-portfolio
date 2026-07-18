import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

async function ensurePricingTable(prisma: ReturnType<typeof getPrisma>) {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Pricing" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectName" TEXT NOT NULL,
      "totalPrice" INTEGER NOT NULL,
      "advancePrice" INTEGER NOT NULL,
      "description" TEXT,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    );
  `);
}

export async function GET() {
  try {
    const prisma = getPrisma();
    const pricing = await prisma.pricing.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(pricing);
  } catch (error) {
    console.error("Get pricing error:", error);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { projectName, totalPrice, advancePrice, description } = body;

    if (!projectName || !totalPrice || !advancePrice) {
      return NextResponse.json({ error: "projectName, totalPrice, and advancePrice are required" }, { status: 400 });
    }

    if (advancePrice > totalPrice) {
      return NextResponse.json({ error: "Advance price cannot exceed total price" }, { status: 400 });
    }

    const prisma = getPrisma();
    await ensurePricingTable(prisma);

    const maxOrder = await prisma.pricing.findMany({ select: { order: true }, orderBy: { order: "desc" }, take: 1 });
    const nextOrder = maxOrder.length > 0 ? maxOrder[0].order + 1 : 0;

    const pricing = await prisma.pricing.create({
      data: {
        projectName,
        totalPrice,
        advancePrice,
        description: description || null,
        order: nextOrder,
      },
    });

    return NextResponse.json(pricing, { status: 201 });
  } catch (error) {
    console.error("Create pricing error:", error);
    return NextResponse.json({ error: "Failed to create pricing" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, projectName, totalPrice, advancePrice, description, active, order } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const prisma = getPrisma();
    const pricing = await prisma.pricing.update({
      where: { id },
      data: {
        ...(projectName !== undefined && { projectName }),
        ...(totalPrice !== undefined && { totalPrice }),
        ...(advancePrice !== undefined && { advancePrice }),
        ...(description !== undefined && { description }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error("Update pricing error:", error);
    return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const prisma = getPrisma();
    await prisma.pricing.delete({ where: { id } });

    return NextResponse.json({ message: "Pricing deleted" });
  } catch (error) {
    console.error("Delete pricing error:", error);
    return NextResponse.json({ error: "Failed to delete pricing" }, { status: 500 });
  }
}
