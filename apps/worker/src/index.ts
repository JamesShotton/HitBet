import { startPoller } from "./poller.js";

async function main() {
  console.log("[worker] Arb worker starting...");
  await startPoller();
}

main().catch((err) => {
  console.error("[worker] fatal startup error", err);
  process.exit(1);
});