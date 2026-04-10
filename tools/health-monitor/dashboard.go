package main

import "html/template"

var dashboardTemplate = template.Must(template.New("dashboard").Parse(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="30">
<title>BotPress AI - Health Monitor</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1117; color: #e1e4e8; padding: 2rem; }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; color: #fff; }
  .subtitle { color: #8b949e; font-size: 0.85rem; margin-bottom: 2rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.25rem; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 1.25rem; }
  .card-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; }
  .status-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
  .status-dot.healthy { background: #3fb950; box-shadow: 0 0 6px #3fb950; }
  .status-dot.unhealthy { background: #f85149; box-shadow: 0 0 6px #f85149; }
  .card-title { font-size: 1rem; font-weight: 600; color: #fff; }
  .card-url { font-size: 0.75rem; color: #8b949e; word-break: break-all; }
  .metrics { display: flex; gap: 1.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
  .metric { display: flex; flex-direction: column; }
  .metric-label { font-size: 0.7rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px; }
  .metric-value { font-size: 1.1rem; font-weight: 600; color: #fff; margin-top: 2px; }
  .metric-value.good { color: #3fb950; }
  .metric-value.warn { color: #d29922; }
  .metric-value.bad { color: #f85149; }
  .history { margin-top: 1rem; }
  .history-label { font-size: 0.7rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem; }
  .bars { display: flex; align-items: flex-end; gap: 3px; height: 40px; }
  .bar { flex: 1; min-width: 6px; max-width: 20px; background: #3fb950; border-radius: 2px 2px 0 0; transition: height 0.3s; }
  .error-msg { font-size: 0.75rem; color: #f85149; margin-top: 0.5rem; word-break: break-all; }
  .footer { margin-top: 2rem; text-align: center; color: #484f58; font-size: 0.75rem; }
</style>
</head>
<body>
<h1>BotPress AI Health Monitor</h1>
<p class="subtitle">Auto-refreshes every 30s &middot; Last check: {{if .Latest}}{{.Latest.Timestamp.Format "2006-01-02 15:04:05 MST"}}{{else}}No checks yet{{end}}</p>

<div class="grid">
{{range .Checks}}
<div class="card">
  <div class="card-header">
    <div class="status-dot {{if .Healthy}}healthy{{else}}unhealthy{{end}}"></div>
    <div>
      <div class="card-title">{{.Name}}</div>
      <div class="card-url">{{.URL}}</div>
    </div>
  </div>
  <div class="metrics">
    <div class="metric">
      <span class="metric-label">Status</span>
      <span class="metric-value {{if .Healthy}}good{{else}}bad{{end}}">{{if .Healthy}}Healthy{{else}}Down{{end}}</span>
    </div>
    <div class="metric">
      <span class="metric-label">HTTP</span>
      <span class="metric-value">{{.StatusCode}}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Response</span>
      <span class="metric-value {{if le .ResponseMs 500}}good{{else if le .ResponseMs 2000}}warn{{else}}bad{{end}}">{{.ResponseMs}}ms</span>
    </div>
    <div class="metric">
      <span class="metric-label">Uptime (24h)</span>
      <span class="metric-value {{if ge .Uptime 99.0}}good{{else if ge .Uptime 95.0}}warn{{else}}bad{{end}}">{{printf "%.1f" .Uptime}}%</span>
    </div>
  </div>
  {{if .ResponseHistory}}
  <div class="history">
    <div class="history-label">Response Time (last {{len .ResponseHistory}} checks)</div>
    <div class="bars">
    {{range .ResponseHistory}}
      <div class="bar" style="height: {{.HeightPct}}%" title="{{.Ms}}ms"></div>
    {{end}}
    </div>
  </div>
  {{end}}
  {{if .Error}}
  <div class="error-msg">{{.Error}}</div>
  {{end}}
</div>
{{end}}
</div>

<div class="footer">health-monitor v1.0 &middot; stdlib only &middot; buffer={{.BufferSize}} checks</div>
</body>
</html>
`))

// DashboardData is the top-level template context.
type DashboardData struct {
	Latest     *HistoryEntry
	Checks     []DashboardCheck
	BufferSize int
}

// DashboardCheck is the per-target template context.
type DashboardCheck struct {
	Name            string
	URL             string
	Healthy         bool
	StatusCode      int
	ResponseMs      int64
	Uptime          float64
	Error           string
	ResponseHistory []BarData
}

// BarData represents one bar in the response-time chart.
type BarData struct {
	Ms        int64
	HeightPct int
}

// BuildDashboardData assembles template data from the monitor.
func BuildDashboardData(mon *Monitor) DashboardData {
	latest := mon.GetLatest()
	data := DashboardData{
		Latest:     latest,
		BufferSize: mon.maxHist,
	}

	if latest == nil {
		return data
	}

	for _, c := range latest.Checks {
		uptime := mon.UptimePercent(c.Name)
		times := mon.ResponseTimeHistory(c.Name, 10)

		// Find max for scaling bars
		var maxMs int64 = 1
		for _, t := range times {
			if t > maxMs {
				maxMs = t
			}
		}

		bars := make([]BarData, len(times))
		for i, t := range times {
			pct := int(float64(t) / float64(maxMs) * 100)
			if pct < 5 {
				pct = 5
			}
			bars[i] = BarData{Ms: t, HeightPct: pct}
		}

		data.Checks = append(data.Checks, DashboardCheck{
			Name:            c.Name,
			URL:             c.URL,
			Healthy:         c.Healthy,
			StatusCode:      c.StatusCode,
			ResponseMs:      c.ResponseMs,
			Uptime:          uptime,
			Error:           c.Error,
			ResponseHistory: bars,
		})
	}

	return data
}
