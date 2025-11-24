import { shopifyApp, ShopifyRestResources } from "@shopify/shopify-app-remix/server";
import {
  PostgreSQLSessionStorage,
  SQLiteSessionStorage,
} from "@shopify/shopify-app-session-storage-sqlite";
import { BillingInterval, shopifyApi, type Session } from "@shopify/shopify-api";
import { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql";

const {
  SHOPIFY_API_KEY = "",
  SHOPIFY_API_SECRET = "",
  SHOPIFY_APP_URL = "http://localhost:3000",
  SHOPIFY_SCOPES = "read_customers,read_orders",
  SHOPIFY_API_VERSION = "2025-01",
  NODE_ENV = "development",
  DATABASE_URL,
  USE_PG_STORAGE,
} = process.env;

const createSessionStorage = () => {
  if (USE_PG_STORAGE && DATABASE_URL) {
    return PostgreSQLSessionStorage.withCredentials(DATABASE_URL, {
      sessionTableName: "shopify_sessions",
    });
  }

  return SQLiteSessionStorage.withCredentials(process.cwd(), {
    databaseName: "app.db",
    sessionTableName: "shopify_sessions",
  });
};

export const shopify = shopifyApp({
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET,
  apiVersion: SHOPIFY_API_VERSION as any,
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

export const apiClient = async (session: Session) => {
  const client = new GraphqlClient({
    session,
    apiVersion: SHOPIFY_API_VERSION as any,
  });
  return client;
};

export const authenticatedAdmin = shopify.authenticate.admin;
export const validateShopSession = shopify.validateAuthenticatedSession;
