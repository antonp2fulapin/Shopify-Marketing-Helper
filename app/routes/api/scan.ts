import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticatedAdmin } from "@server/shopify.server";
import { scanShop } from "@modules/analysis/patterns";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticatedAdmin(request);
  const result = await scanShop(session);
  return json({ ok: true, ...result });
};
