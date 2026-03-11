import "dotenv/config";
import { startPoller } from "./poller.js";

async function main() {
  console.log("Arb worker starting...");
  await startPoller();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});