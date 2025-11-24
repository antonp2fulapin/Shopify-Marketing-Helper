import type { Session } from "@shopify/shopify-api";
import { apiClient } from "@server/shopify.server";
import type { MarketingOpportunity, ProductPairPattern } from "@modules/storage/models";
import { saveAnalysis } from "@modules/storage/models";

export type OrderNode = {
  id: string;
  name: string;
  customerId?: string;
  lineItems: { productId: string; title: string }[];
};

export type CustomerNode = {
  id: string;
  email?: string | null;
};

type GraphQLConnection<T> = {
  edges: { node: T; cursor: string }[];
  pageInfo: { hasNextPage: boolean; endCursor?: string | null };
};

const ORDERS_QUERY = `#graphql
  query Orders($first: Int!, $after: String) {
    orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      edges {
        cursor
        node {
          id
          name
          customer { id }
          lineItems(first: 50) {
            edges {
              node { product { id title } }
            }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const CUSTOMERS_QUERY = `#graphql
  query Customers($first: Int!, $after: String) {
    customers(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      edges {
        cursor
        node { id email }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

async function paginate<T>(
  client: Awaited<ReturnType<typeof apiClient>>,
  query: string,
  key: string,
  mapFn: (node: any) => T
): Promise<T[]> {
  let after: string | null | undefined;
  const results: T[] = [];
  do {
    const response = await client.query<{ [k: string]: GraphQLConnection<any> }>({
      data: query,
      variables: { first: 50, after },
    });
    const connection = response.body.data?.[key];
    if (!connection) break;

    for (const edge of connection.edges) {
      results.push(mapFn(edge.node));
    }
    after = connection.pageInfo.endCursor;
  } while (after);

  return results;
}

export async function scanShop(session: Session) {
  const client = await apiClient(session);
  const orders = await paginate<OrderNode>(client, ORDERS_QUERY, "orders", (node) => ({
    id: node.id,
    name: node.name,
    customerId: node.customer?.id ?? undefined,
    lineItems: (node.lineItems.edges || [])
      .map((edge: any) => edge.node)
      .filter((line: any) => !!line.product?.id)
      .map((line: any) => ({ productId: line.product.id, title: line.product.title })),
  }));

  const customers = await paginate<CustomerNode>(client, CUSTOMERS_QUERY, "customers", (node) => ({
    id: node.id,
    email: node.email,
  }));

  const { patterns, opportunities } = buildPatterns(orders, customers);
  await saveAnalysis(patterns, opportunities);
  return { patterns, opportunities };
}

export function buildPatterns(
  orders: OrderNode[],
  _customers: CustomerNode[]
): { patterns: ProductPairPattern[]; opportunities: MarketingOpportunity[] } {
  const productPairCounts = new Map<string, { count: number; customers: Set<string> }>();
  const customerPurchases = new Map<string, Set<string>>();

  for (const order of orders) {
    if (!order.customerId) continue;
    const products = new Set(order.lineItems.map((l) => l.productId));
    const current = customerPurchases.get(order.customerId) || new Set<string>();
    for (const productId of products) current.add(productId);
    customerPurchases.set(order.customerId, current);

    const productList = Array.from(products);
    for (let i = 0; i < productList.length; i++) {
      for (let j = i + 1; j < productList.length; j++) {
        const key = [productList[i], productList[j]].sort().join("|");
        const existing = productPairCounts.get(key) || { count: 0, customers: new Set<string>() };
        existing.count += 1;
        existing.customers.add(order.customerId);
        productPairCounts.set(key, existing);
      }
    }
  }

  const patterns: ProductPairPattern[] = Array.from(productPairCounts.entries())
    .filter(([_, value]) => value.customers.size > 1)
    .map(([key, value]) => {
      const [productA, productB] = key.split("|");
      return {
        id: key,
        productA,
        productB,
        pairCount: value.count,
        customerCount: value.customers.size,
      };
    })
    .sort((a, b) => b.pairCount - a.pairCount);

  const opportunities: MarketingOpportunity[] = [];
  for (const [pairKey, details] of productPairCounts.entries()) {
    const [productA, productB] = pairKey.split("|");
    let onlyA = 0;
    for (const purchases of customerPurchases.values()) {
      if (purchases.has(productA) && !purchases.has(productB)) {
        onlyA += 1;
      }
    }
    if (onlyA > 0 && details.customers.size > 0) {
      opportunities.push({
        id: `${productA}->${productB}`,
        productPurchased: productA,
        missingProduct: productB,
        audienceSize: onlyA,
      });
    }
  }

  return { patterns, opportunities };
}
