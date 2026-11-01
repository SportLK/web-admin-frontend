import React from "react";
import { Application } from "../types/admin";
import { Avatar } from "./Avatar";

export function ApplicationsSection({
  applications,
  onReview,
}: {
  applications: Application[];
  onReview: (id: string | number, accepted: boolean) => void;
}) {
  return (
    <section className="panel application-panel">
      <div className="panel-head table-panel-head">
        <div>
          <div className="title-with-badge">
            <h2>Waiting for review</h2>
            <span className="mini-badge">{applications.length}</span>
          </div>
          <p>Check the applicant’s experience before assigning a new workspace.</p>
        </div>
        <button className="select-button">All requests <span>⌄</span></button>
      </div>
      <div className="application-list">
        {applications.map((application) => (
          <article className="application-card" key={application.id}>
            <div className="application-person">
              <Avatar initials={application.initials} tone={application.tone} />
              <div><b>{application.name}</b><span>{application.organization}</span></div>
            </div>
            <div className="application-role">
              <small>REQUESTED ROLE</small>
              <span className={`role-tag ${application.role === "Tournament Organizer" ? "role-organizer" : "role-manager"}`}>
                {application.role === "Team Manager" ? "♧" : "▦"} {application.role}
              </span>
            </div>
            <div className="application-date">
              <small>SUBMITTED</small>
              <span>{application.submitted}</span>
            </div>
            <div className="application-buttons">
              <button className="decline-button" onClick={() => onReview(application.id, false)}>Decline</button>
              <button className="approve-button" onClick={() => onReview(application.id, true)}>Approve request <span>→</span></button>
            </div>
          </article>
        ))}
        {applications.length === 0 && <div className="empty-state">You’re all caught up. New applications will show here.</div>}
      </div>
      <div className="application-note">
        <span>ⓘ</span>
        <p>Approving grants the requested workspace role. Team and tournament tools are managed by their own platform modules.</p>
      </div>
    </section>
  );
}
