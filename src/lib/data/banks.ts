export type BankGreenRating = "great" | "good" | "ok" | "bad" | "worst";

export type BankEntry = {
  slug: string;
  name: string;
  rating: BankGreenRating;
};

export type BankCategory =
  | "credit_union"
  | "cdfi"
  | "large_national"
  | "online_neobank"
  | "regional"
  | "not_sure";

export const BANK_CATEGORIES: {
  value: BankCategory;
  label: string;
  rating: BankGreenRating;
}[] = [
  { value: "credit_union", label: "Credit union", rating: "ok" },
  { value: "cdfi", label: "CDFI / community bank", rating: "good" },
  { value: "large_national", label: "Large national bank", rating: "bad" },
  { value: "online_neobank", label: "Online / neobank", rating: "ok" },
  { value: "regional", label: "Regional bank", rating: "ok" },
  { value: "not_sure", label: "Not sure", rating: "ok" },
];
