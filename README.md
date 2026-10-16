# SportLK Admin Console

Next.js workspace for member account management, community moderation, reports, and Team Manager / Tournament Organizer approvals.

This module owns user identity, profiles, community content, reports, notifications, and role applications. Teams, rosters, tournaments, schedules, and event operations are owned by their respective platform modules. Approvals grant role permissions in the user's shared profile so external modules can grant workspace access.

---

## Run Locally

The backend listens on port `3000`; the admin website uses port `3001`.

```bash
npm install
npm run dev
```

Point the dashboard at the NestJS API:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Without an admin session, the dashboard opens in preview mode with sample data and local-only actions. Use an admin account created by the backend to sign in and synchronize live data.

---

## Admin Workflows

- **Member Management**: Search, filter, and manage member status (Active, Review, Suspended).
- **Community Moderation**: Review or toggle visibility on community posts.
- **Reports Resolution**: Triage user, post, and community reports submitted by players.
- **Role Applications**: Approve or decline manager and organizer applications.
- **Platform Overview**: Community growth charts, top sports, and real-time activity indicators.

---

## Multi-Member Integration

For complete architecture, database entity relationships, and backend integration contracts across all 4 team members, refer to [TEAM_INTEGRATION_GUIDE.md](./TEAM_INTEGRATION_GUIDE.md).
