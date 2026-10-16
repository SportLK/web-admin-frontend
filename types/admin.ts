export type PageKey = "overview" | "members" | "communities" | "applications" | "reports";
export type MemberStatus = "Active" | "Review" | "Suspended";

export type Member = {
  id: string | number;
  name: string;
  email: string;
  sport: string;
  location: string;
  joined: string;
  status: MemberStatus;
  initials: string;
  tone: string;
};

export type Application = {
  id: string | number;
  name: string;
  role: "Team Manager" | "Tournament Organizer";
  organization: string;
  submitted: string;
  initials: string;
  tone: string;
};

export type ModerationPost = {
  id: string | number;
  author: string;
  community: string;
  sport: string;
  age: string;
  body: string;
  likes: number;
  comments: number;
  status: string;
};

export type ModerationReport = {
  id: string;
  subject: string;
  reason: string;
  reportedBy: string;
  ago: string;
  severity: string;
  status: string;
};
