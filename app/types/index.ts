export type SportType = 'CRICKET' | 'FUTSAL' | 'BADMINTON' | 'BASKETBALL' | 'TENNIS' | 'TABLE_TENNIS';

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'ABANDONED' | 'POSTPONED';

export interface VenueFacility {
  id?: string;
  venueId?: string;
  hasFloodlights: boolean;
  hasParking: boolean;
  hasChangingRooms: boolean;
  hasShowerFacilities: boolean;
  hasSpectatorSeating: boolean;
  hasCafeteria: boolean;
  hasEquipmentRental: boolean;
  hasFirstAid: boolean;
}

export interface Venue {
  id: string;
  venueName: string;
  address: string;
  city: string;
  district: string;
  province?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  contactPersonName?: string;
  contactPhone?: string;
  contactEmail?: string;
  hourlyRate: number;
  surfaceType: string;
  isActive: boolean;
  facilities?: VenueFacility;
  createdAt?: string;
  updatedAt?: string;
  matchesHosted?: number;
}

export interface CreateVenueDto {
  venueName: string;
  address: string;
  city: string;
  district: string;
  province?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  contactPersonName?: string;
  contactPhone?: string;
  contactEmail?: string;
  hourlyRate: number;
  surfaceType: string;
  isActive?: boolean;
  facilities?: Partial<VenueFacility>;
}

export interface MatchScorecard {
  id?: string;
  matchId?: string;
  homeTeamScoreDisplay: string;
  awayTeamScoreDisplay: string;
  detailedScorecardJson?: {
    overs?: string;
    clock?: string;
    currentInningsOrHalf?: string;
    currentStatus?: string;
    batsmen?: Array<{ name: string; runsOrPoints: number; ballsOrShots?: number; fours?: number; sixes?: number; strikeRate?: string; isStriker?: boolean }>;
    bowler?: { name: string; overs: string; maidens: number; runs: number; wickets: number };
    timeline?: Array<{
      id: string;
      ballOrMinute: string;
      type: string;
      badgeText: string;
      description: string;
      timeAgo: string;
    }>;
  };
  updatedAt?: string;
}

export interface Match {
  id: string;
  tournamentId?: string;
  tournament?: {
    id: string;
    tournamentName: string;
  };
  sportType: SportType;
  homeTeamId: string;
  homeTeam: {
    id: string;
    teamName: string;
    shortName?: string;
    logoUrl?: string;
  };
  awayTeamId: string;
  awayTeam: {
    id: string;
    teamName: string;
    shortName?: string;
    logoUrl?: string;
  };
  venueId?: string;
  venue?: {
    id: string;
    venueName: string;
    city: string;
  };
  scheduledStartTime: string;
  matchStatus: MatchStatus;
  winnerTeamId?: string;
  winnerTeam?: {
    id: string;
    teamName: string;
  };
  score?: MatchScorecard;
  createdAt?: string;
}

export interface CreateMatchDto {
  tournamentId?: string;
  homeTeamId: string;
  awayTeamId: string;
  venueId?: string;
  scheduledStartTime: string;
  sportType?: SportType;
}

export interface UpdateScoreDto {
  homeTeamScoreDisplay?: string;
  awayTeamScoreDisplay?: string;
  detailedScorecardJson?: Record<string, any>;
}

export interface PlatformOverviewStats {
  matches: {
    total: number;
    byStatus: {
      SCHEDULED: number;
      LIVE: number;
      COMPLETED: number;
      ABANDONED?: number;
      POSTPONED?: number;
    };
  };
  venues: {
    total: number;
    active: number;
  };
  teams: {
    activeTotal: number;
  };
  tournaments: {
    total: number;
  };
  users?: {
    total: number;
    managers: number;
    organizers: number;
  };
}

export interface SportBreakdownItem {
  sportType: string;
  totalMatches: number;
  completedMatches: number;
  liveMatches: number;
}

export interface TopVenueItem {
  id: string;
  venueName: string;
  city: string;
  district?: string;
  matchesHosted: number;
}
