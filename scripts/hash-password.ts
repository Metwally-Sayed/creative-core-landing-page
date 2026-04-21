import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main() {
  const rl = createInterface({ input, output, terminal: true });
  const password = await rl.question("Password to hash: ");
  rl.close();

  if (!password || password.length < 8) {
    console.error("Error: password must be at least 8 characters.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  console.log("\nCopy the hash below into .env.local as ADMIN_PASSWORD_HASH:\n");
  console.log(hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
