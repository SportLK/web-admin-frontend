import React, { Dispatch, SetStateAction } from "react";
import { ModerationPost, ModerationReport } from "../types/admin";
import { adminRequest } from "../lib/api";
import { StatusPill } from "./StatusPill";

export function CommunitiesSection({
  posts,
  setPosts,
  notify,
  token,
}: {
  posts: ModerationPost[];
  setPosts: Dispatch<SetStateAction<ModerationPost[]>>;
  notify: (message: string) => void;
  token: string;
}) {
  async function togglePost(id: string | number) {
    const post = posts.find((item) => item.id === id);
    if (!post) return;
    const nextStatus = post.status === "Removed" ? "visible" : "hidden";
    if (token) {
      try {
        await adminRequest(`/community/posts/${id}/moderation`, token, {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        });
      } catch (error) {
        notify(error instanceof Error ? error.message : "Could not update this post");
        return;
      }
    }
    setPosts((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: item.status === "Removed" ? "Visible" : "Removed" } : item
      )
    );
    notify(post.status === "Removed" ? "Post restored to the community" : "Post removed from the community");
  }

  return (
    <div className="community-layout">
      <div className="community-summary-grid">
        <div className="summary-tile">
          <span className="summary-icon violet-bg">◉</span>
          <small>Total communities</small>
          <b>248</b>
          <span className="summary-note">Across 18 sports</span>
        </div>
        <div className="summary-tile">
          <span className="summary-icon green-bg">↗</span>
          <small>Active this week</small>
          <b>186</b>
          <span className="summary-note">75% of all communities</span>
        </div>
        <div className="summary-tile">
          <span className="summary-icon red-bg">⚑</span>
          <small>Flagged posts</small>
          <b>{posts.filter((post) => post.status === "Flagged").length}</b>
          <span className="summary-note">Needs a closer look</span>
        </div>
      </div>
      <div className="panel community-feed-panel">
        <div className="panel-head">
          <div>
            <h2>Recent community posts</h2>
            <p>Review reports and remove content that breaks the guidelines</p>
          </div>
          <button className="select-button">All posts <span>⌄</span></button>
        </div>
        <div className="moderation-list">
          {posts.map((post) => (
            <article className="moderation-card" key={post.id}>
              <div className="moderation-top">
                <div className="moderator-avatar">{post.author.split(" ").map((name) => name[0]).slice(0, 2).join("")}</div>
                <div className="moderator-author"><b>{post.author}</b><span>{post.community} <i>·</i> {post.age}</span></div>
                <span className="topic-chip">{post.sport}</span>
                <StatusPill>{post.status}</StatusPill>
              </div>
              <p className="moderation-body">{post.body}</p>
              <div className="moderation-foot">
                <span>♡ {post.likes} likes</span>
                <span>◌ {post.comments} comments</span>
                <span className="moderation-spacer"/>
                <button className="text-action" onClick={() => notify(`Opening ${post.community}`)}>View post ↗</button>
                <button
                  className={`moderate-button ${post.status === "Removed" ? "restore-button" : ""}`}
                  onClick={() => togglePost(post.id)}
                >
                  {post.status === "Removed" ? "Restore" : "Remove post"}
                </button>
              </div>
            </article>
          ))}
          {posts.length === 0 && <div className="empty-state">No posts match your search.</div>}
        </div>
      </div>
    </div>
  );
}

export function ReportsSection({
  reports,
  onResolve,
}: {
  reports: ModerationReport[];
  onResolve: (id: string) => void;
}) {
  return (
    <section className="panel table-panel report-panel">
      <div className="panel-head table-panel-head">
        <div>
          <div className="title-with-badge">
            <h2>All reports</h2>
            <span className="mini-badge">{reports.filter((report) => report.status === "Open").length} open</span>
          </div>
          <p>Review concerns from players and community members</p>
        </div>
        <div className="table-tools">
          <button className="select-button">All statuses <span>⌄</span></button>
          <button className="select-button">⌁ <span>Filters</span></button>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>REPORT</th>
              <th>REASON</th>
              <th>REPORTED BY</th>
              <th>RECEIVED</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>
                  <span className="report-subject">
                    <b>{report.subject}</b>
                    <small>{report.id}</small>
                  </span>
                </td>
                <td>{report.reason}</td>
                <td>{report.reportedBy}</td>
                <td className="muted-cell">{report.ago}</td>
                <td><StatusPill>{report.severity}</StatusPill></td>
                <td><StatusPill>{report.status}</StatusPill></td>
                <td className="row-action">
                  <button
                    className="resolve-button"
                    disabled={report.status === "Resolved"}
                    onClick={() => onResolve(report.id)}
                  >
                    {report.status === "Resolved" ? "Done" : "Resolve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reports.length === 0 && <div className="empty-state">No reports match your search.</div>}
      <div className="table-foot">
        <span>Showing <b>{reports.length}</b> reports</span>
        <div>
          <button disabled>← Previous</button>
          <button className="current-page">1</button>
          <button>2</button>
          <button>Next →</button>
        </div>
      </div>
    </section>
  );
}
