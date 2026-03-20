import type { EdgarScoreResult } from "./edgar";
import { edgarResultToFactor } from "./investments";
import { writeOne, setActivePrescore, clearActivePrescore } from "./score-cache";

/**
 * Fire-and-forget background scoring of tickers.
 * Call this when the user advances past the ticker step in the quiz.
 * Returns an AbortController so the caller can cancel if tickers change.
 */
export function startPrescore(tickers: string[]): AbortController {
  const controller = new AbortController();
  const { signal } = controller;

  setActivePrescore(tickers);

  (async () => {
    for (const ticker of tickers) {
      if (signal.aborted) break;

      try {
        const res = await fetch(
          `/api/score-fund?ticker=${encodeURIComponent(ticker)}`,
          { signal },
        );

        if (!res.ok) continue; // skip failures silently

        const data: EdgarScoreResult = await res.json();
        const factor = edgarResultToFactor(ticker, data);
        writeOne(ticker, factor);
      } catch {
        // AbortError or network failure — stop silently
        if (signal.aborted) break;
      }
    }

    clearActivePrescore();
  })();

  return controller;
}
