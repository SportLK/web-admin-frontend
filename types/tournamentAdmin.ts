export type SportType = 'CRICKET' | 'FOOTBALL' | 'BADMINTON' | 'BASKETBALL' | 'VOLLEYBALL';

export type TournamentFormat = 'KNOCKOUT_SINGLE' | 'ROUND_ROBIN' | 'GROUP_AND_KNOCKOUT';

export type TournamentStatus =
  | 'DRAFT'
  | 'OPEN_FOR_REGISTRATION'
  | 'REGISTRATION_CLOSED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export type TournamentReportReason =
  | 'UNSPORTSMANLIKE_CONDUCT'
  | 'RULE_VIOLATION'
  | 'VENUE_FACILITY_ISSUE'
  | 'SCHEDULE_MISMATCH'
  | 'FRAUD_OR_MISCONDUCT'
  | 'OTHER';

export type TournamentReportStatus =
  | 'PENDING'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'DISMISSED';

export interface AdminTournament {
  id: string;
  tournamentName: string;
  sportType: SportType;
  tournamentFormat: TournamentFormat;
  tournamentStatus: TournamentStatus;
  organizerId: string;
  organizer?: {
    id: string;
    fullName?: string;
    displayName?: string;
    email: string;
  };
  venueId?: string | null;
  venue?: {
    id: string;
    venueName: string;
    city: string;
    hourlyBaseRate?: number;
  } | null;
  city?: string | null;
  minParticipatingTeams: number;
  maxParticipatingTeams: number;
  confirmedTeamsCount?: number;
  registrationFee: number;
  prizePool?: string | null;
  startDate: string;
  endDate: string;
  registrationDeadline?: string | null;
  description?: string | null;
  rules?: string | null;
  createdAt: string;
}

export interface AdminTournamentReport {
  id: string;
  reportNumber: string;
  tournamentId: string;
  tournament?: {
    id: string;
    tournamentName: string;
    sportType: SportType;
  };
  reporterId: string;
  reporter?: {
    id: string;
    fullName?: string;
    displayName?: string;
    email: string;
  };
  reason: TournamentReportReason;
  description: string;
  status: TournamentReportStatus;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  adminResolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface AdminOrganizerApplication {
  id: string;
  userId: string;
  user?: {
    id: string;
    fullName?: string;
    displayName?: string;
    email: string;
    city?: string;
  };
  requestedRole: 'organizer' | 'TOURNAMENT_ORGANIZER';
  organization: string;
  experience: string;
  sports?: string[];
  city?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string | null;
  createdAt: string;
  updatedAt?: string;
}

