import { NextRequest, NextResponse } from "next/server";
import { createToken, setAuthCookie } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const DEFAULT_USERNAME = "Raj@2005#";
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("Blackgold7", 12);

async function getStoredCredentials() {
  try {
    const prisma = getPrisma();
    const usernameSetting = await prisma.setting.findUnique({ where: { key: "adminUsername" } });
    const passwordSetting = await prisma.setting.findUnique({ where: { key: "adminPasswordHash" } });
    return {
      username: usernameSetting?.value || DEFAULT_USERNAME,
      passwordHash: passwordSetting?.value || DEFAULT_PASSWORD_HASH,
    };
  } catch {
    return {
      username: DEFAULT_USERNAME,
      passwordHash: DEFAULT_PASSWORD_HASH,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const stored = await getStoredCredentials();

    if (username !== stored.username) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, stored.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await createToken({
      sub: "admin",
      role: "ADMIN",
    });

    await setAuthCookie(token);

    return NextResponse.json(
      { message: "Login successful", token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
