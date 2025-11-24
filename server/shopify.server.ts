import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { PostgreSQLSessionStorage } from "@shopify/shopify-app-session-storage-postgresql";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { BillingInterval, type Session } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";

const {
  SHOPIFY_API_KEY = "",
  SHOPIFY_API_SECRET = "",
  SHOPIFY_APP_URL = "http://localhost:3000",
  SHOPIFY_SCOPES = "read_customers,read_orders",
  SHOPIFY_API_VERSION = "2025-01",
  DATABASE_URL,
  USE_PG_STORAGE,
} = process.env;

const createSessionStorage = () => {
  if (USE_PG_STORAGE && DATABASE_URL) {
    return new PostgreSQLSessionStorage(DATABASE_URL, {
      sessionTableName: "shopify_sessions",
    });
  }

  return new SQLiteSessionStorage(process.cwd(), {
    databaseName: "app.db",
    sessionTableName: "shopify_sessions",
  });
};

export const shopify = shopifyApp({
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET,
  apiVersion: SHOPIFY_API_VERSION,
  scopes: SHOPIFY_SCOPES.split(","),
  appUrl: SHOPIFY_APP_URL,
  sessionStorage: createSessionStorage(),
  billing: {
    required: false,
    defaultCurrency: "USD",
    plans: [],
    interval: BillingInterval.OneTime,
  },
  hooks: {
    afterAuth: async ({ session }) => {
      console.info(`Installed on ${session.shop}`);
    },
  },
});

export const apiClient = async (session: Session) =>
  new shopify.api.clients.Graphql({ session });

export const authenticatedAdmin = shopify.authenticate.admin;
