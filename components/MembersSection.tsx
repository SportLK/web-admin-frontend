import React from "react";
import { Member } from "../types/admin";
import { Avatar } from "./Avatar";
import { StatusPill } from "./StatusPill";

export function MembersSection({
  members,
  onChangeStatus,
}: {
  members: Member[];
  onChangeStatus: (id: string | number) => void;
}) {
  return (
    <section className="panel table-panel">
      <div className="panel-head table-panel-head">
        <div>
          <div className="title-with-badge">
            <h2>All members</h2>
            <span className="mini-badge pale">12,486</span>
          </div>
          <p>Manage member profiles and account access</p>
        </div>
        <div className="table-tools">
          <button className="select-button">⌁ <span>Filters</span></button>
          <button className="outline-button small-button">＋ <span>Invite member</span></button>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>MEMBER</th>
              <th>SPORT</th>
              <th>LOCATION</th>
              <th>JOINED</th>
              <th>STATUS</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="member-cell">
                    <Avatar initials={member.initials} tone={member.tone} small />
                    <span><b>{member.name}</b><small>{member.email}</small></span>
                  </div>
                </td>
                <td><span className="sport-cell">{member.sport}</span></td>
                <td>{member.location}</td>
                <td className="muted-cell">{member.joined}</td>
                <td><StatusPill>{member.status}</StatusPill></td>
                <td className="row-action">
                  <button
                    aria-label={`Change ${member.name} account status`}
                    className="row-more"
                    onClick={() => onChangeStatus(member.id)}
                  >
                    •••
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {members.length === 0 && <div className="empty-state">No members match your search.</div>}
      <div className="table-foot">
        <span>Showing <b>{members.length}</b> of 12,486 members</span>
        <div>
          <button disabled>← Previous</button>
          <button className="current-page">1</button>
          <button>2</button>
          <button>3</button>
          <span>···</span>
          <button>42</button>
          <button>Next →</button>
        </div>
      </div>
    </section>
  );
}
