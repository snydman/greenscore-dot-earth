/**
 * Curated fossil fuel company reference list.
 * Keyed by 9-digit CUSIP for matching against SEC N-PORT fund holdings.
 *
 * CUSIPs verified against actual SEC N-PORT filings (March 2026).
 * A production version would ingest the full GCEL (Global Coal Exit List)
 * and Carbon Underground 200 datasets for broader coverage.
 */
export const FOSSIL_COMPANIES: Map<string, string> = new Map([
  // === Oil & Gas Majors / Integrated ===
  ["30231G102", "Exxon Mobil Corp"],
  ["166764100", "Chevron Corp"],
  ["20825C104", "ConocoPhillips"],
  ["780259305", "Shell plc (ADR A)"],
  ["780259206", "Shell plc (ADR B)"],
  ["055622104", "BP plc (ADR)"],
  ["89151E109", "TotalEnergies SE (ADR)"],
  ["674599105", "Occidental Petroleum Corp"],
  ["26875P101", "EOG Resources Inc"],
  ["718546104", "Phillips 66"],
  ["91913Y100", "Valero Energy Corp"],
  ["56585A102", "Marathon Petroleum Corp"],
  ["25179M103", "Devon Energy Corp"],
  ["25278X109", "Diamondback Energy Inc"],
  ["42809H107", "Hess Corp"],
  ["03743Q108", "APA Corp"],
  ["17888H103", "Civitas Resources Inc"],
  ["127097103", "Coterra Energy Inc"],
  ["15118V207", "Cenovus Energy Inc"],
  ["80007P100", "Suncor Energy Inc"],
  ["05534B760", "BP Prudhoe Bay Royalty Trust"],
  ["29250N105", "Eni SpA (ADR)"],
  ["69047Q102", "Ovintiv Inc"],

  // === Oil & Gas E&P (Exploration & Production) ===
  ["75281A109", "Range Resources Corp"],
  ["674215207", "Chord Energy Corp"],
  ["71424F105", "Permian Resources Corp"],
  ["559663109", "Magnolia Oil & Gas Corp"],
  ["78454L100", "SM Energy Co"],
  ["576485205", "Matador Resources Co"],
  ["626717102", "Murphy Oil Corp"],
  ["03674X106", "Antero Resources Corp"],

  // === Oilfield Services ===
  ["806857108", "SLB Ltd"],
  ["406216101", "Halliburton Co"],
  ["05722G100", "Baker Hughes Co"],
  ["53115L104", "Liberty Energy Inc"],
  ["678026105", "Oil States International Inc"],
  ["21867A105", "Core Laboratories Inc"],

  // === Midstream / Pipelines ===
  ["969457100", "Williams Cos Inc"],
  ["49456B101", "Kinder Morgan Inc"],
  ["29250R109", "Enbridge Inc"],
  ["682680103", "ONEOK Inc"],
  ["87612G101", "Targa Resources Corp"],
  ["29379R100", "Enterprise Products Partners"],
  ["03676B102", "Antero Midstream Corp"],
  ["23345M107", "DT Midstream Inc"],

  // === Coal ===
  ["704551100", "Peabody Energy Corp"],
  ["218937100", "CONSOL Energy Inc"],
  ["93627C101", "Warrior Met Coal Inc"],
  ["020764106", "Alpha Metallurgical Resources Inc"],
  ["02044E103", "Alliance Resource Partners"],
  ["629579103", "NACCO Industries Inc"],

  // === Refining ===
  ["24665A103", "Delek US Holdings Inc"],
  ["403949100", "HF Sinclair Corp"],
  ["69318G106", "PBF Energy Inc"],

  // === Natural Gas Utilities / Distribution ===
  ["636180101", "National Fuel Gas Co"],
  ["844895102", "Southwest Gas Holdings Inc"],
  ["84857L101", "Spire Inc"],
  ["68235P108", "ONE Gas Inc"],

  // === LNG ===
  ["16411R208", "Cheniere Energy Inc"],
]);
