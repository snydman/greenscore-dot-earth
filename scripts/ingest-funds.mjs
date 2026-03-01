import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data");
const OUT_FILE = path.join(OUT_DIR, "funds.json");

function main() {
  // Placeholder: we’ll parse As You Sow data next.
  // For now, write a tiny sample mapping so we can wire the app end-to-end.
  const sample = {
    VTI: {
      name: "Vanguard Total Stock Market ETF",
      fossilFlag: "unknown",
      source: "placeholder",
      asOf: new Date().toISOString().slice(0, 10),
    },
    ICLN: {
      name: "iShares Global Clean Energy ETF",
      fossilFlag: "unknown",
      source: "placeholder",
      asOf: new Date().toISOString().slice(0, 10),
    },
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(sample, null, 2), "utf8");
  console.log(`Wrote ${OUT_FILE}`);
}

main();