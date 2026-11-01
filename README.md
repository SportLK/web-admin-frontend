# 🛠️ SportLK Admin Website

<p align="center">
  <strong>A web control room for managing the SportLK sports community.</strong>
</p>

The SportLK admin website is the browser-based workspace for platform administrators. It supports member and community workflows alongside team, venue, match, and report administration.

## 🧰 Technology

| Layer | Technology |
| --- | --- |
| Web application | Next.js 16 · React · TypeScript |
| Live updates | Socket.IO client |
| API service | [NestJS backend](https://github.com/SportLK/backend) |
| Mobile client | [Expo / React Native](https://github.com/SportLK/mobile-frontend) |
| Database | MySQL, accessed by the backend |

The website communicates with the backend API. Database credentials and queries belong on the server side; do not expose MySQL credentials to browser code.

## ✨ Admin capabilities

- Review and manage members, teams, and venues
- Monitor matches and live scores
- Moderate community content and resolve reports
- Review team and organizer workflows
- View platform activity and statistics

## 🚀 Run locally

### Requirements

- Node.js and npm
- The SportLK backend for live data; preview mode is available without an admin session

Install dependencies:

```bash
npm ci
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the backend API URL. The default local URL is `http://localhost:3000/api/v1`.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production app |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## 🔗 SportLK repositories

- [Backend API](https://github.com/SportLK/backend)
- [Mobile app](https://github.com/SportLK/mobile-frontend)
- [Admin website](https://github.com/SportLK/web-admin-frontend)
