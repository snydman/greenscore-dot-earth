# GreenScore data ingestion (prototype)

This project ingests third-party datasets (downloaded manually) and produces compact JSON
files committed under `src/data/` for use by the prototype.

## Folder layout

- `data/raw/` — downloaded source files (NOT committed; ignored by git)
- `scripts/` — ingestion scripts that transform raw files into app-ready JSON
- `src/data/` — generated JSON files used by the app (committed)

## Investments (As You Sow) — planned

1. Download the relevant "Download Data" file from As You Sow (e.g., Fossil Free Funds).
2. Save it into `data/raw/` (example: `data/raw/asyousow_fossil_free_funds.xlsx`)
3. Run the ingestion script (to be added) to generate:
   - `src/data/funds.json`
   - optional: `src/data/funds.meta.json`

## Notes

- Keep generated JSON small: only include fields needed for v1 scoring.
- Include a source name + "as of" date in metadata.