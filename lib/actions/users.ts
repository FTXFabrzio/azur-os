"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { getSession } from "./auth";

export async function getUsers() {
  try {
    const session = await getSession();
    // Only 'fortex' can manage users/view full list for admin purposes
    if (!session || session.username !== 'fortex') {
      return [];
    }

    return await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Returns a list of users available to be invited to meetings.
 * Accessible by any authenticated user, but stripped of sensitive data.
 */
export async function getAvailableParticipants() {
  try {
    const session = await getSession();
    if (!session) return [];

    return await db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        role: true,
        username: true,
      },
      orderBy: (users, { asc }) => [asc(users.name)],
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return [];
  }
}

export async function getUserById(id: string) {
  try {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function createUser(data: typeof users.$inferInsert) {
  try {
    const hashedPassword = await hash(data.password, 10);
    await db.insert(users).values({ ...data, password: hashedPassword });
    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function updateUser(id: string, data: Partial<typeof users.$inferInsert>) {
  try {
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = await hash(updateData.password, 10);
    }
    await db.update(users).set(updateData).where(eq(users.id, id));
    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

export async function deleteUser(id: string) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
