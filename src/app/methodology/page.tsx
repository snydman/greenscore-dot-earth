import SiteNav from "../../components/SiteNav";

export default function MethodologyPage() {
  return (
    <main id="main-content" className="gs-container py-10 sm:py-14">
      <SiteNav />

      <div className="mx-auto mt-8 max-w-2xl space-y-10">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Methodology
          </h1>
          <p className="text-sm text-[color:var(--gs-text-muted)]">
            How GreenScore measures the environmental impact of your banking,
            transport, heating, air travel, and investment choices. This page covers the
            data sources, scoring formulas, and known limitations of the
            current prototype.
          </p>
        </div>

        {/* ── Data Sources ── */}
        <Section title="Data sources">
          <p>
            GreenScore pulls data from the following free, public APIs and
            datasets. No proprietary data is used &mdash; everything is
            verifiable.
          </p>
          <div className="overflow-hidden rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--gs-border-subtle)] bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2.5">Category</th>
                  <th scope="col" className="px-4 py-2.5">Source</th>
                  <th scope="col" className="px-4 py-2.5">What we use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--gs-border-subtle)]">
                <tr>
                  <td className="px-4 py-2 font-semibold">Banking</td>
                  <td className="px-4 py-2">
                    <a href="https://bank.green" className="font-semibold text-emerald-800 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">Bank.Green GraphQL API</a>
                  </td>
                  <td className="px-4 py-2">Fossil fuel lending ratings for 5,000+ banks worldwide</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Transport</td>
                  <td className="px-4 py-2">
                    <a href="https://fueleconomy.gov" className="font-semibold text-emerald-800 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">EPA fueleconomy.gov</a>
                  </td>
                  <td className="px-4 py-2">CO&#x2082; g/mile and MPG for every vehicle sold in the US</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Heating</td>
                  <td className="px-4 py-2">
                    <a href="https://www.epa.gov/egrid" className="font-semibold text-emerald-800 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">EPA eGRID 2023</a>
                  </td>
                  <td className="px-4 py-2">State-level grid carbon intensity (lbs CO&#x2082;/MWh)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Investments</td>
                  <td className="px-4 py-2">
                    <a href="https://www.sec.gov/search-filings/edgar-application-programming-interfaces" className="font-semibold text-emerald-800 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">SEC EDGAR</a>
                  </td>
                  <td className="px-4 py-2">N-PORT quarterly fund holdings (complete portfolio disclosure)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">EV chargers</td>
                  <td className="px-4 py-2">
                    <a href="https://developer.nlr.gov/docs/alt-fuel-stations-v1/" className="font-semibold text-emerald-800 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">NREL Alt Fuel Stations API</a>
                  </td>
                  <td className="px-4 py-2">EV charging stations within 10 miles of your zip code</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Solar</td>
                  <td className="px-4 py-2">
                    <a href="https://developer.nlr.gov/docs/solar/pvwatts/v8/" className="font-semibold text-emerald-800 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">NREL PVWatts v8 API</a>
                  </td>
                  <td className="px-4 py-2">Estimated annual solar production for a 5kW rooftop system</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Geocoding</td>
                  <td className="px-4 py-2">
                    <a href="https://api.zippopotam.us" className="font-semibold text-emerald-800 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">Zippopotam.us</a>
                  </td>
                  <td className="px-4 py-2">Zip code to coordinates and state (for local insights)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Action plan</td>
                  <td className="px-4 py-2">
                    <a href="https://docs.anthropic.com" className="font-semibold text-emerald-800 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">Anthropic Claude API</a>
                  </td>
                  <td className="px-4 py-2">AI-generated personalized action plan (Claude Haiku)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            All API calls are made server-side. Your answers stay in your
            browser via localStorage &mdash; we do not store any personal data.
          </p>
        </Section>

        {/* ── Overall Score ── */}
        <Section title="Overall GreenScore">
          <p>
            Your overall GreenScore is the sum of five category subscores,
            totaling a maximum of 100 points:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Banking</strong> &mdash; 0 to 18 points (based on fossil
              fuel lending)
            </li>
            <li>
              <strong>Transport</strong> &mdash; 0 to 18 points (based on
              vehicle CO&#x2082; emissions)
            </li>
            <li>
              <strong>Heating</strong> &mdash; 0 to 18 points (based on home
              heating type and grid cleanliness)
            </li>
            <li>
              <strong>Air travel</strong> &mdash; 0 to 10 points (based on
              flight frequency)
            </li>
            <li>
              <strong>Investments</strong> &mdash; 0 to 36 points (based on
              fossil fuel holdings in your funds)
            </li>
          </ul>
          <p>
            Your score is displayed directly as a number out of 100. Investments
            carry the most weight because financial assets are typically the
            largest lever for individual climate impact.
          </p>
        </Section>

        {/* ── Banking ── */}
        <Section title="Banking score (0&ndash;18)">
          <p>
            We score your bank based on its exposure to fossil fuel lending
            using ratings from{" "}
            <a
              href="https://bank.green"
              className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bank.Green
            </a>
            , a nonprofit that tracks which banks finance fossil fuel projects.
          </p>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--gs-border-subtle)] bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2.5">Bank.Green rating</th>
                  <th scope="col" className="px-4 py-2.5">Score</th>
                  <th scope="col" className="px-4 py-2.5">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--gs-border-subtle)]">
                <tr>
                  <td className="px-4 py-2">
                    <Grade letter="Great" color="emerald" />
                  </td>
                  <td className="px-4 py-2 font-semibold">18</td>
                  <td className="px-4 py-2">Fossil Free certified &mdash; no fossil fuel lending</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">
                    <Grade letter="Good" color="emerald" />
                  </td>
                  <td className="px-4 py-2 font-semibold">14</td>
                  <td className="px-4 py-2">Minimal fossil fuel exposure, strong climate policies</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">
                    <Grade letter="OK" color="amber" />
                  </td>
                  <td className="px-4 py-2 font-semibold">9</td>
                  <td className="px-4 py-2">Some fossil fuel lending, limited transparency</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">
                    <Grade letter="Bad" color="orange" />
                  </td>
                  <td className="px-4 py-2 font-semibold">4</td>
                  <td className="px-4 py-2">Significant fossil fuel financing</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">
                    <Grade letter="Worst" color="red" />
                  </td>
                  <td className="px-4 py-2 font-semibold">0</td>
                  <td className="px-4 py-2">Among the world&apos;s largest fossil fuel financiers</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            We search the Bank.Green database of over 5,000 banks worldwide. If
            your bank is not found, we estimate a score based on bank type:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>CDFI / community bank</strong> &mdash; scored as &ldquo;Good&rdquo; (14 points)</li>
            <li><strong>Credit union</strong> &mdash; scored as &ldquo;OK&rdquo; (9 points)</li>
            <li><strong>Online / neobank</strong> &mdash; scored as &ldquo;OK&rdquo; (9 points)</li>
            <li><strong>Regional bank</strong> &mdash; scored as &ldquo;OK&rdquo; (9 points)</li>
            <li><strong>Large national bank</strong> &mdash; scored as &ldquo;Bad&rdquo; (4 points)</li>
          </ul>
          <p>
            <strong>Multiple banks:</strong> If you enter more than one bank,
            the first bank you add is treated as your primary and receives 60%
            of the weight. The remaining banks share the other 40% equally.
            With a single bank, it receives 100% weight.
          </p>
        </Section>

        {/* ── Transport ── */}
        <Section title="Transport score (0&ndash;18)">
          <p>
            We score your primary vehicle based on its tailpipe CO&#x2082; emissions
            using data from the{" "}
            <a
              href="https://fueleconomy.gov"
              className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              EPA fueleconomy.gov
            </a>{" "}
            database. Every vehicle sold in the US has official EPA emissions
            data including CO&#x2082; grams per mile and combined MPG.
          </p>

          <p>
            The score is calculated as:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              score = 18 &times; (1 &minus; CO&#x2082; g/mile / 500)
            </code>
            , clamped to 0&ndash;18.
          </p>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--gs-border-subtle)] bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2.5">CO&#x2082; g/mile</th>
                  <th scope="col" className="px-4 py-2.5">Score</th>
                  <th scope="col" className="px-4 py-2.5">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--gs-border-subtle)]">
                <tr>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2 font-semibold">18</td>
                  <td className="px-4 py-2">
                    <Grade letter="Great" color="emerald" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">1 &ndash; 150</td>
                  <td className="px-4 py-2 font-semibold">13 &ndash; 18</td>
                  <td className="px-4 py-2">
                    <Grade letter="Good" color="emerald" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">151 &ndash; 300</td>
                  <td className="px-4 py-2 font-semibold">7 &ndash; 13</td>
                  <td className="px-4 py-2">
                    <Grade letter="OK" color="amber" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">301 &ndash; 450</td>
                  <td className="px-4 py-2 font-semibold">2 &ndash; 7</td>
                  <td className="px-4 py-2">
                    <Grade letter="Bad" color="orange" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">451+</td>
                  <td className="px-4 py-2 font-semibold">0 &ndash; 2</td>
                  <td className="px-4 py-2">
                    <Grade letter="Worst" color="red" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Special cases:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>No car</strong> &mdash; 18/18 (zero transport emissions)</li>
            <li><strong>Not sure / skipped</strong> &mdash; 9/18 (scored neutrally)</li>
          </ul>
          <p>
            <strong>Multiple vehicles:</strong> If you enter more than one
            vehicle, the first vehicle you add is treated as your primary and
            receives 60% of the weight. The remaining vehicles share the other
            40% equally. With a single vehicle, it receives 100% weight.
          </p>
        </Section>

        {/* ── Heating ── */}
        <Section title="Heating score (0&ndash;18)">
          <p>
            We score your home heating based on the type of heating system and,
            for electric heating, the carbon intensity of your state&apos;s
            electricity grid.
          </p>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--gs-border-subtle)] bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2.5">Heating type</th>
                  <th scope="col" className="px-4 py-2.5">Base score</th>
                  <th scope="col" className="px-4 py-2.5">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--gs-border-subtle)]">
                <tr>
                  <td className="px-4 py-2">Heat pump</td>
                  <td className="px-4 py-2 font-semibold">18</td>
                  <td className="px-4 py-2">
                    <Grade letter="Great" color="emerald" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Electric resistance</td>
                  <td className="px-4 py-2 font-semibold">13</td>
                  <td className="px-4 py-2">
                    <Grade letter="Good" color="emerald" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Natural gas</td>
                  <td className="px-4 py-2 font-semibold">9</td>
                  <td className="px-4 py-2">
                    <Grade letter="OK" color="amber" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Wood / pellet</td>
                  <td className="px-4 py-2 font-semibold">7</td>
                  <td className="px-4 py-2">
                    <Grade letter="OK" color="amber" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Propane</td>
                  <td className="px-4 py-2 font-semibold">5</td>
                  <td className="px-4 py-2">
                    <Grade letter="Bad" color="orange" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Heating oil</td>
                  <td className="px-4 py-2 font-semibold">4</td>
                  <td className="px-4 py-2">
                    <Grade letter="Bad" color="orange" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>State grid modifier (electric heating only):</strong> If you
            select a heat pump or electric resistance heating and provide your
            zip code (or state), we adjust the score based on how clean your state&apos;s
            electricity grid is compared to the national average, using{" "}
            <a
              href="https://www.epa.gov/egrid"
              className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              EPA eGRID 2023
            </a>{" "}
            data:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Very clean grid</strong> (e.g. VT, WA, OR) &mdash; +3 points</li>
            <li><strong>Clean grid</strong> (e.g. NY, CA, CT) &mdash; +2 points</li>
            <li><strong>Average grid</strong> &mdash; no adjustment</li>
            <li><strong>Dirty grid</strong> (e.g. CO, OH, MI) &mdash; &minus;2 points</li>
            <li><strong>Very dirty grid</strong> (e.g. WV, WY, KY) &mdash; &minus;3 points</li>
          </ul>
          <p>
            The final score is clamped to 0&ndash;18. Heating type scores are
            based on EIA CO&#x2082; emissions coefficients: natural gas ~117 lbs
            CO&#x2082;/MMBtu, heating oil ~163, propane ~139. Heat pumps earn the top
            score because they are 3&ndash;4&times; more efficient than
            resistance heating with zero on-site combustion emissions.
          </p>
        </Section>

        {/* ── Air Travel ── */}
        <Section title="Air travel score (0&ndash;10)">
          <p>
            Air travel is scored as an awareness category with gentle
            weighting. A single cross-country round-trip emits roughly 1 tonne
            of CO&#x2082; &mdash; about the same as 3 months of average driving.
          </p>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--gs-border-subtle)] bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2.5">Flights per year</th>
                  <th scope="col" className="px-4 py-2.5">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--gs-border-subtle)]">
                <tr>
                  <td className="px-4 py-2">No flights</td>
                  <td className="px-4 py-2 font-semibold">10</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">1&ndash;2 round trips</td>
                  <td className="px-4 py-2 font-semibold">8</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">3&ndash;5 round trips</td>
                  <td className="px-4 py-2 font-semibold">6</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">6&ndash;10 round trips</td>
                  <td className="px-4 py-2 font-semibold">3</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">11+ round trips</td>
                  <td className="px-4 py-2 font-semibold">1</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Not sure</td>
                  <td className="px-4 py-2 font-semibold">5</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            This category is intentionally weighted lower than others. The goal
            is awareness &mdash; understanding where your footprint comes from
            &mdash; not guilt or judgment.
          </p>
        </Section>

        {/* ── Data Source ── */}
        <Section title="Investment data source: SEC EDGAR">
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
        <Section title="Investment scoring formula (0&ndash;36)">
          <p>
            Each fund receives a score from 0 to 36 based on its total fossil
            fuel exposure percentage:
          </p>

          <p>
            The numeric score is calculated as:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              score = 36 &times; (1 &minus; exposure / 20)
            </code>
            , clamped to 0&ndash;36. This means 0% exposure earns a perfect 36,
            and 20% or more yields 0.
          </p>
          <p>
            When you enter multiple tickers, the overall investment score is the
            average of the individual fund scores.
          </p>
        </Section>

        {/* ── Local Insights ── */}
        <Section title="Local insights">
          <p>
            If you provide your zip code, we enrich your results with
            location-specific data:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>EV charger availability</strong> &mdash; nearby charging
              stations from the{" "}
              <a
                href="https://developer.nlr.gov/docs/alt-fuel-stations-v1/"
                className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                NREL Alternative Fuel Stations API
              </a>
            </li>
            <li>
              <strong>Solar potential</strong> &mdash; estimated annual
              production from a typical 5kW rooftop system via the{" "}
              <a
                href="https://developer.nlr.gov/docs/solar/pvwatts/v8/"
                className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                NREL PVWatts API
              </a>
            </li>
            <li>
              <strong>Grid cleanliness</strong> &mdash; your state&apos;s grid
              carbon intensity is automatically applied to your heating score
              if you use electric heating
            </li>
          </ul>
          <p>
            Your zip code is used only for the API call and is never stored.
          </p>
        </Section>

        {/* ── Confidence ── */}
        <Section title="Confidence level">
          <p>
            We report a confidence level alongside your investment score to indicate how
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
            <li>Add individual stock scoring (not just funds)</li>
            <li>Expand Bank.Green coverage beyond the current ~30 banks</li>
            <li>Add everyday choices scoring (diet, shopping, travel habits)</li>
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
