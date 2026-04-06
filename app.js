const DATA_URL = `./data/indicator.json?ts=${Date.now()}`;

let dashboardData = null;
let currentRange = 365;
let indicatorChart = null;
let holdingsChart = null;
let priceChart = null;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const btcPerShareFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
});

function parseDate(value) {
  return new Date(`${value}T00:00:00Z`);
}

function percentChange(current, previous) {
  if (previous === null || previous === undefined || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

function formatPercent(value) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function changeClass(value) {
  if (value === null || Number.isNaN(value)) {
    return "change-flat";
  }
  if (value > 0) return "change-up";
  if (value < 0) return "change-down";
  return "change-flat";
}

function getSeriesForRange(series, days) {
  if (!Array.isArray(series)) return [];
  return series.slice(Math.max(0, series.length - days));
}

function lookupPastValue(series, key, daysBack) {
  if (series.length <= daysBack) return null;
  return series[series.length - daysBack - 1][key];
}

function setMeta(data) {
  document.getElementById("syncStatus").textContent = data?.metadata?.status || "Ready";
  document.getElementById("latestDate").textContent = data?.summary?.latestDate || "—";
  document.getElementById("generatedAt").textContent = data?.metadata?.generatedAtUtc || "—";
  document.getElementById("entityName").textContent = data?.metadata?.entityDisplayName || "Strategy (MSTR)";
}

function renderEmptyState(message) {
  const emptyState = document.getElementById("emptyState");
  emptyState.classList.remove("hidden");
  if (message) {
    emptyState.querySelector("p").innerHTML = message;
  }
}

function hideEmptyState() {
  document.getElementById("emptyState").classList.add("hidden");
}

function renderMetrics(fullSeries, visibleSeries) {
  const grid = document.getElementById("metricsGrid");
  const latest = visibleSeries.at(-1);

  if (!latest) {
    grid.innerHTML = "";
    return;
  }

  const nav30d = percentChange(
    fullSeries.at(-1).btcNavPerDilutedShareUsd,
    lookupPastValue(fullSeries, "btcNavPerDilutedShareUsd", 30),
  );
  const btcPrice30d = percentChange(
    fullSeries.at(-1).btcPriceUsd,
    lookupPastValue(fullSeries, "btcPriceUsd", 30),
  );
  const holdings30dPast = lookupPastValue(fullSeries, "btcHoldings", 30);
  const holdingsDelta30d = holdings30dPast === null ? null : fullSeries.at(-1).btcHoldings - holdings30dPast;

  const cards = [
    {
      label: "Latest BTC NAV / Diluted Share",
      value: currencyFormatter.format(latest.btcNavPerDilutedShareUsd),
      subtext: `30D change: ${formatPercent(nav30d)}`,
      className: changeClass(nav30d),
    },
    {
      label: "Latest BTC per Diluted Share",
      value: `${btcPerShareFormatter.format(latest.btcPerDilutedShare)} BTC`,
      subtext: `Diluted shares: ${compactNumberFormatter.format(latest.assumedDilutedShares)}`,
      className: "change-flat",
    },
    {
      label: "Latest BTC Holdings",
      value: `${compactNumberFormatter.format(latest.btcHoldings)} BTC`,
      subtext:
        holdingsDelta30d === null
          ? "30D holdings change: —"
          : `30D holdings change: ${holdingsDelta30d >= 0 ? "+" : ""}${integerFormatter.format(holdingsDelta30d)} BTC`,
      className: holdingsDelta30d !== null ? changeClass(holdingsDelta30d) : "change-flat",
    },
    {
      label: "Latest BTC Price",
      value: currencyFormatter.format(latest.btcPriceUsd),
      subtext: `30D BTC move: ${formatPercent(btcPrice30d)}`,
      className: changeClass(btcPrice30d),
    },
    {
      label: `Visible Window (${currentRange}D)`,
      value: `${visibleSeries.length} rows`,
      subtext: `${visibleSeries[0].date} → ${visibleSeries.at(-1).date}`,
      className: "change-flat",
    },
  ];

  grid.innerHTML = cards
    .map(
      (card) => `
        <article class="card metric-card">
          <span class="metric-label">${card.label}</span>
          <p class="metric-value">${card.value}</p>
          <div class="metric-subtext ${card.className}">${card.subtext}</div>
        </article>
      `,
    )
    .join("");
}

function makeLineChart(ctx, labels, data, label, color, yLabel, pointRadius = 0, tension = 0.25) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2.5,
          pointRadius,
          pointHoverRadius: 4,
          fill: false,
          tension,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            usePointStyle: true,
            boxWidth: 10,
          },
        },
        tooltip: {
          intersect: false,
          mode: "index",
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        x: {
          grid: {
            color: "rgba(148, 163, 184, 0.12)",
          },
          ticks: {
            maxTicksLimit: 8,
            color: "#475569",
          },
        },
        y: {
          grid: {
            color: "rgba(148, 163, 184, 0.12)",
          },
          ticks: {
            color: "#475569",
            callback(value) {
              if (yLabel === "usd") return compactCurrencyFormatter.format(value);
              if (yLabel === "btc") return `${compactNumberFormatter.format(value)} BTC`;
              return compactNumberFormatter.format(value);
            },
          },
        },
      },
    },
  });
}

function renderCharts(series) {
  const labels = series.map((row) => row.date);
  const navValues = series.map((row) => row.btcNavPerDilutedShareUsd);
  const holdingsValues = series.map((row) => row.btcHoldings);
  const priceValues = series.map((row) => row.btcPriceUsd);

  indicatorChart?.destroy();
  holdingsChart?.destroy();
  priceChart?.destroy();

  indicatorChart = makeLineChart(
    document.getElementById("indicatorChart"),
    labels,
    navValues,
    "BTC NAV / Diluted Share",
    "#2563eb",
    "usd",
  );

  holdingsChart = makeLineChart(
    document.getElementById("holdingsChart"),
    labels,
    holdingsValues,
    "Strategy BTC Holdings",
    "#0f9d58",
    "btc",
    0,
    0.12,
  );

  priceChart = makeLineChart(
    document.getElementById("priceChart"),
    labels,
    priceValues,
    "BTC Price (USD)",
    "#8b5cf6",
    "usd",
  );
}

function renderSummary(fullSeries) {
  const summaryNode = document.getElementById("summaryText");
  const summary = dashboardData?.summary || {};

  if (summary.autoSummary) {
    summaryNode.textContent = summary.autoSummary;
    return;
  }

  const latest = fullSeries.at(-1);
  const nav30d = percentChange(latest.btcNavPerDilutedShareUsd, lookupPastValue(fullSeries, "btcNavPerDilutedShareUsd", 30));
  const btc30d = percentChange(latest.btcPriceUsd, lookupPastValue(fullSeries, "btcPriceUsd", 30));
  const holdingsPast = lookupPastValue(fullSeries, "btcHoldings", 30);
  const holdings30d = holdingsPast === null ? null : latest.btcHoldings - holdingsPast;

  summaryNode.textContent = `Over the last 30 days, estimated BTC NAV per diluted share ${
    nav30d === null ? "was unavailable" : nav30d >= 0 ? `rose ${nav30d.toFixed(2)}%` : `fell ${Math.abs(nav30d).toFixed(2)}%`
  }. Over the same span, BTC/USD ${
    btc30d === null ? "was unavailable" : btc30d >= 0 ? `rose ${btc30d.toFixed(2)}%` : `fell ${Math.abs(btc30d).toFixed(2)}%`
  } and Strategy's holdings changed by ${
    holdings30d === null ? "an unavailable amount" : `${holdings30d >= 0 ? "+" : ""}${integerFormatter.format(holdings30d)} BTC`
  }. This means the indicator is being driven by both BTC price changes and treasury accumulation, while the diluted share count acts as a per-share divisor.`;
}

function renderShareSnapshots() {
  const target = document.getElementById("shareSnapshotTable");
  const snapshots = dashboardData?.metadata?.shareSnapshots || [];

  if (!snapshots.length) {
    target.innerHTML = "";
    return;
  }

  target.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Snapshot date</th>
            <th>Assumed diluted shares</th>
          </tr>
        </thead>
        <tbody>
          ${snapshots
            .map(
              (snapshot) => `
                <tr>
                  <td>${snapshot.date}</td>
                  <td>${integerFormatter.format(snapshot.assumedDilutedShares)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSources() {
  const target = document.getElementById("sourcesTable");
  const sources = dashboardData?.metadata?.sources || [];

  if (!sources.length) {
    target.innerHTML = "";
    return;
  }

  target.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Purpose</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          ${sources
            .map(
              (source) => `
                <tr>
                  <td>${source.name}</td>
                  <td>${source.purpose}</td>
                  <td><a href="${source.url}" target="_blank" rel="noreferrer">Open source</a></td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function updateRangeButtons() {
  document.querySelectorAll(".range-btn").forEach((button) => {
    const isActive = Number(button.dataset.days) === currentRange;
    button.classList.toggle("active", isActive);
  });
}

function renderDashboard() {
  if (!dashboardData || !dashboardData.series?.length) {
    renderEmptyState(
      `Run <code>python3 scripts/update_data.py</code> first. That command downloads the latest source data and creates <code>data/indicator.json</code> for the website.`,
    );
    return;
  }

  hideEmptyState();
  setMeta(dashboardData);
  updateRangeButtons();

  const fullSeries = dashboardData.series;
  const visibleSeries = getSeriesForRange(fullSeries, currentRange);

  renderMetrics(fullSeries, visibleSeries);
  renderCharts(visibleSeries);
  renderSummary(fullSeries);
  renderShareSnapshots();
  renderSources();
}

function bindRangeButtons() {
  document.querySelectorAll(".range-btn").forEach((button) => {
    button.addEventListener("click", () => {
      currentRange = Number(button.dataset.days);
      renderDashboard();
    });
  });
}

async function loadData() {
  const response = await fetch(DATA_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load local dataset (${response.status})`);
  }
  return response.json();
}

async function init() {
  bindRangeButtons();

  try {
    dashboardData = await loadData();
    renderDashboard();
  } catch (error) {
    console.error(error);
    renderEmptyState(
      `The website could not read <code>data/indicator.json</code>. Run <code>python3 scripts/update_data.py</code>, then refresh the page.`,
    );
  }
}

window.addEventListener("DOMContentLoaded", init);
