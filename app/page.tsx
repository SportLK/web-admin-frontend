"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { PageKey, MemberStatus, Member, Application, ModerationPost, ModerationReport } from "../types/admin";
import { adminRequest, API_URL } from "../lib/api";
import { Avatar } from "../components/Avatar";
import { OverviewSection } from "../components/OverviewSection";
import { MembersSection } from "../components/MembersSection";
import { ApplicationsSection } from "../components/ApplicationsSection";
import { CommunitiesSection, ReportsSection } from "../components/ModerationSection";

const initialMembers: Member[] = [
  { id: 1, name: "Nethmi Perera", email: "nethmi.p@email.com", sport: "Badminton", location: "Colombo", joined: "Today", status: "Active", initials: "NP", tone: "peach" },
  { id: 2, name: "Kavindu Silva", email: "kavindu.s@email.com", sport: "Cricket", location: "Galle", joined: "Today", status: "Active", initials: "KS", tone: "blue" },
  { id: 3, name: "Amaya Fernando", email: "amaya.f@email.com", sport: "Volleyball", location: "Kandy", joined: "Yesterday", status: "Review", initials: "AF", tone: "lilac" },
  { id: 4, name: "Dinuka Jayasuriya", email: "dinuka.j@email.com", sport: "Football", location: "Negombo", joined: "Yesterday", status: "Active", initials: "DJ", tone: "mint" },
  { id: 5, name: "Sahan Wijesinghe", email: "sahan.w@email.com", sport: "Athletics", location: "Matara", joined: "Oct 08, 2026", status: "Suspended", initials: "SW", tone: "sand" },
  { id: 6, name: "Hiruni De Alwis", email: "hiruni.d@email.com", sport: "Swimming", location: "Colombo", joined: "Oct 08, 2026", status: "Active", initials: "HD", tone: "rose" },
];

const initialApplications: Application[] = [
  { id: 1, name: "Dilan Ranasinghe", role: "Team Manager", organization: "Colombo Strikers", submitted: "12 min ago", initials: "DR", tone: "blue" },
  { id: 2, name: "Shenali Perera", role: "Tournament Organizer", organization: "Island Badminton League", submitted: "38 min ago", initials: "SP", tone: "peach" },
  { id: 3, name: "Tharindu Kumara", role: "Team Manager", organization: "Kandy United", submitted: "2 hours ago", initials: "TK", tone: "mint" },
];

const initialPosts: ModerationPost[] = [
  { id: 1, author: "Ravindu Jayasena", community: "Colombo Cricket Club", sport: "Cricket", age: "18 min ago", body: "Looking for two more players for a friendly match this Sunday at SSC grounds. All skill levels welcome!", likes: 24, comments: 8, status: "Visible" },
  { id: 2, author: "Sachini Fernando", community: "Sri Lanka Runners", sport: "Running", age: "42 min ago", body: "Sunrise run at Galle Face this Saturday, 6:00 AM. Come along for an easy 5K and coffee after ☀️", likes: 51, comments: 12, status: "Flagged" },
  { id: 3, author: "Nimal de Silva", community: "Weekend Football LK", sport: "Football", age: "1 hour ago", body: "Great energy at the weekend five-a-side. Thanks to everyone who made it out! ⚽", likes: 36, comments: 4, status: "Visible" },
];

const initialReports: ModerationReport[] = [
  { id: "RPT-2408", subject: "Post in Sri Lanka Runners", reason: "Harassment or bullying", reportedBy: "Anonymous member", ago: "8 min ago", severity: "High", status: "Open" },
  { id: "RPT-2407", subject: "User: kasun.m@email.com", reason: "Spam or misleading content", reportedBy: "Ishara K.", ago: "34 min ago", severity: "Medium", status: "Open" },
  { id: "RPT-2406", subject: "Post in Colombo Cricket Club", reason: "Inappropriate content", reportedBy: "Anonymous member", ago: "1 hour ago", severity: "Low", status: "Reviewing" },
  { id: "RPT-2405", subject: "Community: Pick-up Football Kandy", reason: "Community guidelines", reportedBy: "Sanjeewa P.", ago: "3 hours ago", severity: "Medium", status: "Open" },
];

const navigation: { key: PageKey; label: string; icon: string; count?: string }[] = [
  { key: "overview", label: "Overview", icon: "⌂" },
  { key: "members", label: "Members", icon: "♙" },
  { key: "communities", label: "Communities", icon: "◉" },
  { key: "applications", label: "Role approvals", icon: "▣", count: "12" },
  { key: "reports", label: "Reports", icon: "⚑", count: "6" },
];

const titles: Record<PageKey, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: "SUNDAY, OCTOBER 11, 2026", title: "Good morning, Admin", description: "Here’s what’s happening across your sports community." },
  members: { eyebrow: "PEOPLE & ACCESS", title: "Member management", description: "Keep the SportLK community safe, active, and growing." },
  communities: { eyebrow: "COMMUNITY HEALTH", title: "Community moderation", description: "Review conversations and keep every space welcoming." },
  applications: { eyebrow: "GROW THE COMMUNITY", title: "Role applications", description: "Review requests from future team managers and tournament organizers." },
  reports: { eyebrow: "SAFETY & TRUST", title: "Member reports", description: "Triage reports submitted by the community." },
};

export default function Home() {
  const [page, setPage] = useState<PageKey>("overview");
  const [members, setMembers] = useState(initialMembers);
  const [applications, setApplications] = useState(initialApplications);
  const [posts, setPosts] = useState(initialPosts);
  const [reports, setReports] = useState(initialReports);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [adminName, setAdminName] = useState("Alex Dissanayake");
  const [adminEmail, setAdminEmail] = useState("admin@sportlk.lk");
  const [signInOpen, setSignInOpen] = useState(false);

  const filteredMembers = useMemo(() => members.filter((member) =>
    `${member.name} ${member.email} ${member.sport} ${member.location}`.toLowerCase().includes(query.toLowerCase())), [members, query]);
  const filteredPosts = useMemo(() => posts.filter((post) =>
    `${post.author} ${post.community} ${post.sport} ${post.body}`.toLowerCase().includes(query.toLowerCase())), [posts, query]);
  const filteredReports = useMemo(() => reports.filter((report) =>
    `${report.id} ${report.subject} ${report.reason}`.toLowerCase().includes(query.toLowerCase())), [reports, query]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      adminRequest<Array<{ id: string; displayName: string; email: string; sports: string[]; city?: string; status: string; createdAt: string }>>("/users", accessToken),
      adminRequest<Array<{ id: string; userId: string; requestedRole: string; organization: string; status: string; createdAt: string }>>("/role-applications/pending", accessToken),
      adminRequest<Array<{ id: string; authorId: string; communityId?: string; sport?: string; body: string; likesCount: number; commentsCount: number; status: string; createdAt: string }>>("/community/posts", accessToken),
      adminRequest<Array<{ id: string; reporterId: string; targetType: string; targetId: string; reason: string; status: string; createdAt: string }>>("/reports", accessToken),
      adminRequest<Array<{ id: string; name: string }>>("/communities", accessToken),
    ]).then(([apiUsers, apiApplications, apiPosts, apiReports, apiCommunities]) => {
      const userById = new Map(apiUsers.map((user) => [user.id, user]));
      setMembers(apiUsers.map((user, index): Member => ({
        id: user.id,
        name: user.displayName,
        email: user.email,
        sport: user.sports?.[0] ?? "Not set",
        location: user.city ?? "—",
        joined: new Date(user.createdAt).toLocaleDateString(),
        status: user.status === "active" ? "Active" : user.status === "disabled" ? "Suspended" : "Suspended",
        initials: user.displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
        tone: ["blue", "peach", "mint", "lilac", "sand", "rose"][index % 6],
      })));
      setApplications(apiApplications.map((application, index): Application => {
        const applicant = userById.get(application.userId);
        return {
          id: application.id,
          name: applicant?.displayName ?? "SportLK member",
          role: application.requestedRole === "team_manager" ? "Team Manager" : "Tournament Organizer",
          organization: application.organization,
          submitted: "Recently",
          initials: applicant?.displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() ?? "SL",
          tone: ["blue", "peach", "mint"][index % 3],
        };
      }));
      const communityById = new Map(apiCommunities.map((community) => [community.id, community.name]));
      setPosts(apiPosts.map((post, index): ModerationPost => ({
        id: post.id,
        author: userById.get(post.authorId)?.displayName ?? "SportLK member",
        community: (post.communityId && communityById.get(post.communityId)) ?? `${post.sport ?? "Sports"} Community`,
        sport: post.sport ?? "Community",
        age: "Recently",
        body: post.body,
        likes: post.likesCount,
        comments: post.commentsCount,
        status: post.status === "hidden" ? "Removed" : "Visible",
      })));
      setReports(apiReports.map((report): ModerationReport => ({
        id: report.id,
        subject: `${report.targetType[0]?.toUpperCase()}${report.targetType.slice(1)} · ${report.targetId.slice(0, 8)}`,
        reason: report.reason,
        reportedBy: userById.get(report.reporterId)?.displayName ?? "SportLK member",
        ago: "Recently",
        severity: "Medium",
        status: report.status === "reviewing" ? "Reviewing" : report.status === "resolved" ? "Resolved" : report.status === "dismissed" ? "Dismissed" : "Open",
      })));
      notify("Live SportLK data loaded");
    }).catch((error: unknown) => {
      setAccessToken("");
      setToast(error instanceof Error ? `Admin session: ${error.message}` : "Admin session expired. Please sign in again.");
    });
  }, [accessToken]);

  useEffect(() => {
    if (!refreshToken) return;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error("Your admin session expired. Please sign in again.");
        setAccessToken(body.accessToken);
        setRefreshToken(body.refreshToken);
      } catch {
        setAccessToken("");
        setRefreshToken("");
        setToast("Your admin session expired. Please sign in again.");
      }
    }, 14 * 60 * 1000);
    return () => window.clearTimeout(timer);
  }, [accessToken, refreshToken]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function reviewApplication(id: string | number, accepted: boolean) {
    const selected = applications.find((application) => application.id === id);
    if (accessToken) {
      try {
        await adminRequest(`/role-applications/${id}/review`, accessToken, {
          method: "PATCH",
          body: JSON.stringify({ status: accepted ? "approved" : "rejected" }),
        });
      } catch (error) {
        notify(error instanceof Error ? error.message : "Could not review this application");
        return;
      }
    }
    setApplications((items) => items.filter((application) => application.id !== id));
    if (selected) notify(`${selected.role} request ${accepted ? "approved" : "declined"}`);
  }

  async function changeMemberStatus(id: string | number) {
    const member = members.find((item) => item.id === id);
    if (!member) return;
    const status: MemberStatus = member.status === "Suspended" ? "Active" : "Suspended";
    if (accessToken) {
      try {
        await adminRequest(`/users/${id}/status`, accessToken, {
          method: "PATCH",
          body: JSON.stringify({ status: status === "Active" ? "active" : "suspended" }),
        });
      } catch (error) {
        notify(error instanceof Error ? error.message : "Could not update this account");
        return;
      }
    }
    setMembers((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    notify(`${member.name} is now ${status.toLowerCase()}`);
  }

  async function resolveReport(id: string) {
    if (accessToken) {
      try {
        await adminRequest(`/reports/${id}`, accessToken, { method: "PATCH", body: JSON.stringify({ status: "resolved" }) });
      } catch (error) {
        notify(error instanceof Error ? error.message : "Could not update this report");
        return;
      }
    }
    setReports((items) => items.map((report) => report.id === id ? { ...report, status: "Resolved" } : report));
    notify(`${id} marked as resolved`);
  }

  function signOut() {
    if (accessToken) adminRequest("/auth/logout", accessToken, { method: "POST" }).catch(() => undefined);
    setAccessToken("");
    setRefreshToken("");
    setMembers(initialMembers);
    setApplications(initialApplications);
    setPosts(initialPosts);
    setReports(initialReports);
    notify("Signed out of the admin session");
  }

  const heading = titles[page];

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setPage("overview")}>
          <span className="brand-mark"><span> S<span className="brand-gold">.</span></span></span>
          <span className="brand-name">sport<span>lk</span><small>ADMIN CONSOLE</small></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-icon">SL</span>
          <span><b>SportLK</b><small>Platform workspace</small></span>
          <span className="switch-caret">⌄</span>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Admin navigation">
          {navigation.map((item) => (
            <button key={item.key} className={`nav-item ${page === item.key ? "nav-active" : ""}`} onClick={() => { setPage(item.key); setQuery(""); }}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
              {item.count && <span className={`nav-count ${item.key === page ? "nav-count-active" : ""}`}>{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="help-card"><span className="help-spark">✳</span><b>Need a hand?</b><p>Visit the admin guide for a quick walkthrough.</p><button onClick={() => notify("The admin guide is coming soon")}>Open help centre <span>↗</span></button></div>
          <button className="admin-account" onClick={() => accessToken ? signOut() : setSignInOpen(true)}>
            <Avatar initials={adminName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()} tone="gold" small />
            <span><b>{adminName}</b><small>{accessToken ? "Platform admin · Sign out" : "Preview · Admin sign in"}</small></span>
            <span className="account-dots">···</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>SportLK</span><b>/</b><strong>{navigation.find((item) => item.key === page)?.label}</strong></div>
          <div className="top-actions">
            <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything..." /><kbd>⌘ K</kbd></label>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => { setPage("reports"); setQuery(""); }}><span>♧</span><i /></button>
            <span className="top-divider" />
            <button className="top-profile" onClick={() => accessToken ? signOut() : setSignInOpen(true)}><Avatar initials={adminName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()} tone="gold" small /><span><b>{adminName}</b><small>{accessToken ? adminEmail : "Preview mode"}</small></span><span className="switch-caret">⌄</span></button>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" />{heading.eyebrow}</div><h1>{heading.title}</h1><p>{heading.description}</p></div>
            <div className="heading-actions">{!accessToken && <span className="demo-indicator">SAMPLE DATA</span>}<span className="live-indicator"><i /> {accessToken ? "Connected to SportLK" : "All systems normal"}</span><button className="outline-button" onClick={() => accessToken ? signOut() : setSignInOpen(true)}>{accessToken ? "Sign out" : "♙ Admin sign in"}</button><button className="outline-button export-button" onClick={() => notify("Your latest dashboard report is ready to export")}>↧ <span>Export report</span></button></div>
          </section>

          {page === "overview" && <OverviewSection applications={applications} onNavigate={setPage} onReview={reviewApplication} />}
          {page === "members" && <MembersSection members={filteredMembers} onChangeStatus={changeMemberStatus} />}
          {page === "communities" && <CommunitiesSection posts={filteredPosts} setPosts={setPosts} notify={notify} token={accessToken} />}
          {page === "applications" && <ApplicationsSection applications={applications} onReview={reviewApplication} />}
          {page === "reports" && <ReportsSection reports={filteredReports} onResolve={resolveReport} />}

          <footer className="page-footer"><span>© 2026 SportLK</span><span>Built for the love of sport <b>✦</b></span><a href="#support" onClick={(event) => { event.preventDefault(); notify("Support: support@sportlk.lk"); }}>Help & support</a></footer>
        </div>
      </main>
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
      {signInOpen && <AdminSignIn onClose={() => setSignInOpen(false)} onSuccess={(token, refresh, name, email) => { setAccessToken(token); setRefreshToken(refresh); setAdminName(name); setAdminEmail(email); setSignInOpen(false); }} />}
    </div>
  );
}

function AdminSignIn({ onClose, onSuccess }: { onClose: () => void; onSuccess: (token: string, refreshToken: string, name: string, email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body.message === "string" ? body.message : "Could not sign in.");
      if (!body.user?.roles?.includes("admin")) throw new Error("This account does not have admin access.");
      onSuccess(body.accessToken, body.refreshToken, body.user.displayName, body.user.email);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="auth-card" onSubmit={signIn}>
        <button className="auth-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        <div className="auth-card-mark">S<span>.</span></div>
        <div className="auth-card-eyebrow">SPORTLK ADMIN CONSOLE</div>
        <h2>Sign in to your workspace</h2>
        <p>Use an administrator account to load and manage live SportLK data.</p>
        <label>Email address<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="admin@sportlk.lk" /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Your password" /></label>
        {error && <div className="auth-error">{error}</div>}
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in securely  →"}</button>
        <div className="auth-footnote">Admin access is managed through SportLK roles.</div>
      </form>
    </div>
  );
}
