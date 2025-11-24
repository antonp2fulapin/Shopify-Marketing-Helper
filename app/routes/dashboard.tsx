import { useEffect, useMemo } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticatedAdmin } from "@server/shopify.server";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  DataTable,
  Layout,
  LegacyStack,
  Text,
  Button,
  Spinner,
} from "@shopify/polaris";
import type { MarketingOpportunity, ProductPairPattern } from "@modules/storage/models";
import { getLastAnalysisTime, getOpportunities, getPatterns } from "@modules/storage/models";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticatedAdmin(request);
  const [patterns, opportunities, lastAnalysisTime] = await Promise.all([
    getPatterns(),
    getOpportunities(),
    getLastAnalysisTime(),
  ]);
  return json({ patterns, opportunities, lastAnalysisTime });
};

export default function Dashboard() {
  const { patterns, opportunities, lastAnalysisTime } = useLoaderData<typeof loader>();
  const scanFetcher = useFetcher<typeof loader>();
  const isScanning = scanFetcher.state !== "idle";

  const patternRows = useMemo(
    () =>
      patterns.map((p: ProductPairPattern) => [p.productA, p.productB, p.pairCount, p.customerCount]),
    [patterns]
  );

  const opportunityRows = useMemo(
    () =>
      opportunities.map((o: MarketingOpportunity) => [o.productPurchased, o.missingProduct, o.audienceSize]),
    [opportunities]
  );

  useEffect(() => {
    if (scanFetcher.data?.patterns) {
      // In a real app we might refresh state via revalidation
    }
  }, [scanFetcher.data]);

  return (
    <Page title="Marketing Helper" subtitle="Detect buying patterns and segmentation opportunities">
      <Layout>
        <Layout.Section>
          <Card>
            <LegacyStack alignment="center" distribution="equalSpacing">
              <div>
                <Text variant="headingMd" as="h3">
                  Detected patterns
                </Text>
                <Text tone="subdued">
                  {lastAnalysisTime ? `Last scan: ${new Date(lastAnalysisTime).toLocaleString()}` : "Never scanned"}
                </Text>
              </div>
              <scanFetcher.Form method="post" action="/api/scan">
                <Button submit primary loading={isScanning}>
                  Scan shop
                </Button>
              </scanFetcher.Form>
            </LegacyStack>
          </Card>
        </Layout.Section>

        <Layout.Section oneHalf>
          <Card title="Detected Product Patterns" sectioned>
            {isScanning ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Spinner accessibilityLabel="Scanning shop" size="large" />
              </div>
            ) : (
              <DataTable
                columnContentTypes={["text", "text", "numeric", "numeric"]}
                headings={["Product A", "Product B", "Pair Count", "Customer Count"]}
                rows={patternRows}
                footerContent={patternRows.length === 0 ? "No patterns detected yet" : undefined}
              />
            )}
          </Card>
        </Layout.Section>

        <Layout.Section oneHalf>
          <Card title="Marketing Opportunities" sectioned>
            {isScanning ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Spinner accessibilityLabel="Scanning shop" size="large" />
              </div>
            ) : (
              <DataTable
                columnContentTypes={["text", "text", "numeric"]}
                headings={["Purchased", "Missing", "Audience size"]}
                rows={opportunityRows}
                footerContent={opportunityRows.length === 0 ? "No opportunities yet" : undefined}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
