import React, { ReactNode } from "react";
import { Application, PageKey } from "../types/admin";
import { Avatar } from "./Avatar";

export function StatCard({ icon, label, value, change, detail, tone, quiet = false }: { icon: string; label: string; value: string; change: string; detail: string; tone: string; quiet?: boolean }) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span>{label}</span><span className={`stat-icon stat-${tone}`}>{icon}</span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot"><span className={`stat-change ${quiet ? "change-quiet" : ""}`}>{!quiet && <i>↗</i>}{change}</span><span>{detail}</span><span className="sparkline">⌁</span></div>
    </div>
  );
}

export function Activity({ initials, tone, text, time, color }: { initials: string; tone: string; text: ReactNode; time: string; color: string }) {
  return (
    <div className="activity-item">
      <Avatar initials={initials} tone={tone} small />
      <div className={`activity-dot dot-${color}`} />
      <div className="activity-copy"><p>{text}</p><span>{time}</span></div>
    </div>
  );
}

export function SportBar({ name, number, percent, color }: { name: string; number: string; percent: string; color: string }) {
  return (
    <div className="sport-bar">
      <div><span>{name}</span><b>{number}</b></div>
      <div className="bar-track"><i className={color} style={{ width: percent }} /></div>
    </div>
  );
}

export function OverviewSection({
  applications,
  onNavigate,
  onReview,
}: {
  applications: Application[];
  onNavigate: (page: PageKey) => void;
  onReview: (id: string | number, accepted: boolean) => void;
}) {
  return (
    <>
      <section className="stats-grid">
        <StatCard icon="♙" label="Total members" value="12,486" change="12.8%" detail="vs last month" tone="blue" />
        <StatCard icon="◉" label="Active communities" value="248" change="8.2%" detail="vs last month" tone="violet" />
        <StatCard icon="▤" label="Community posts" value="3,842" change="18.4%" detail="vs last month" tone="orange" />
        <StatCard icon="◷" label="Needs your review" value="18" change="6 pending" detail="role applications" tone="gold" quiet />
      </section>

      <section className="overview-grid">
        <div className="panel growth-panel">
          <div className="panel-head"><div><h2>Community growth</h2><p>Members joining the platform</p></div><button className="select-button">Last 7 days <span>⌄</span></button></div>
          <div className="chart-legend"><span><i className="legend-blue" /> New members</span><strong>+24.8% <small>vs last week</small></strong></div>
          <div className="chart-wrap">
            <div className="chart-y"><span>400</span><span>300</span><span>200</span><span>100</span><span>0</span></div>
            <div className="chart-main">
              <div className="chart-lines"><i /><i /><i /><i /><i /></div>
              <svg className="growth-chart" viewBox="0 0 720 190" preserveAspectRatio="none" role="img" aria-label="Member growth chart rising over seven days">
                <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4269d9" stopOpacity=".18" /><stop offset="100%" stopColor="#4269d9" stopOpacity="0" /></linearGradient></defs>
                <path d="M0 152 C38 144 47 131 88 137 S145 115 180 124 S232 117 270 97 S323 110 360 86 S420 99 450 68 S510 89 540 57 S602 76 628 45 S684 57 720 20 L720 190 L0 190Z" fill="url(#chart-fill)" />
                <path d="M0 152 C38 144 47 131 88 137 S145 115 180 124 S232 117 270 97 S323 110 360 86 S420 99 450 68 S510 89 540 57 S602 76 628 45 S684 57 720 20" fill="none" stroke="#4168d5" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                <circle cx="720" cy="20" r="5" fill="#4168d5" stroke="white" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="chart-x"><span>Mon, Oct 05</span><span>Tue, Oct 06</span><span>Wed, Oct 07</span><span>Thu, Oct 08</span><span>Fri, Oct 09</span><span>Sat, Oct 10</span><span>Sun, Oct 11</span></div>
            </div>
          </div>
        </div>

        <div className="panel activity-panel">
          <div className="panel-head"><div><h2>Recent activity</h2><p>What’s happening right now</p></div><button className="more-button" onClick={() => onNavigate("reports")}>•••</button></div>
          <div className="activity-list">
            <Activity initials="NP" tone="peach" text={<><b>Nethmi Perera</b> joined SportLK</>} time="2 min ago" color="blue" />
            <Activity initials="⚑" tone="flag" text={<><b>New report</b> needs attention</>} time="8 min ago" color="red" />
            <Activity initials="DR" tone="blue" text={<><b>Dilan Ranasinghe</b> applied as manager</>} time="12 min ago" color="violet" />
            <Activity initials="◉" tone="mint" text={<><b>Colombo Runners</b> hit 500 members</>} time="28 min ago" color="green" />
            <Activity initials="SP" tone="rose" text={<><b>Shenali Perera</b> applied to organize</>} time="38 min ago" color="orange" />
          </div>
          <button className="text-link" onClick={() => onNavigate("reports")}>View all activity <span>→</span></button>
        </div>
      </section>

      <section className="overview-bottom">
        <div className="panel approval-panel">
          <div className="panel-head"><div><div className="title-with-badge"><h2>Role applications</h2><span className="mini-badge">12</span></div><p>Requests waiting for your review</p></div><button className="text-link" onClick={() => onNavigate("applications")}>View all <span>→</span></button></div>
          <div className="compact-app-list">
            {applications.slice(0, 2).map((app) => (
              <div className="compact-app" key={app.id}>
                <Avatar initials={app.initials} tone={app.tone} small />
                <div className="compact-app-info"><b>{app.name}</b><span>{app.role} <i>·</i> {app.organization}</span></div>
                <span className="compact-time">{app.submitted}</span>
                <div className="compact-actions"><button className="approve-icon" aria-label="Approve" onClick={() => onReview(app.id, true)}>✓</button><button className="decline-icon" aria-label="Decline" onClick={() => onReview(app.id, false)}>×</button></div>
              </div>
            ))}
            {applications.length === 0 && <div className="empty-state">No role requests are waiting for review.</div>}
          </div>
        </div>
        <div className="panel sport-panel">
          <div className="panel-head"><div><h2>Top sports</h2><p>By member interest</p></div><button className="more-button">•••</button></div>
          <div className="sport-bars">
            <SportBar name="Cricket" number="4,280" percent="82%" color="bar-blue" />
            <SportBar name="Football" number="3,146" percent="66%" color="bar-gold" />
            <SportBar name="Badminton" number="2,470" percent="52%" color="bar-lilac" />
            <SportBar name="Volleyball" number="1,820" percent="38%" color="bar-orange" />
          </div>
        </div>
      </section>
    </>
  );
}
