-- Shopify session storage tables (SQLite/Postgres) are created automatically by the
-- @shopify/shopify-app-session-storage-* packages. The following helper tables are
-- for storing analysis results if you migrate off the JSON helper in modules/storage.

CREATE TABLE IF NOT EXISTS patterns (
  id TEXT PRIMARY KEY,
  product_a TEXT NOT NULL,
  product_b TEXT NOT NULL,
  pair_count INTEGER NOT NULL,
  customer_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  product_purchased TEXT NOT NULL,
  missing_product TEXT NOT NULL,
  audience_size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analysis_metadata (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_analysis_time TIMESTAMP
);
