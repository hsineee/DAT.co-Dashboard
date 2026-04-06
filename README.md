# DAT.co Dashboard — Strategy BTC NAV per Diluted Share

This is a lightweight static website for the assignment.

## What this project does

It tracks one DAT.co-related indicator for **Strategy (MSTR)**:

- **BTC NAV per Diluted Share (USD)**

The indicator is calculated as:

```text
BTC NAV / Diluted Share = (BTC Holdings / Assumed Diluted Shares Outstanding) × BTC Price
```

## Why this indicator is a good assignment choice

It is easy to explain, directly related to Bitcoin, and uses transparent public data:

1. **Strategy BTC holdings** → CoinGecko public treasury holding chart
2. **BTC/USD daily price** → CoinGecko Bitcoin market chart
3. **Diluted shares outstanding snapshots** → Strategy official shares page

## Project structure

```text
.
├── index.html
├── app.js
├── styles.css
├── data/
│   └── indicator.json
├── scripts/
│   └── update_data.py
├── REPORT_TEMPLATE.md
└── vercel.json
```

---

## 1) Run locally on WSL Ubuntu

### A. Install the basics

```bash
sudo apt update
sudo apt install -y python3 python3-pip git unzip
```

> `python3` is enough for this project. No Node.js is required for local preview.

### B. Enter the project folder

If you downloaded and unzipped the project:

```bash
cd ~/datco_strategy_dashboard
```

### C. Build the local dataset

This downloads the latest BTC holdings and BTC price data and writes `data/indicator.json`.

```bash
python3 scripts/update_data.py
```

If it succeeds, you should see output like:

```text
Saved XXX daily rows to .../data/indicator.json
Latest date: YYYY-MM-DD
Latest BTC NAV/share (USD): ...
```

### D. Start a local web server

```bash
python3 -m http.server 8000
```

### E. Open the website in your browser

From Windows, open:

```text
http://localhost:8000
```

If you change source files, just refresh the page.

---

## 2) What to do before deployment

Every time you want fresh data, rerun:

```bash
python3 scripts/update_data.py
```

That updates `data/indicator.json`. Commit that file before deploying so the hosted site contains the newest dataset.

---

## 3) Deploy to Vercel (recommended)

This project is a **static HTML/CSS/JS site**, so you can deploy it without a build step.

### A. Create a GitHub repo and push the project

Inside the project folder:

```bash
git init
git add .
git commit -m "Initial DAT.co dashboard"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### B. Import the repo into Vercel

In the Vercel dashboard:

1. Click **Add New Project**
2. Import your GitHub repository
3. Set **Framework Preset** to **Other**
4. Enable **Override** for **Build Command** and leave it **empty**
5. Keep **Output Directory** as `.` if Vercel asks for it
6. Click **Deploy**

After deployment, Vercel will give you a public URL like:

```text
https://your-project-name.vercel.app
```

Put that URL in your report.

---

## 4) How to refresh the live website later

If you want updated numbers later:

```bash
python3 scripts/update_data.py
git add data/indicator.json
git commit -m "Refresh DAT.co dataset"
git push
```

Vercel will redeploy automatically.

---

## 5) Data methodology

### BTC holdings

- Uses CoinGecko treasury holdings data for Strategy
- Daily series is requested with `include_empty_intervals=true`
- Holdings are effectively forward-filled between purchase disclosures

### BTC price

- Uses CoinGecko daily BTC/USD market chart data

### Diluted shares

- Uses Strategy official diluted-share snapshot dates
- Snapshots are hardcoded in `scripts/update_data.py`
- Between snapshots, the most recent official value is forward-filled

### Main assumption

This is an **estimated daily NAV/share** series because official diluted shares are only published on specific snapshot dates, not every day.

That is acceptable for a class assignment as long as you explain the assumption clearly in the report.

---

## 6) What to write in the report

Use `REPORT_TEMPLATE.md`.

Main points to include:

- Selected indicator: **BTC NAV per Diluted Share**
- Why chosen: measures BTC asset value backing each diluted share
- Relationship with BTC:
  - BTC price goes up → NAV/share usually goes up
  - BTC purchases go up → NAV/share usually goes up
  - Share dilution goes up → BTC exposure per share can go down
- Data sources and methodology
- Your deployed Vercel URL

---

## 7) How to customize later

If your instructor wants a different DAT.co company later:

- edit `ENTITY_ID` in `scripts/update_data.py`
- replace the `SHARE_SNAPSHOTS` values with that company's official share snapshots
- rerun the sync script

---

## 8) Troubleshooting

### The page says “No live dataset yet”
Run:

```bash
python3 scripts/update_data.py
```

### The sync script fails
Common causes:

- temporary CoinGecko rate limits
- network issue on WSL
- campus Wi‑Fi / VPN restrictions

Try again after a minute. If CoinGecko asks for a key on your network, you can export one before running:

```bash
export COINGECKO_API_KEY=YOUR_KEY_HERE
python3 scripts/update_data.py
```

### Vercel says it expects a build command
Set:

- Framework Preset = **Other**
- Build Command = **empty**
- Output Directory = `.`

---

## 9) Minimal submission checklist

- [ ] Run the sync script successfully
- [ ] Open the site locally and verify charts render
- [ ] Push to GitHub
- [ ] Deploy on Vercel
- [ ] Copy the URL into your report
- [ ] Submit the report
