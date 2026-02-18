import "dotenv/config";
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function main() {
  const username = "fortex";
  const password = "12345";
  
  const existing = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  const hashedPassword = await hash(password, 10);

  if (!existing) {
    console.log(`Creating user ${username}...`);
    await db.insert(users).values({
      id: uuidv4(),
      name: "Super Admin",
      username: username,
      password: hashedPassword,
      role: "ADMIN",
    });
    console.log("User created successfully.");
  } else {
    console.log(`User ${username} already exists. Updating password...`);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.username, username));
    console.log("Password updated successfully.");
  }
}

main().catch(console.error);
