export type SportType = 'CRICKET' | 'FUTSAL' | 'BADMINTON' | 'BASKETBALL';

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'ABANDONED' | 'POSTPONED';

export interface VenueFacility {
  id?: string;
  venueId?: string;
  sportType: SportType;
  courtOrPitchCount: number;
  hasFloodlights: boolean;
  hasParking: boolean;
  hasChangingRooms: boolean;
}

export interface Venue {
  id: string;
  venueName: string;
  addressLine: string;
  city: string;
  district?: string;
  province?: string;
  contactPhone?: string;
  hourlyBaseRate: number;
  isActive: boolean | number;
  latitude: number;
  longitude: number;
  createdAt?: string;
  facilities?: VenueFacility[];
}

export interface CreateVenueDto {
  venueName: string;
  addressLine: string;
  city: string;
  district?: string;
  province?: string;
  contactPhone?: string;
  latitude: number;
  longitude: number;
  hourlyBaseRate?: number;
  facilities?: Array<{
    sportType: SportType;
    courtOrPitchCount?: number;
    hasFloodlights?: boolean;
    hasParking?: boolean;
    hasChangingRooms?: boolean;
  }>;
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
