
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

async function fixManagerUser() {
    try {
        const passwordHash = await hash("12345", 10);
        
        // Try to update if exists, otherwise insert
        const existing = await db.select().from(users).where(eq(users.username, "manager")).get();
        
        if (existing) {
            console.log("Updating existing manager user...");
            await db.update(users)
                .set({ 
                    role: "SALES_MANAGER",
                    password: passwordHash,
                    name: "Gerente de Ventas"
                })
                .where(eq(users.username, "manager"));
        } else {
            console.log("Creating new manager user...");
            await db.insert(users).values({
                id: uuidv4(),
                name: "Gerente de Ventas",
                username: "manager",
                password: passwordHash,
                role: "SALES_MANAGER",
                phone: null
            });
        }

        console.log("Manager user fixed successfully!");
    } catch (error) {
        console.error("Error fixing manager user:", error);
    }
}

fixManagerUser();
