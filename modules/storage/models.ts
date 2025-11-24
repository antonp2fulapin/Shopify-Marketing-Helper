import fs from "fs/promises";
import path from "path";

export type ProductPairPattern = {
  id: string;
  productA: string;
  productB: string;
  pairCount: number;
  customerCount: number;
};

export type MarketingOpportunity = {
  id: string;
  productPurchased: string;
  missingProduct: string;
  audienceSize: number;
};

export type AnalysisSnapshot = {
  patterns: ProductPairPattern[];
  opportunities: MarketingOpportunity[];
  lastAnalysisTime: string;
};

const DATA_PATH = path.join(process.cwd(), "db", "analysis.json");

const defaultSnapshot: AnalysisSnapshot = {
  patterns: [],
  opportunities: [],
  lastAnalysisTime: "",
};

async function ensureFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(defaultSnapshot, null, 2));
  }
}

export async function readSnapshot(): Promise<AnalysisSnapshot> {
  await ensureFile();
  const content = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(content) as AnalysisSnapshot;
}

export async function writeSnapshot(snapshot: AnalysisSnapshot) {
  await ensureFile();
  await fs.writeFile(DATA_PATH, JSON.stringify(snapshot, null, 2));
}

export async function saveAnalysis(
  patterns: ProductPairPattern[],
  opportunities: MarketingOpportunity[]
) {
  const now = new Date().toISOString();
  await writeSnapshot({ patterns, opportunities, lastAnalysisTime: now });
}

export async function getPatterns() {
  const snapshot = await readSnapshot();
  return snapshot.patterns;
}

export async function getOpportunities() {
  const snapshot = await readSnapshot();
  return snapshot.opportunities;
}

export async function getLastAnalysisTime() {
  const snapshot = await readSnapshot();
  return snapshot.lastAnalysisTime;
}
