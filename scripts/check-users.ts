import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const allUsers = await db.query.users.findMany();
  console.log("Users in DB:", allUsers.map(u => ({ id: u.id, username: u.username, name: u.name })));
}

main().catch(console.error);
