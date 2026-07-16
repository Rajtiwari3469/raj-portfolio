import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import bcrypt from "bcryptjs";

const DEFAULT_USERNAME = "Raj@2005#";
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("Blackgold7", 12);

async function getStoredCredentials() {
  const prisma = getPrisma();
  const usernameSetting = await prisma.setting.findUnique({ where: { key: "adminUsername" } });
  const passwordSetting = await prisma.setting.findUnique({ where: { key: "adminPasswordHash" } });
  return {
    username: usernameSetting?.value || DEFAULT_USERNAME,
    passwordHash: passwordSetting?.value || DEFAULT_PASSWORD_HASH,
  };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { oldUsername, oldPassword, newUsername, newPassword } = body;

    if (!oldUsername || !oldPassword) {
      return NextResponse.json({ error: "Old username and password are required" }, { status: 400 });
    }

    if (!newUsername && !newPassword) {
      return NextResponse.json({ error: "At least one new credential (username or password) is required" }, { status: 400 });
    }

    const stored = await getStoredCredentials();

    if (oldUsername !== stored.username) {
      return NextResponse.json({ error: "Old username is incorrect" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(oldPassword, stored.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Old password is incorrect" }, { status: 401 });
    }

    const prisma = getPrisma();

    if (newUsername) {
      await prisma.setting.upsert({
        where: { key: "adminUsername" },
        update: { value: newUsername },
        create: { key: "adminUsername", value: newUsername },
      });
    }

    if (newPassword) {
      const newHash = await bcrypt.hash(newPassword, 12);
      await prisma.setting.upsert({
        where: { key: "adminPasswordHash" },
        update: { value: newHash },
        create: { key: "adminPasswordHash", value: newHash },
      });
    }

    return NextResponse.json({ message: "Credentials updated successfully" });
  } catch (error) {
    console.error("Change credentials error:", error);
    return NextResponse.json({ error: "Failed to change credentials" }, { status: 500 });
  }
}
