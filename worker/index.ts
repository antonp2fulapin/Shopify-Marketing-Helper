import cron from "node-cron";
import { shopify } from "@server/shopify.server";
import { scanShop } from "@modules/analysis/patterns";

async function runFullScan() {
  const sessions = await shopify.sessionStorage.findSessionsByShop("*").catch(() => []);
  if (!sessions || sessions.length === 0) {
    console.info("No shops installed yet - skipping scan");
    return;
  }

  for (const session of sessions) {
    try {
      console.info(`Running scheduled scan for ${session.shop}`);
      await scanShop(session);
    } catch (error) {
      console.error(`Failed scheduled scan for ${session.shop}`, error);
    }
  }
}

cron.schedule("0 * * * *", runFullScan); // hourly

runFullScan().catch((err) => console.error(err));
