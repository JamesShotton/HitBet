import { startPoller } from "./poller.js";

process.on("uncaughtException", (err) => {
  console.error("[worker] uncaughtException — restarting in 10s:", err);
  setTimeout(() => process.exit(1), 10_000);
});

process.on("unhandledRejection", (reason) => {
  console.error("[worker] unhandledRejection:", reason);
});

async function main() {
  console.log("[worker] Arb worker starting...");
  await startPoller();
}

main().catch((err) => {
  console.error("[worker] fatal startup error", err);
  process.exit(1);
});
