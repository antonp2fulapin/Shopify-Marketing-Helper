import express from "express";
import { createRequestHandler } from "@remix-run/express";
import path from "path";
import { fileURLToPath } from "url";
import { shopify } from "./shopify.server";
import { handleOrderWebhook } from "@modules/webhooks/orders";
import { handleCustomerWebhook } from "@modules/webhooks/customers";
import type { ServerBuild } from "@remix-run/node";

const BUILD_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "../build/index.js");
const build = (process.env.NODE_ENV === "production"
  ? await import(BUILD_PATH)
  : await import("../build/index.js").catch(() => undefined)) as unknown as ServerBuild | undefined;

const app = express();
app.use(express.json());

app.use("/webhooks", shopify.processWebhooks({
  webhookHandlers: {
    "ORDERS_CREATE": { deliveryMethod: "http", callbackUrl: "/webhooks/orders/create" },
    "CUSTOMERS_CREATE": { deliveryMethod: "http", callbackUrl: "/webhooks/customers/create" },
  },
}));

app.post("/webhooks/orders/create", handleOrderWebhook);
app.post("/webhooks/customers/create", handleCustomerWebhook);

app.use(shopify.cspHeaders());
app.use(shopify.auth({ path: "/auth" }));
app.use(shopify.authCallback({ path: "/auth/callback" }));
app.use(shopify.ensureInstalledOnShop());

app.use(express.static("public"));

app.all("*", createRequestHandler({
  build: build as ServerBuild,
  mode: process.env.NODE_ENV,
}));

const port = parseInt(process.env.PORT || "3000", 10);
app.listen(port, () => {
  console.log(`Shopify app running on port ${port}`);
});
