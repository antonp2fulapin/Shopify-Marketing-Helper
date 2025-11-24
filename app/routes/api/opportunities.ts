import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticatedAdmin } from "@server/shopify.server";
import { getOpportunities, getLastAnalysisTime } from "@modules/storage/models";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticatedAdmin(request);
  const [opportunities, lastAnalysisTime] = await Promise.all([
    getOpportunities(),
    getLastAnalysisTime(),
  ]);
  return json({ opportunities, lastAnalysisTime });
};
