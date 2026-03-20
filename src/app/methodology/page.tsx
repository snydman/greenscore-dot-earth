import Link from "next/link";

export default function MethodologyPage() {
  return (
    <main className="gs-container py-10 sm:py-14">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 underline-offset-4 hover:text-emerald-900 hover:underline"
        >
          ← Home
        </Link>
        <Link
          href="/results"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 underline-offset-4 hover:text-emerald-900 hover:underline"
        >
          Your results →
        </Link>
      </header>

      <div className="mx-auto mt-8 max-w-2xl space-y-10">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Methodology
          </h1>
          <p className="text-sm text-[color:var(--gs-text-muted)]">
            How GreenScore measures the fossil fuel exposure of your investments.
            This page covers the data sources, scoring formula, and known
            limitations of the current prototype.
          </p>
        </div>

        {/* ── Data Source ── */}
        <Section title="Data source: SEC EDGAR">
          <p>
            We score investment funds (mutual funds and ETFs) using publicly
            available data from the U.S. Securities and Exchange Commission.
            Every registered fund must file <strong>Form N-PORT</strong>{" "}
            quarterly, disclosing its complete portfolio holdings including each
            security&apos;s name, CUSIP identifier, market value, and percentage
            of net assets.
          </p>
          <p>
            We pull these filings directly from the{" "}
            <a
              href="https://www.sec.gov/search-filings/edgar-application-programming-interfaces"
              className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              SEC EDGAR API
            </a>
            . No API key is required. The data is in the public domain.
          </p>
        </Section>

        {/* ── Pipeline ── */}
        <Section title="How the scoring pipeline works">
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              <strong>Ticker lookup.</strong> We map your fund ticker (e.g.
              &ldquo;VTI&rdquo;) to a SEC CIK number and series ID using the
              SEC&apos;s{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                company_tickers_mf.json
              </code>{" "}
              registry.
            </li>
            <li>
              <strong>Find the latest filing.</strong> We query the fund&apos;s
              filing history on EDGAR and locate the most recent N-PORT-P
              filing for the matching series. For large fund families (e.g.
              iShares Trust with 1,400+ filings), we use HTTP range requests
              to efficiently scan filing headers without downloading full
              multi-megabyte XML documents.
            </li>
            <li>
              <strong>Parse holdings.</strong> We extract every security in the
              fund&apos;s portfolio: name, CUSIP, market value, and percentage
              of net assets. A typical broad-market fund like VTI has 3,500+
              holdings.
            </li>
            <li>
              <strong>Match against fossil fuel companies.</strong> Each
              holding&apos;s CUSIP is checked against our curated reference list
              of fossil fuel companies (see below). A match means the fund holds
              shares in that company.
            </li>
            <li>
              <strong>Calculate exposure.</strong> We sum the portfolio
              percentage of all matched fossil fuel holdings to get a total
              fossil fuel exposure percentage.
            </li>
          </ol>
        </Section>

        {/* ── Fossil Fuel List ── */}
        <Section title="Fossil fuel reference list">
          <p>
            We maintain a curated list of approximately 65 fossil fuel companies
            identified by their CUSIP (a standard U.S. securities identifier).
            The list includes:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Oil &amp; gas majors (ExxonMobil, Chevron, ConocoPhillips, Shell, BP, TotalEnergies)</li>
            <li>Exploration &amp; production companies (EOG, Diamondback, Devon, Range Resources)</li>
            <li>Oilfield services (SLB, Halliburton, Baker Hughes)</li>
            <li>Midstream &amp; pipelines (Williams, Kinder Morgan, ONEOK, Targa)</li>
            <li>Coal producers (Peabody Energy, CONSOL Energy, Warrior Met Coal, Alpha Metallurgical)</li>
            <li>Refiners (Marathon Petroleum, Valero, Phillips 66, HF Sinclair)</li>
            <li>Natural gas utilities &amp; LNG (Cheniere Energy, National Fuel Gas, ONE Gas)</li>
          </ul>
          <p>
            CUSIPs were verified against actual SEC N-PORT filings in March
            2026. A production version would ingest the full{" "}
            <a
              href="https://www.coalexit.org/"
              className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Global Coal Exit List
            </a>{" "}
            and{" "}
            <a
              href="https://fossilfreefunds.org/carbon-underground-200"
              className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Carbon Underground 200
            </a>{" "}
            datasets for more comprehensive coverage.
          </p>
        </Section>

        {/* ── Score Formula ── */}
        <Section title="Scoring formula">
          <p>
            Each fund receives a score from 0 to 40 based on its total fossil
            fuel exposure percentage:
          </p>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--gs-border-subtle)] bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">Fossil exposure</th>
                  <th className="px-4 py-2.5">Score</th>
                  <th className="px-4 py-2.5">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--gs-border-subtle)]">
                <tr>
                  <td className="px-4 py-2">0 &ndash; 1%</td>
                  <td className="px-4 py-2 font-semibold">38 &ndash; 40</td>
                  <td className="px-4 py-2">
                    <Grade letter="A" color="emerald" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">1 &ndash; 3%</td>
                  <td className="px-4 py-2 font-semibold">34 &ndash; 38</td>
                  <td className="px-4 py-2">
                    <Grade letter="B" color="emerald" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">3 &ndash; 7%</td>
                  <td className="px-4 py-2 font-semibold">26 &ndash; 34</td>
                  <td className="px-4 py-2">
                    <Grade letter="C" color="amber" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">7 &ndash; 15%</td>
                  <td className="px-4 py-2 font-semibold">10 &ndash; 26</td>
                  <td className="px-4 py-2">
                    <Grade letter="D" color="orange" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">15%+</td>
                  <td className="px-4 py-2 font-semibold">0 &ndash; 10</td>
                  <td className="px-4 py-2">
                    <Grade letter="F" color="red" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            The numeric score is calculated as:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              score = 40 &times; (1 &minus; exposure / 20)
            </code>
            , clamped to 0&ndash;40. This means 0% exposure earns a perfect 40,
            and 20% or more yields 0.
          </p>
          <p>
            When you enter multiple tickers, the overall investment score is the
            average of the individual fund scores.
          </p>
        </Section>

        {/* ── Confidence ── */}
        <Section title="Confidence level">
          <p>
            We report a confidence level alongside your score to indicate how
            much of your input we were able to score:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>High</strong> &mdash; 80%+ of your tickers were
              successfully scored from SEC filings
            </li>
            <li>
              <strong>Medium</strong> &mdash; 50&ndash;79% scored
            </li>
            <li>
              <strong>Low</strong> &mdash; fewer than 50% scored (some tickers
              may not be registered funds, or their filings may not be
              available)
            </li>
          </ul>
        </Section>

        {/* ── Limitations ── */}
        <Section title="Known limitations">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Quarterly lag.</strong> N-PORT filings are due 60 days
              after the end of the fiscal quarter. Fund holdings may have changed
              since the filing date shown in your results.
            </li>
            <li>
              <strong>Fossil company coverage.</strong> Our reference list covers
              ~65 major fossil fuel companies. Smaller producers, foreign-only
              companies, and subsidiaries may not be matched. This means
              actual fossil exposure could be higher than reported.
            </li>
            <li>
              <strong>CUSIP matching only.</strong> We match holdings by CUSIP.
              Holdings reported under alternative identifiers (ISIN, SEDOL) or
              holdings in other funds (fund-of-fund structures) may not be
              matched.
            </li>
            <li>
              <strong>US-registered funds only.</strong> The SEC N-PORT filing
              requirement applies to US-registered mutual funds and ETFs. Funds
              registered outside the US, or unit investment trusts (e.g. SPY),
              cannot be scored with this method.
            </li>
            <li>
              <strong>Single dimension.</strong> We currently score only fossil
              fuel exposure. Other ESG dimensions (deforestation, water, labor
              practices) are not yet covered.
            </li>
            <li>
              <strong>Not investment advice.</strong> GreenScore is an
              educational prototype. It does not constitute financial, tax, or
              investment advice. Always consult a qualified advisor before making
              investment decisions.
            </li>
          </ul>
        </Section>

        {/* ── What's Next ── */}
        <Section title="What&apos;s next">
          <ul className="list-disc space-y-1 pl-5">
            <li>Expand the fossil fuel reference list using the Global Coal Exit List and Carbon Underground 200</li>
            <li>Add banking scoring using public climate commitment data</li>
            <li>Score transport and home energy choices from quiz answers</li>
            <li>Compute a real overall GreenScore from all category subscores</li>
            <li>Add individual stock scoring (not just funds)</li>
          </ul>
        </Section>

        <div className="rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60 p-5 text-center text-xs text-[color:var(--gs-text-muted)]">
          Questions or feedback?{" "}
          <a
            href="https://github.com/snydman/greenscore-dot-earth"
            className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open an issue on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[color:var(--gs-text-main)]">
        {children}
      </div>
    </section>
  );
}

function Grade({ letter, color }: { letter: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald:
      "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
    amber:
      "bg-amber-50 text-amber-800 ring-amber-200/60",
    orange:
      "bg-orange-50 text-orange-800 ring-orange-200/60",
    red: "bg-red-50 text-red-800 ring-red-200/60",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${colorMap[color]}`}
    >
      {letter}
    </span>
  );
}
