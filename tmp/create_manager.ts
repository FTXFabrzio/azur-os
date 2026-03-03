
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function createManagerUser() {
    try {
        const passwordHash = await hash("12345", 10);
        
        await db.insert(users).values({
            id: uuidv4(),
            name: "Gerente de Ventas",
            username: "manager",
            password: passwordHash,
            role: "SALES_MANAGER",
            phone: null
        });

        console.log("Manager user created successfully!");
    } catch (error) {
        console.error("Error creating manager user:", error);
    }
}

createManagerUser();
