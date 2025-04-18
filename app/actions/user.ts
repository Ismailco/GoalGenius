'use server'

import { db } from "@/app/server/db";
import { user } from "@/app/server/schema";
import { eq } from "drizzle-orm";

export async function updateUserRole(email: string, role: string) {
  try {
    // Find the user by email and update their role
    await db.update(user)
      .set({ role })
      .where(eq(user.email, email));

    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: String(error) };
  }
}
