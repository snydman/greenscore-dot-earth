/**
 * State-level CO2 emissions rates for electricity generation.
 * Source: EPA eGRID 2023 — output emission rates (lbs CO2 per MWh).
 *
 * Used to adjust electric heating scores based on how clean a state's
 * grid is. States with cleaner grids make electric heating (especially
 * heat pumps) more beneficial.
 *
 * Data changes slowly (grid mix evolves over years), so a static table
 * is appropriate. Update annually from:
 * https://www.epa.gov/egrid/summary-data
 */

export type StateEntry = {
  name: string;
  co2LbsPerMWh: number;
};

/** US national average CO2 lbs/MWh (eGRID 2023) */
export const NATIONAL_AVG_CO2 = 818;

/**
 * State CO2 output emission rates (lbs CO2/MWh) from eGRID 2023.
 * Keyed by two-letter state/territory code.
 */
export const STATE_GRID_EMISSIONS: Record<string, StateEntry> = {
  AL: { name: "Alabama", co2LbsPerMWh: 711 },
  AK: { name: "Alaska", co2LbsPerMWh: 810 },
  AZ: { name: "Arizona", co2LbsPerMWh: 575 },
  AR: { name: "Arkansas", co2LbsPerMWh: 680 },
  CA: { name: "California", co2LbsPerMWh: 394 },
  CO: { name: "Colorado", co2LbsPerMWh: 1085 },
  CT: { name: "Connecticut", co2LbsPerMWh: 410 },
  DE: { name: "Delaware", co2LbsPerMWh: 760 },
  DC: { name: "District of Columbia", co2LbsPerMWh: 394 },
  FL: { name: "Florida", co2LbsPerMWh: 790 },
  GA: { name: "Georgia", co2LbsPerMWh: 700 },
  HI: { name: "Hawaii", co2LbsPerMWh: 1100 },
  ID: { name: "Idaho", co2LbsPerMWh: 190 },
  IL: { name: "Illinois", co2LbsPerMWh: 540 },
  IN: { name: "Indiana", co2LbsPerMWh: 1350 },
  IA: { name: "Iowa", co2LbsPerMWh: 680 },
  KS: { name: "Kansas", co2LbsPerMWh: 780 },
  KY: { name: "Kentucky", co2LbsPerMWh: 1500 },
  LA: { name: "Louisiana", co2LbsPerMWh: 730 },
  ME: { name: "Maine", co2LbsPerMWh: 250 },
  MD: { name: "Maryland", co2LbsPerMWh: 530 },
  MA: { name: "Massachusetts", co2LbsPerMWh: 530 },
  MI: { name: "Michigan", co2LbsPerMWh: 940 },
  MN: { name: "Minnesota", co2LbsPerMWh: 670 },
  MS: { name: "Mississippi", co2LbsPerMWh: 680 },
  MO: { name: "Missouri", co2LbsPerMWh: 1450 },
  MT: { name: "Montana", co2LbsPerMWh: 830 },
  NE: { name: "Nebraska", co2LbsPerMWh: 900 },
  NV: { name: "Nevada", co2LbsPerMWh: 590 },
  NH: { name: "New Hampshire", co2LbsPerMWh: 220 },
  NJ: { name: "New Jersey", co2LbsPerMWh: 420 },
  NM: { name: "New Mexico", co2LbsPerMWh: 900 },
  NY: { name: "New York", co2LbsPerMWh: 350 },
  NC: { name: "North Carolina", co2LbsPerMWh: 590 },
  ND: { name: "North Dakota", co2LbsPerMWh: 1350 },
  OH: { name: "Ohio", co2LbsPerMWh: 1050 },
  OK: { name: "Oklahoma", co2LbsPerMWh: 680 },
  OR: { name: "Oregon", co2LbsPerMWh: 250 },
  PA: { name: "Pennsylvania", co2LbsPerMWh: 560 },
  RI: { name: "Rhode Island", co2LbsPerMWh: 530 },
  SC: { name: "South Carolina", co2LbsPerMWh: 430 },
  SD: { name: "South Dakota", co2LbsPerMWh: 310 },
  TN: { name: "Tennessee", co2LbsPerMWh: 560 },
  TX: { name: "Texas", co2LbsPerMWh: 790 },
  UT: { name: "Utah", co2LbsPerMWh: 1150 },
  VT: { name: "Vermont", co2LbsPerMWh: 8 },
  VA: { name: "Virginia", co2LbsPerMWh: 500 },
  WA: { name: "Washington", co2LbsPerMWh: 220 },
  WV: { name: "West Virginia", co2LbsPerMWh: 1919 },
  WI: { name: "Wisconsin", co2LbsPerMWh: 950 },
  WY: { name: "Wyoming", co2LbsPerMWh: 1755 },
};

/** Sorted list of states for UI dropdowns */
export const STATE_LIST = Object.entries(STATE_GRID_EMISSIONS)
  .map(([code, entry]) => ({ code, name: entry.name }))
  .sort((a, b) => a.name.localeCompare(b.name));
