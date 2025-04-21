'use server'

import { db } from "@/lib/db/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function updateUserRole(email: string, role: string) {
  try {
    // Find the user by email and update their role
    await db.update(user)
      .set({ role: role as "admin" | "practitioner" | "client" })
      .where(eq(user.email, email));

    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: String(error) };
  }
}
