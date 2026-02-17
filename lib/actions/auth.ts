"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";

export async function authenticate(username: string, password: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return { success: false, error: "Credenciales incorrectas" };
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "Credenciales incorrectas" };
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_session", JSON.stringify({
      id: user.id,
      name: user.name,
      role: user.role,
      username: user.username
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return { 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: "Error en el servidor" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
}
