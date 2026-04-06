# DAT.co Assignment Report

## 1. Selected Indicator

**Indicator:** BTC NAV per Diluted Share (USD) for Strategy (MSTR)

### Why I chose this indicator

I chose BTC NAV per diluted share because it captures how much Bitcoin asset value is economically backing each diluted share of Strategy. It is a useful DAT.co-related indicator because it links treasury accumulation, Bitcoin price, and corporate dilution into one simple per-share metric.

This makes it helpful for understanding how much BTC exposure a shareholder is effectively getting over time.

---

## 2. Data Sources

I used three public data sources:

1. **CoinGecko public treasury holding chart**
   - Used to collect Strategy's daily BTC holdings history

2. **CoinGecko Bitcoin market chart**
   - Used to collect daily BTC/USD prices

3. **Strategy official shares page**
   - Used to obtain official assumed diluted share snapshots

### Calculation method

The selected indicator is calculated as:

```text
BTC NAV per Diluted Share = (BTC Holdings / Assumed Diluted Shares Outstanding) × BTC Price
```

### Assumption

Because Strategy does not publish diluted shares for every single day, I used official snapshot dates and forward-filled the latest available value until the next official snapshot.

---

## 3. Relationship with Bitcoin (BTC)

This indicator is directly related to BTC in several ways:

1. **BTC price effect**
   - If BTC price rises, BTC NAV per diluted share usually rises as well, assuming holdings and share count are unchanged.

2. **Treasury accumulation effect**
   - If Strategy buys more Bitcoin, BTC holdings increase, which tends to increase BTC NAV per diluted share.

3. **Dilution effect**
   - If the company issues more shares, BTC exposure per diluted share can fall unless BTC holdings increase fast enough to offset the dilution.

### Insight / hypothesis

My hypothesis is that BTC NAV per diluted share can act as a clean “Bitcoin backing per share” metric for DAT.co analysis.

- When BTC price rises sharply, the indicator tends to rise immediately.
- When the company accumulates BTC, the indicator can improve even if BTC price stays stable.
- When dilution increases, the per-share benefit of treasury growth may weaken.

Therefore, this indicator may help investors understand whether shareholder BTC exposure is actually improving over time.

---

## 4. Website Visualization

I built a web dashboard that allows users to observe:

- BTC NAV per diluted share over time (daily frequency)
- Strategy BTC holdings over time
- BTC/USD price over time
- Automatically generated summary text based on the latest data

The website also displays:

- latest indicator value
- latest holdings
- latest BTC price
- 30-day change metrics
- methodology and source tables

---

## 5. Deployed Website URL

**Website URL:**

```text
PASTE_YOUR_VERCEL_URL_HERE
```

Example:

```text
https://your-project-name.vercel.app
```

---

## 6. Conclusion

This project demonstrates how DAT.co-related metrics can be visualized through a simple web platform. By combining treasury holdings, BTC market prices, and diluted share data, I built a daily time-series indicator that helps explain how Bitcoin exposure changes for shareholders over time.

The project can be extended further in the future by adding:

- premium/discount to NAV
- mNAV
- multi-company comparison
- AI-generated insight summaries using an LLM API
