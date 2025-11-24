import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticatedAdmin } from "@server/shopify.server";
import { getPatterns, getLastAnalysisTime } from "@modules/storage/models";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticatedAdmin(request);
  const [patterns, lastAnalysisTime] = await Promise.all([
    getPatterns(),
    getLastAnalysisTime(),
  ]);
  return json({ patterns, lastAnalysisTime });
};
