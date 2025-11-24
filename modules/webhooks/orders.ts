import type { Request, Response } from "express";
import { scanShop } from "@modules/analysis/patterns";
import { shopify } from "@server/shopify.server";

export async function handleOrderWebhook(req: Request, res: Response) {
  try {
    const shop = req.headers["x-shopify-shop-domain"] as string;
    const session = await shopify.sessionStorage.findSessionsByShop(shop).then((sessions) => sessions?.[0]);
    if (session) {
      await scanShop(session);
    }
    res.status(200).send("ok");
  } catch (error) {
    console.error("Failed to process order webhook", error);
    res.status(500).send("error");
  }
}
