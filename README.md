# 🛠️ SportLK Admin Website

<p align="center">
  <strong>A web control room for managing the SportLK sports community.</strong>
</p>

The SportLK admin website is the browser-based workspace for platform administrators. It is part of a wider platform for sports events, teams, tournaments, match results, and community activity in Sri Lanka.

## 🧰 Technology

| Layer | Technology |
| --- | --- |
| Web application | Next.js 16 · React · TypeScript |
| Database | MySQL, accessed by server-side application code |
| Mobile client | [React Native](https://github.com/SportLK/mobile-frontend) |
| API service | [NestJS backend](https://github.com/SportLK/backend) |

Keep database credentials and queries in server-side code. Never expose MySQL credentials to browser code.

## ✨ Planned admin capabilities

- Review and manage users, teams, and sports events
- Moderate community content and respond to reports
- Review match results and resolve score disputes
- View platform activity, transaction records, and analytics

These describe the intended scope. This repository currently contains an initial Next.js scaffold; SportLK admin workflows and MySQL integration are still to be implemented.

## 🚀 Run locally

### Requirements

- Node.js and npm
- Access to a MySQL instance when database integration is added

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🧪 Available scripts

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
