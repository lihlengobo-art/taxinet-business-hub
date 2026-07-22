// Builds a branded, print-optimized HTML document for the clicks report and
// opens it in a new window so the user can save it as a PDF. Kept framework-free
// so the PDF layout is fully controlled and independent of the app's screen CSS.

import { userTypeLabel } from '@/lib/user-types'

type ByUserType = { userType: string; clicks: number; sessions: number }
type ByTypeTarget = { userType: string; target: string; clicks: number }

export type ClickReportData = {
  byUserType: ByUserType[]
  byTypeTarget: ByTypeTarget[]
  totalClicks: number
}

const BRAND = '#013b8c'
const INK = '#1a1a1a'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-ZA').format(n || 0)
}

function pct(part: number, total: number): string {
  if (!total) return '0%'
  return `${Math.round((part / total) * 1000) / 10}%`
}

export function generateClickReport(opts: {
  data: ClickReportData
  range: { from: string; to: string }
  logoUrl: string
  rankName: string
}) {
  const { data, range, logoUrl, rankName } = opts
  const generatedAt = new Date().toLocaleString('en-ZA', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  // Ensure passenger and vendor always appear even with zero clicks, and keep a
  // stable, meaningful order for the four rank audiences.
  const order = ['passenger', 'vendor', 'driver', 'marshal']
  const map = new Map(data.byUserType.map((r) => [r.userType, r]))
  const rows: ByUserType[] = [
    ...order
      .filter((t) => map.has(t) || t === 'passenger' || t === 'vendor')
      .map((t) => map.get(t) ?? { userType: t, clicks: 0, sessions: 0 }),
    ...data.byUserType.filter((r) => !order.includes(r.userType)),
  ]

  const summaryRows = rows
    .map(
      (r) => `
        <tr>
          <td class="flow">
            <span class="dot ${r.userType === 'vendor' ? 'dot-vendor' : r.userType === 'passenger' ? 'dot-pass' : 'dot-other'}"></span>
            ${escapeHtml(userTypeLabel(r.userType))}
          </td>
          <td class="num">${fmt(r.clicks)}</td>
          <td class="num">${fmt(r.sessions)}</td>
          <td class="num">${pct(r.clicks, data.totalClicks)}</td>
        </tr>`,
    )
    .join('')

  // Per-flow top targets (limit 6 each) — focus on passenger and vendor first.
  function flowSection(userType: string): string {
    const items = data.byTypeTarget
      .filter((r) => r.userType === userType)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 6)
    const label = userTypeLabel(userType)
    const total = items.reduce((s, r) => s + r.clicks, 0)
    const body =
      items.length === 0
        ? `<tr><td colspan="2" class="empty">No clicks recorded for ${escapeHtml(label)} in this period.</td></tr>`
        : items
            .map(
              (r) => `
              <tr>
                <td>${escapeHtml(r.target)}</td>
                <td class="num">${fmt(r.clicks)}</td>
              </tr>`,
            )
            .join('')
    return `
      <div class="flow-block">
        <div class="flow-head">
          <h3>${escapeHtml(label)} flow</h3>
          <span class="flow-total">${fmt(total)} clicks</span>
        </div>
        <table class="detail">
          <thead><tr><th>Content / offer</th><th class="num">Clicks</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>`
  }

  const passengerTotal =
    rows.find((r) => r.userType === 'passenger')?.clicks ?? 0
  const vendorTotal = rows.find((r) => r.userType === 'vendor')?.clicks ?? 0

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Taxinet Connect — Clicks Report</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: ${INK};
    margin: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .sheet { max-width: 720px; margin: 0 auto; padding: 32px 8px; }
  header {
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 3px solid ${BRAND}; padding-bottom: 16px; margin-bottom: 24px;
  }
  header img { height: 56px; width: auto; object-fit: contain; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 20px; margin: 0; color: ${BRAND}; }
  .doc-title p { margin: 2px 0 0; font-size: 12px; color: #555; }
  .meta { display: flex; gap: 24px; font-size: 12px; color: #555; margin-bottom: 24px; }
  .meta strong { color: ${INK}; display: block; font-size: 13px; }
  .cards { display: flex; gap: 12px; margin-bottom: 28px; }
  .card {
    flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px;
  }
  .card.brand { background: ${BRAND}; border-color: ${BRAND}; }
  .card.brand .v, .card.brand .l { color: #fff; }
  .card .l { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; margin-bottom: 6px; }
  .card .v { font-size: 24px; font-weight: 700; color: ${BRAND}; }
  h2 { font-size: 14px; color: ${BRAND}; margin: 0 0 10px; text-transform: uppercase; letter-spacing: .03em; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th {
    text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .03em;
    color: #6b7280; border-bottom: 2px solid #e5e7eb; padding: 8px 10px;
  }
  tbody td { padding: 9px 10px; border-bottom: 1px solid #f0f0f0; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .summary tbody tr:last-child td { border-bottom: 2px solid #e5e7eb; }
  .flow { font-weight: 600; }
  .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
  .dot-vendor { background: ${BRAND}; }
  .dot-pass { background: #3b82f6; }
  .dot-other { background: #9ca3af; }
  .detail-wrap { margin-top: 28px; }
  .flow-block { margin-bottom: 20px; page-break-inside: avoid; }
  .flow-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px; }
  .flow-head h3 { font-size: 13px; margin: 0; color: ${INK}; }
  .flow-total { font-size: 12px; color: ${BRAND}; font-weight: 700; }
  .empty { color: #9ca3af; font-style: italic; }
  footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>
  <div class="sheet">
    <header>
      <img src="${logoUrl}" alt="Taxinet Connect" />
      <div class="doc-title">
        <h1>Clicks &amp; Engagement Report</h1>
        <p>${escapeHtml(rankName)}</p>
      </div>
    </header>

    <div class="meta">
      <div><strong>Reporting period</strong>${range.from} &nbsp;to&nbsp; ${range.to}</div>
      <div><strong>Generated</strong>${generatedAt}</div>
    </div>

    <div class="cards">
      <div class="card brand">
        <div class="l">Total clicks</div>
        <div class="v">${fmt(data.totalClicks)}</div>
      </div>
      <div class="card">
        <div class="l">Passenger clicks</div>
        <div class="v">${fmt(passengerTotal)}</div>
      </div>
      <div class="card">
        <div class="l">Vendor clicks</div>
        <div class="v">${fmt(vendorTotal)}</div>
      </div>
    </div>

    <h2>Clicks by audience flow</h2>
    <table class="summary">
      <thead>
        <tr>
          <th>Audience flow</th>
          <th class="num">Clicks</th>
          <th class="num">Active users</th>
          <th class="num">Share</th>
        </tr>
      </thead>
      <tbody>${summaryRows}</tbody>
    </table>

    <div class="detail-wrap">
      <h2>Breakdown by flow</h2>
      ${flowSection('passenger')}
      ${flowSection('vendor')}
      ${flowSection('driver')}
      ${flowSection('marshal')}
    </div>

    <footer>
      Generated by Taxinet Connect Business Hub · ${escapeHtml(rankName)} · This report is confidential.
    </footer>
  </div>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.focus(); window.print(); }, 300);
    });
  </script>
</body>
</html>`

  const w = window.open('', '_blank')
  if (!w) {
    alert('Please allow pop-ups to download the report.')
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
}
