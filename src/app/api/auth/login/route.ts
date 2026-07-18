import { NextRequest, NextResponse } from "next/server";
import { createToken, setAuthCookie } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const DEFAULT_USERNAME = process.env.ADMIN_USERNAME || "admin";
const DEFAULT_PASSWORD_HASH = process.env.ADMIN_PASSWORD
  ? bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12)
  : "";

async function getStoredCredentials() {
  try {
    const prisma = getPrisma();
    const usernameSetting = await prisma.setting.findUnique({ where: { key: "adminUsername" } });
    const passwordSetting = await prisma.setting.findUnique({ where: { key: "adminPasswordHash" } });
    if (usernameSetting?.value && passwordSetting?.value) {
      return { username: usernameSetting.value, passwordHash: passwordSetting.value };
    }
  } catch {
    // DB unavailable, fall through to env defaults
  }
  if (!DEFAULT_PASSWORD_HASH) {
    throw new Error("No admin credentials configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in environment variables.");
  }
  return { username: DEFAULT_USERNAME, passwordHash: DEFAULT_PASSWORD_HASH };
}

async function getEnvCredentials() {
  if (!DEFAULT_PASSWORD_HASH) return null;
  return { username: DEFAULT_USERNAME, passwordHash: DEFAULT_PASSWORD_HASH };
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
    const envCreds = await getEnvCredentials();

    const usernameMatch = username === stored.username || (envCreds && username === envCreds.username);
    if (!usernameMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, stored.passwordHash);
    const isValidEnvPassword = envCreds ? await bcrypt.compare(password, envCreds.passwordHash) : false;
    if (!isValidPassword && !isValidEnvPassword) {
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
