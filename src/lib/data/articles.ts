export type Article = {
  slug: string;
  title: string;
  summary: string;
  category: "banking" | "transport" | "heating" | "investments" | "air-travel" | "lifestyle";
  readMinutes: number;
  publishedAt: string; // ISO date
  content: string; // simple markdown
};

export const ARTICLES: Article[] = [
  {
    slug: "your-bank-funds-fossil-fuels",
    title: "Your bank probably funds fossil fuels. Here's what to do about it.",
    summary:
      "The four largest US banks have poured over $1 trillion into fossil fuel projects since the Paris Agreement. A simple account switch can redirect your money toward a cleaner future.",
    category: "banking",
    readMinutes: 5,
    publishedAt: "2026-03-25",
    content: `Most people choose a bank for convenience — nearby ATMs, a decent app, maybe a sign-up bonus. What rarely comes up is what the bank does with your deposits once they're in the vault.

**The short answer: they lend it out.** And at the four largest US banks — JPMorgan Chase, Citibank, Wells Fargo, and Bank of America — a significant share of that lending goes to oil, gas, and coal companies. Since the Paris Climate Agreement was signed in 2015, these four banks alone have directed over **$1.1 trillion** toward fossil fuel expansion, according to the Banking on Climate Chaos report.

**Your deposits aren't sitting idle.** When you keep $10,000 in a checking account at a major bank, that money is being used as the basis for loans — some of which fund new drilling, pipeline construction, and coal operations. You're not personally responsible for those loans, but your deposits make them possible.

## What can you do?

**1. Check your bank's rating.** Organizations like Bank.Green rate thousands of banks worldwide based on their fossil fuel lending practices. A "Great" rating means the bank has committed to zero fossil fuel financing. GreenScore uses these ratings directly.

**2. Consider a switch.** Moving to a fossil-free bank is one of the highest-impact personal climate actions you can take. Some well-rated options include:
- **Amalgamated Bank** — the largest B Corp bank in the US, committed to fossil-free lending
- **Beneficial State Bank** — a community development financial institution on the West Coast
- **Climate First Bank** — a Florida-based bank built specifically around climate-positive lending
- **Credit unions** — most credit unions have minimal fossil fuel exposure because they're too small to participate in energy project financing

**3. Make the switch easy.** Most banks offer automatic account migration tools. Set up direct deposit at the new bank, move your automatic payments over a couple of weeks, and keep the old account open for a month to catch any stragglers. The whole process typically takes 2–3 weeks.

## Does it actually matter?

Yes. When customers leave fossil-fuel-financing banks and cite climate as the reason, it sends a signal. Several European banks have already adopted fossil-free lending policies in response to customer pressure. In the US, customer outflows are starting to register — Amalgamated Bank's deposits grew by over 40% in the three years following the Paris Agreement as climate-conscious depositors moved their money.

Your individual account may be small, but the collective signal is powerful. And unlike many climate actions, this one doesn't require any sacrifice — the new bank still has ATMs, an app, and FDIC insurance. You just stop funding the problem.`,
  },
  {
    slug: "heat-pumps-explained",
    title: "Heat pumps: the most impactful home upgrade you can make",
    summary:
      "Heat pumps are 3-4x more efficient than gas furnaces, and federal tax credits plus state rebates can cover 50-100% of the cost. Here's what you need to know.",
    category: "heating",
    readMinutes: 7,
    publishedAt: "2026-03-20",
    content: `If you heat your home with gas, oil, or propane, switching to a heat pump is likely the single biggest thing you can do to reduce your household carbon footprint. It's also, thanks to recent legislation, more affordable than it's ever been.

## What is a heat pump?

A heat pump is an electric appliance that moves heat rather than generating it. In winter, it extracts heat from outdoor air and moves it inside. In summer, it reverses — pulling heat out of your home like an air conditioner. In fact, every air conditioner is technically a one-way heat pump.

**The efficiency advantage is enormous.** A gas furnace converts fuel to heat at roughly 95% efficiency at best. A modern heat pump delivers 3–4 units of heat for every unit of electricity it consumes — that's 300–400% efficiency. This is possible because it's moving existing heat, not creating it from scratch.

## Do they work in cold climates?

This is the most common misconception. Modern cold-climate heat pumps (sometimes called "hyper heat" models) work efficiently down to **-15°F**. Maine — not exactly a mild climate — now installs more heat pumps per capita than any other US state. Mitsubishi's Hyper-Heating models maintain full capacity at 5°F and continue operating at -13°F.

If you live in a climate that regularly drops below -15°F, a dual-fuel system (heat pump + small gas backup) covers the handful of extreme days while using the heat pump for 95%+ of the heating season.

## What does it cost?

A whole-home heat pump system (ducted or ductless) typically costs **$15,000–$25,000** installed. But here's where it gets interesting:

**Federal tax credits (Inflation Reduction Act):**
- 30% of the project cost, up to **$2,000 per year** for heat pumps
- This is a tax credit, not a deduction — it directly reduces your tax bill

**State and utility rebates:**
- Many states offer an additional $1,000–$10,000 in rebates
- Some utilities offer rebates on top of state programs
- Low-to-moderate income households may qualify for the federal HEAR program, which can cover up to **$8,000** for a heat pump

**Net cost example:** A $20,000 heat pump installation might cost you $10,000–$12,000 after federal credits and state rebates. If you're replacing an aging furnace anyway, the incremental cost is even lower.

## The grid matters

A heat pump is only as clean as the electricity that powers it. In states with clean grids (Vermont, Washington, Oregon, California), a heat pump is dramatically cleaner than gas. In states with coal-heavy grids (West Virginia, Wyoming), the carbon advantage is smaller but still present — because the efficiency multiplier (3–4x) more than offsets the dirtier electricity in most cases.

As the grid gets cleaner over time (and it is, rapidly), your heat pump automatically gets greener without you doing anything.

## Where to start

1. **Get your GreenScore** to see how your current heating stacks up
2. **Check your state's rebates** at dsireusa.org or your utility's website
3. **Get 2-3 quotes** from HVAC contractors who are experienced with heat pump installations
4. **Ask about cold-climate models** if you live in a northern state
5. **Consider a sustainability coach** who can help navigate the rebate paperwork and contractor selection — this is one of the most impactful but also most complex home upgrades`,
  },
  {
    slug: "what-your-mutual-funds-own",
    title: "What your mutual funds actually own (and why it matters)",
    summary:
      "A typical S&P 500 index fund puts 4-5% of your money into fossil fuel companies. Here's how to find out what's in your portfolio and what the alternatives look like.",
    category: "investments",
    readMinutes: 6,
    publishedAt: "2026-03-15",
    content: `If you have a 401(k), IRA, or brokerage account, chances are you own shares of ExxonMobil, Chevron, and ConocoPhillips — even if you've never bought an oil stock in your life. That's because most broad-market index funds include every company in the index, fossil fuel producers included.

## How much fossil fuel is in a typical fund?

We analyzed holdings data from SEC filings (the same data GreenScore uses) and found:

- **S&P 500 index funds** (like VOO, IVV, SPY): approximately **4–5%** in fossil fuel companies
- **Total market funds** (like VTI, ITOT): approximately **3.5–4.5%** in fossil fuels
- **International funds** (like VXUS, IXUS): approximately **5–7%**, reflecting the heavier weighting of energy companies in European and emerging market indices

These percentages sound small, but applied to real money they add up. If you have $500,000 in a total market fund, roughly **$20,000** of your savings is invested in fossil fuel companies.

## Does it matter financially?

This is where it gets nuanced. Over the past 5 years, fossil-fuel-free versions of major indices have performed roughly in line with their conventional counterparts — sometimes slightly better, sometimes slightly worse. The energy sector has been volatile, which cuts both ways.

What's increasingly clear is that **fossil fuel exclusion doesn't require a return sacrifice.** Several studies (including from MSCI and Morningstar) have found that excluding fossil fuels has had a negligible impact on long-term risk-adjusted returns. The sector is simply not large enough to significantly alter portfolio performance.

## What are the alternatives?

**Fossil-fuel-free index funds** track modified versions of standard indices with energy companies removed:
- **CRBN** (iShares MSCI ACWI Low Carbon Target) — global, low fossil exposure
- **SPYX** (SPDR S&P 500 Fossil Fuel Reserves Free) — S&P 500 minus fossil fuel reserve owners
- **ESGV** (Vanguard ESG US Stock) — excludes fossil fuels plus other ESG screens

**ESG-screened funds** apply broader environmental, social, and governance filters:
- **ESGU** (iShares ESG Aware MSCI USA) — light ESG tilt
- **SUSA** (iShares MSCI USA ESG Select) — stronger ESG selection

**Important caveat:** Not all "ESG" funds exclude fossil fuels. Some ESG funds still hold significant oil and gas positions because they score companies on governance practices, not just environmental impact. Always check the actual holdings — which is exactly what GreenScore does.

## How to check your funds

1. **Enter your tickers into GreenScore.** We'll pull the latest SEC filing and calculate exact fossil fuel exposure
2. **Check your 401(k) options.** Many plans now include at least one ESG or fossil-free option. If yours doesn't, ask your HR department — employee demand is the #1 driver of plan changes
3. **For IRAs and brokerage accounts,** you have full control. Swapping from a conventional index fund to its fossil-free equivalent typically takes 5 minutes online

## The bottom line

You don't have to become a stock-picking activist. Simply knowing what you own — and considering whether a fossil-free alternative exists — is a meaningful step. The money flowing out of conventional funds and into fossil-free alternatives sends a market signal that's already starting to reshape how asset managers think about energy transition risk.`,
  },
  {
    slug: "ev-charging-closer-than-you-think",
    title: "EV charging is closer than you think",
    summary:
      "The US now has over 190,000 public EV chargers, and the number is growing by 30% per year. Range anxiety is increasingly a perception problem, not a real one.",
    category: "transport",
    readMinutes: 5,
    publishedAt: "2026-03-10",
    content: `One of the most common reasons people hesitate to switch to an electric vehicle is range anxiety — the fear of running out of charge with no charger in sight. Five years ago, that concern was legitimate. Today, for most Americans, it's outdated.

## The numbers

As of early 2026, the US has over **190,000 public EV charging ports** at approximately 75,000 stations. That's roughly one station for every two gas stations — and the ratio is improving fast, with installations growing at about 30% per year.

When you enter your zip code into GreenScore, we query the NREL Alternative Fuel Stations database to show you exactly how many chargers are within 10 miles. In most metropolitan and suburban areas, the answer is in the hundreds or thousands.

## Types of chargers

**Level 2 (240V)** — the most common public charger. Adds about 25–30 miles of range per hour. Perfect for charging while you shop, eat, or work. You'll find these at malls, grocery stores, parking garages, and workplaces.

**DC Fast Charging (DCFC)** — the highway warrior. Adds 150–250 miles in 20–30 minutes, depending on the vehicle and charger. Networks like Tesla Supercharger (now open to most EVs), Electrify America, and ChargePoint have built extensive highway corridors.

**Home charging (Level 1 or 2)** — the most convenient option if you have a garage or driveway. A standard 120V outlet adds about 4 miles per hour (enough for many commuters). A 240V home charger adds 25–30 miles per hour, meaning an overnight charge easily covers 200+ miles.

## The daily reality

Here's what most EV owners discover quickly: **you almost never use public chargers for daily driving.** If you can charge at home (even on a standard outlet), you wake up every morning with a full "tank." Public chargers are for road trips and occasional top-ups — not daily life.

The average American drives about 37 miles per day. Even the cheapest EVs on the market have a range of 200+ miles. That means you're using less than 20% of your battery on a typical day.

## What about road trips?

Modern EVs with 250+ mile range and access to fast charging networks make road trips practical. Apps like A Better Route Planner (ABRP) and the built-in navigation in most EVs automatically plan charging stops. A typical road trip might add 15–20 minutes of charging every 2–3 hours of driving — roughly the same as a gas-and-bathroom stop.

## Cost savings

Electricity is dramatically cheaper than gasoline per mile:
- **Gas car** (30 MPG, $3.50/gal): about **$0.12/mile**
- **EV** (3.5 mi/kWh, $0.13/kWh): about **$0.04/mile**

That's roughly 70% cheaper per mile. On 12,000 miles per year, that's about **$1,000 in annual fuel savings.** If you charge during off-peak hours or have solar panels, the savings are even larger.

## Getting started

1. **Check your local charging infrastructure** — enter your zip code in GreenScore to see what's nearby
2. **Test drive an EV** — most dealerships and some rental services (like Turo) offer EV rentals
3. **Check federal and state incentives** — the federal EV tax credit is up to $7,500 for new vehicles, and many states add their own rebates
4. **Consider your home charging options** — even a standard outlet works for many commuters`,
  },
  {
    slug: "flying-less-or-flying-smarter",
    title: "Flying less or flying smarter: what actually helps",
    summary:
      "Aviation is about 2.5% of global CO2, but its real warming effect is roughly double that. You don't have to stop flying — but a few choices make a big difference.",
    category: "air-travel",
    readMinutes: 5,
    publishedAt: "2026-03-05",
    content: `Let's start with the uncomfortable truth: a single round-trip flight from New York to London produces about **1.6 tonnes of CO2** per passenger. That's roughly equivalent to four months of driving. For frequent flyers, aviation can easily become the single largest item in their personal carbon footprint.

But here's the thing: telling people to stop flying isn't realistic and isn't the point. The question is what choices within flying (and around it) actually move the needle.

## What makes the biggest difference

**1. Fewer flights beats everything else.**
This is obvious but worth stating: one fewer round-trip per year has more impact than every other flying-related choice combined. If you fly 6 times a year and cut to 4, that alone might reduce your annual carbon footprint by 10–15%.

Consider: Is this trip necessary in person? Could a video call work? Could you combine two trips into one? Could you take a train instead for shorter routes (under 500 miles, train is almost always lower-carbon)?

**2. Direct flights emit roughly 50% less.**
Takeoff and landing are the most fuel-intensive phases of flight. A connecting flight doubles those phases. A direct flight from New York to San Francisco emits significantly less per passenger than the same trip with a connection in Dallas.

When booking, the direct flight is often worth the premium — both for your time and your carbon footprint.

**3. Economy class is genuinely greener.**
A business class seat takes up 2–3x more space than economy, which means the emissions per passenger are 2–3x higher. First class can be 4x. This isn't about comfort shaming — it's just math. The same plane burns the same fuel; fewer seats means more emissions per person.

**4. Newer planes are more efficient.**
A Boeing 787 or Airbus A350 burns about 25% less fuel per passenger-mile than the aircraft they replaced. You can't always choose your plane, but airlines that have invested in fleet renewal (like Delta's recent orders) tend to have lower per-flight emissions.

## What about carbon offsets?

Carbon offsets are controversial in the climate community. The best offsets (verified, additional, permanent) can genuinely fund emission reductions elsewhere. The worst are essentially meaningless.

If you choose to offset:
- Look for **Gold Standard** or **Verra VCS** certified projects
- Prefer projects that **remove** CO2 (reforestation, direct air capture) over those that **avoid** emissions (which are harder to verify)
- Think of offsets as a supplement, not a substitute for reducing flights

## The bigger picture

Aviation is hard to decarbonize. Unlike cars and home heating, there's no commercial electric option for long-haul flights yet. Sustainable aviation fuel (SAF) exists but currently makes up less than 1% of jet fuel supply. This is an area where individual choices — flying less when possible, flying smarter when not — genuinely matter because technological solutions are still years away.

GreenScore treats air travel as an awareness category with gentle scoring for exactly this reason. The goal isn't guilt — it's understanding where your footprint comes from so you can make informed choices about where to focus your energy.`,
  },
  {
    slug: "five-green-habits-this-week",
    title: "5 green habits you can start this week (no sacrifice required)",
    summary:
      "Not every climate action requires buying a heat pump or switching banks. Here are five small changes that add up — and cost nothing.",
    category: "lifestyle",
    readMinutes: 4,
    publishedAt: "2026-02-28",
    content: `The big moves — switching banks, installing a heat pump, swapping to an EV — get the most attention. And they should: they're high-impact. But not everyone is ready for a major change right now, and that's fine. Here are five things you can do this week that cost nothing and require no major commitments.

## 1. Adjust your thermostat by 2 degrees

Turning your thermostat down 2°F in winter (or up 2°F in summer) reduces your heating/cooling energy use by about **5–10%**. Most people don't notice the difference after a day or two. If you have a programmable thermostat, set it to reduce heating/cooling when you're asleep or away from home.

**Impact:** ~500 lbs of CO2 per year for a typical home.

## 2. Switch to LED bulbs (if you haven't already)

If you still have incandescent or CFL bulbs anywhere in your home, swapping them for LEDs is the easiest efficiency win. LEDs use **75% less energy** and last 25x longer. A 4-pack of LED bulbs costs about $4.

**Impact:** ~100 lbs of CO2 per year per bulb replaced.

## 3. Unplug the energy vampires

Electronics in standby mode ("vampire power") consume 5–10% of household electricity. The biggest offenders: cable boxes, game consoles, old desktop computers, and phone chargers left plugged in. Use a power strip and flip it off when devices aren't in use.

**Impact:** ~200 lbs of CO2 per year for a typical household.

## 4. Eat one more plant-based meal per week

You don't have to go vegetarian. Simply replacing one beef-based meal per week with a plant-based alternative (beans, lentils, tofu, whatever you enjoy) reduces your food-related emissions by about **10%**. Beef production generates roughly 10x the greenhouse gases of chicken and 50x that of beans per gram of protein.

**Impact:** ~300 lbs of CO2 per year per weekly meal swapped.

## 5. Check your tire pressure

Under-inflated tires increase fuel consumption by **3–5%**. A quick check at any gas station (most have free air) takes 5 minutes and improves both your mileage and your tire lifespan. Check monthly or whenever the temperature changes significantly.

**Impact:** ~200 lbs of CO2 per year for a typical driver.

## The compound effect

None of these feels dramatic on its own. But together, they add up to roughly **1,300 lbs of CO2 per year** — about 5% of the average American's annual footprint. And they build the habit of thinking about impact, which often leads to bigger changes over time.

The most sustainable lifestyle change is one you actually stick with. Start small, build momentum, and let the bigger decisions come naturally.`,
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: Article["category"]): Article[] {
  return ARTICLES.filter((a) => a.category === category);
}

const CATEGORY_LABELS: Record<Article["category"], string> = {
  banking: "Banking",
  transport: "Transport",
  heating: "Heating",
  investments: "Investments",
  "air-travel": "Air travel",
  lifestyle: "Lifestyle",
};

export function categoryLabel(cat: Article["category"]): string {
  return CATEGORY_LABELS[cat];
}
