export interface SquadMember {
  id: string;
  fullName: string;
  role: 'Captain' | 'Vice-Captain' | 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper' | 'Squad Player';
  jerseyNumber?: number;
  email: string;
  phoneNumber: string;
  joinedDate: string;
  status: 'Active' | 'Inactive';
}

export interface Team {
  id: string;
  name: string;
  location: string;
  sport: 'Futsal' | 'Cricket' | 'Badminton' | 'Basketball';
  manager: {
    id: string;
    name: string;
    email: string;
    phone: string;
    joinedDate: string;
  };
  membersCount: number;
  matchesPlayed: number;
  winsCount: number;
  status: 'Active' | 'Suspended' | 'Inactive';
  bio: string;
  initials: string;
  createdAt: string;
  suspensionDetails?: {
    suspendedAt: string;
    suspendedBy: string;
    reason: string;
    duration: string;
    notes?: string;
  };
  squad: SquadMember[];
}

export interface TeamReport {
  id: string;
  reportNumber: string;
  teamId: string;
  teamName: string;
  reportedBy: string;
  reporterRole: string;
  reason: 'Misleading information' | 'Roster eligibility dispute' | 'Unsportsmanlike conduct' | 'Inactive / Forfeit' | 'Harassment';
  details: string;
  receivedDate: string;
  status: 'Open' | 'In Review' | 'Resolved' | 'Dismissed';
  severity: 'Low' | 'Medium' | 'High';
  resolutionNotes?: string;
}

export const INITIAL_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Colombo Strikers',
    location: 'Colombo',
    sport: 'Futsal',
    manager: {
      id: 'usr-1',
      name: 'Dasun Praveena',
      email: 'manager@sportlk.com',
      phone: '+94 77 123 4567',
      joinedDate: 'Jan 2026',
    },
    membersCount: 12,
    matchesPlayed: 18,
    winsCount: 12,
    status: 'Active',
    bio: 'A Colombo-based squad united by a love for futsal. Training every Sunday at Colombo Sports Arena.',
    initials: 'CS',
    createdAt: '12 Jan 2026',
    squad: [
      {
        id: 'm-1',
        fullName: 'Dasun Praveena',
        role: 'Captain',
        jerseyNumber: 7,
        email: 'manager@sportlk.com',
        phoneNumber: '+94 77 123 4567',
        joinedDate: 'Jan 2026',
        status: 'Active',
      },
      {
        id: 'm-2',
        fullName: 'Kavindu Perera',
        role: 'Forward',
        jerseyNumber: 10,
        email: 'kavindu@sportlk.com',
        phoneNumber: '+94 77 234 5678',
        joinedDate: 'Feb 2026',
        status: 'Active',
      },
      {
        id: 'm-3',
        fullName: 'Chamath Silva',
        role: 'Goalkeeper',
        jerseyNumber: 1,
        email: 'chamath@sportlk.com',
        phoneNumber: '+94 71 345 6789',
        joinedDate: 'Feb 2026',
        status: 'Active',
      },
      {
        id: 'm-4',
        fullName: 'Malith Bandara',
        role: 'Vice-Captain',
        jerseyNumber: 8,
        email: 'malith@sportlk.com',
        phoneNumber: '+94 76 456 7890',
        joinedDate: 'Mar 2026',
        status: 'Active',
      },
      {
        id: 'm-5',
        fullName: 'Ravindu Fernando',
        role: 'Defender',
        jerseyNumber: 4,
        email: 'ravindu@sportlk.com',
        phoneNumber: '+94 70 567 8901',
        joinedDate: 'Apr 2026',
        status: 'Active',
      },
      {
        id: 'm-6',
        fullName: 'Sahan Wickramasinghe',
        role: 'Midfielder',
        jerseyNumber: 6,
        email: 'sahan@sportlk.com',
        phoneNumber: '+94 71 987 6543',
        joinedDate: 'May 2026',
        status: 'Active',
      },
      {
        id: 'm-7',
        fullName: 'Dilshan Fernando',
        role: 'Forward',
        jerseyNumber: 11,
        email: 'dilshan@sportlk.com',
        phoneNumber: '+94 72 678 9012',
        joinedDate: 'Jun 2026',
        status: 'Active',
      },
    ],
  },
  {
    id: '2',
    name: 'Kandy United',
    location: 'Kandy',
    sport: 'Futsal',
    manager: {
      id: 'usr-2',
      name: 'Kavindu Silva',
      email: 'kavindu.s@sportlk.com',
      phone: '+94 71 888 9911',
      joinedDate: 'Feb 2026',
    },
    membersCount: 15,
    matchesPlayed: 14,
    winsCount: 9,
    status: 'Active',
    bio: 'Central Province futsal champions 2025. Competing in the National Futsal League.',
    initials: 'KU',
    createdAt: '15 Feb 2026',
    squad: [
      {
        id: 'm-8',
        fullName: 'Kavindu Silva',
        role: 'Captain',
        jerseyNumber: 9,
        email: 'kavindu.s@sportlk.com',
        phoneNumber: '+94 71 888 9911',
        joinedDate: 'Feb 2026',
        status: 'Active',
      },
      {
        id: 'm-9',
        fullName: 'Nuwan Pradeep',
        role: 'Defender',
        jerseyNumber: 5,
        email: 'nuwan.p@sportlk.com',
        phoneNumber: '+94 77 999 1122',
        joinedDate: 'Feb 2026',
        status: 'Active',
      },
      {
        id: 'm-10',
        fullName: 'Ashen Bandara',
        role: 'Midfielder',
        jerseyNumber: 14,
        email: 'ashen.b@sportlk.com',
        phoneNumber: '+94 78 123 9988',
        joinedDate: 'Mar 2026',
        status: 'Active',
      },
    ],
  },
  {
    id: '3',
    name: 'Galle Warriors',
    location: 'Galle',
    sport: 'Futsal',
    manager: {
      id: 'usr-3',
      name: 'Nimal Jayasinghe',
      email: 'nimal.j@sportlk.com',
      phone: '+94 77 444 3322',
      joinedDate: 'Feb 2026',
    },
    membersCount: 14,
    matchesPlayed: 12,
    winsCount: 8,
    status: 'Active',
    bio: 'Southern coastal squad with premier tournament honors at Galle Indoor Complex.',
    initials: 'GW',
    createdAt: '22 Feb 2026',
    squad: [
      {
        id: 'm-11',
        fullName: 'Nimal Jayasinghe',
        role: 'Captain',
        jerseyNumber: 10,
        email: 'nimal.j@sportlk.com',
        phoneNumber: '+94 77 444 3322',
        joinedDate: 'Feb 2026',
        status: 'Active',
      },
      {
        id: 'm-12',
        fullName: 'Lahiru Kumara',
        role: 'Forward',
        jerseyNumber: 17,
        email: 'lahiru.k@sportlk.com',
        phoneNumber: '+94 76 555 4433',
        joinedDate: 'Mar 2026',
        status: 'Active',
      },
    ],
  },
  {
    id: '4',
    name: 'Negombo FC',
    location: 'Negombo',
    sport: 'Futsal',
    manager: {
      id: 'usr-4',
      name: 'Sahan Perera',
      email: 'sahan.p@sportlk.com',
      phone: '+94 70 222 1100',
      joinedDate: 'Mar 2026',
    },
    membersCount: 11,
    matchesPlayed: 10,
    winsCount: 5,
    status: 'Active',
    bio: 'Western coastal champions specializing in fast-paced 5-a-side indoor competitions.',
    initials: 'NF',
    createdAt: '01 Mar 2026',
    squad: [
      {
        id: 'm-13',
        fullName: 'Sahan Perera',
        role: 'Captain',
        jerseyNumber: 8,
        email: 'sahan.p@sportlk.com',
        phoneNumber: '+94 70 222 1100',
        joinedDate: 'Mar 2026',
        status: 'Active',
      },
    ],
  },
  {
    id: '5',
    name: 'Colombo Kings',
    location: 'Colombo',
    sport: 'Cricket',
    manager: {
      id: 'usr-5',
      name: 'Mahesh Theekshana',
      email: 'mahesh.t@sportlk.com',
      phone: '+94 77 555 6677',
      joinedDate: 'Jan 2026',
    },
    membersCount: 16,
    matchesPlayed: 20,
    winsCount: 15,
    status: 'Active',
    bio: 'Premier club division weekend 10-overs cricket team playing across Colombo venues.',
    initials: 'CK',
    createdAt: '05 Jan 2026',
    squad: [
      {
        id: 'm-14',
        fullName: 'Mahesh Theekshana',
        role: 'Captain',
        jerseyNumber: 99,
        email: 'mahesh.t@sportlk.com',
        phoneNumber: '+94 77 555 6677',
        joinedDate: 'Jan 2026',
        status: 'Active',
      },
    ],
  },
  {
    id: '6',
    name: 'Moratuwa Ballers',
    location: 'Moratuwa',
    sport: 'Futsal',
    manager: {
      id: 'usr-6',
      name: 'Tharindu Fernando',
      email: 'tharindu.f@sportlk.com',
      phone: '+94 71 333 8877',
      joinedDate: 'Feb 2026',
    },
    membersCount: 9,
    matchesPlayed: 8,
    winsCount: 2,
    status: 'Suspended',
    bio: 'Suburban futsal squad currently under administrative disciplinary review.',
    initials: 'MB',
    createdAt: '18 Feb 2026',
    suspensionDetails: {
      suspendedAt: '05 Oct 2026',
      suspendedBy: 'SportLK Admin',
      reason: 'Misleading information / Ineligible roster participant',
      duration: '30 Days',
      notes: 'Team fielded unregistered player during Western Province qualifier without organizer verification.',
    },
    squad: [
      {
        id: 'm-15',
        fullName: 'Tharindu Fernando',
        role: 'Captain',
        jerseyNumber: 10,
        email: 'tharindu.f@sportlk.com',
        phoneNumber: '+94 71 333 8877',
        joinedDate: 'Feb 2026',
        status: 'Active',
      },
    ],
  },
];

export const INITIAL_REPORTS: TeamReport[] = [
  {
    id: 'rep-1',
    reportNumber: 'TR-102',
    teamId: '1',
    teamName: 'Colombo Strikers',
    reportedBy: 'Kandy United Manager',
    reporterRole: 'Team Manager',
    reason: 'Misleading information',
    details: 'Opponent roster list displayed a player who had not formally completed transfer verification.',
    receivedDate: '07 Oct, 2026',
    status: 'Open',
    severity: 'Medium',
  },
  {
    id: 'rep-2',
    reportNumber: 'TR-105',
    teamId: '6',
    teamName: 'Moratuwa Ballers',
    reportedBy: 'Tournament Committee (Western Cup)',
    reporterRole: 'Tournament Organizer',
    reason: 'Roster eligibility dispute',
    details: 'Player was not registered on the SportLK platform before match start time.',
    receivedDate: '05 Oct, 2026',
    status: 'In Review',
    severity: 'High',
  },
  {
    id: 'rep-3',
    reportNumber: 'TR-109',
    teamId: '4',
    teamName: 'Negombo FC',
    reportedBy: 'Galle Warriors Official',
    reporterRole: 'Team Manager',
    reason: 'Unsportsmanlike conduct',
    details: 'Dispute occurred during late substitution in 2nd half. Requested referee review of roster roles.',
    receivedDate: '02 Oct, 2026',
    status: 'Resolved',
    severity: 'Low',
    resolutionNotes: 'Reviewed referee scorecard. Clarified substitution protocol with Negombo FC manager.',
  },
  {
    id: 'rep-4',
    reportNumber: 'TR-114',
    teamId: '3',
    teamName: 'Galle Warriors',
    reportedBy: 'Southern Arena Official',
    reporterRole: 'Venue Coordinator',
    reason: 'Inactive / Forfeit',
    details: 'Team arrived 30 minutes after scheduled kickoff date for friendly challenge.',
    receivedDate: '29 Sep, 2026',
    status: 'Dismissed',
    severity: 'Low',
    resolutionNotes: 'Adverse weather conditions confirmed along Southern Expressway. Rescheduled challenge.',
  },
];
