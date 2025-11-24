import cron from "node-cron";
import { shopify } from "@server/shopify.server";
import { scanShop } from "@modules/analysis/patterns";

const shopList = process.env.SCAN_SHOPS?.split(",").map((shop) => shop.trim()).filter(Boolean) ?? [];

async function runFullScan() {
  if (shopList.length === 0) {
    console.info("No shops configured in SCAN_SHOPS - skipping scheduled scan");
    return;
  }

  for (const shop of shopList) {
    try {
      const sessions = await shopify.sessionStorage.findSessionsByShop(shop);
      if (!sessions || sessions.length === 0) {
        console.info(`No sessions found for ${shop}`);
        continue;
      }

      for (const session of sessions) {
        console.info(`Running scheduled scan for ${session.shop}`);
        await scanShop(session);
      }
    } catch (error) {
      console.error(`Failed scheduled scan for ${shop}`, error);
    }
  }
}

cron.schedule("0 * * * *", runFullScan); // hourly

runFullScan().catch((err) => console.error(err));
