# GoalGenius 🎯

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.2.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-AGPLv3-green)](./LICENSE)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Ready-orange)](https://developers.cloudflare.com/)

GoalGenius is a modern, open-source goal tracking and productivity platform built with Next.js and Cloudflare.

[BETA V1.0](https://app.goalgenius.online) · [Documentation](https://goalgenius.online/docs) · [Report Bug](https://github.com/ismailco/goalgenius/issues) · [Request Feature](https://github.com/ismailco/goalgenius/issues)

</div>

## ✨ Features

- 🎯 **Goal Tracking**: Set, track, and achieve your personal and professional goals
- ✅ **Todo Management**: Organize tasks with priorities and deadlines
- 📝 **Note Taking**: Capture ideas and important information
- 📊 **Analytics Dashboard**: Visualize your progress and productivity trends
- 📅 **Calendar Integration**: Schedule and manage your time effectively
- 🏆 **Milestones**: Break down goals into achievable milestones
- 📈 **Check-ins**: Regular progress tracking and reflection
- 🔒 **Secure Authentication**: Protected user data and privacy
- 🌐 **Cloud Infrastructure**: Powered by Cloudflare for global scalability

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- pnpm 8.0 or later
- Cloudflare account (for deployment)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/ismailco/goalgenius.git
   cd goalgenius
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .dev.vars.example .dev.vars
   cp .env.local.example .env.local
   # Edit .dev.vars and .env.local with your configuration
   ```

4. Set up the database
   ```bash
   pnpm db:generate
   pnpm db:migrate:local
   ```

5. Start the development server
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15.2.5, React 19, TailwindCSS
- **Database**: Cloudflare D1 with Drizzle ORM
- **Authentication**: Custom auth with better-auth
- **Deployment**: Cloudflare Workers with OpenNext.js
- **Type Safety**: TypeScript
- **Security**: DOMPurify, XSS protection
- **UI Components**: Custom components with Framer Motion

## 📦 Project Structure

```
goalgenius/
├── app/                # Next.js app router pages
│   ├── analytics/     # Analytics features
│   ├── calendar/      # Calendar integration
│   ├── dashboard/     # Main dashboard
│   ├── goals/         # Goal management
│   └── ...
├── components/         # Reusable React components
├── lib/               # Utility functions and helpers
├── drizzle/           # Database schema and migrations
└── public/            # Static assets
```

## 🔧 Configuration

### Environment Variables

Create a `.dev.vars` file in the root directory with the following variables:

```env
# Development Environment
NEXTJS_ENV=development
NODE_ENV=development

# Cloudflare D1 Configuration
CLOUDFLARE_D1_ACCOUNT_ID=your_account_id
CLOUDFLARE_D1_DATABASE_ID=your_database_id
CLOUDFLARE_D1_API_TOKEN=your_api_token

# Authentication
BETTER_AUTH_URL=your_auth_url
BETTER_AUTH_SECRET=your_auth_secret
```
Create a `.env.local` file in the root directory with the following variables:

```env
# Cloudflare D1 Configuration
NEXT_PUBLIC_CLOUDFLARE_D1_ACCOUNT_ID=your_account_id
NEXT_PUBLIC_CLOUDFLARE_D1_DATABASE_ID=your_database_id
NEXT_PUBLIC_CLOUDFLARE_D1_API_TOKEN=your_api_token

# Authentication
NEXT_PUBLIC_AUTH_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_AUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Database Setup

The project uses Cloudflare D1 as the database. To set up:

1. Create a D1 database in your Cloudflare account
2. Update wrangler.jsonc with your database details
3. Run migrations using provided scripts

## 🚀 Deployment

### Deploy to Cloudflare

1. Install Wrangler CLI
   ```bash
   pnpm add -g wrangler
   ```

2. Configure Cloudflare
   ```bash
   wrangler login
   ```

3. Deploy to Cloudflare (Don't deploy this way, use the Cloudflare dashboard)
   ```bash
   pnpm deploy
   ```

## 👥 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPLv3) - see the [LICENSE](LICENSE) file for details. This means:

- You can use this software for any purpose
- You can modify this software
- You must share any modifications you make under the same license
- You must disclose your source code when you distribute the software
- If you run a modified version of this software as a network service, you must make the complete source code available to any network user

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Cloudflare](https://www.cloudflare.com/) - For infrastructure and D1 database
- [Drizzle](https://orm.drizzle.team/) - For the amazing ORM
- All our contributors and supporters

## 📞 Support

- Documentation: [https://goalgenius.online/docs](https://goalgenius.online/docs)
<!-- - Discord: [Join our community](https://discord.gg/goalgenius) -->
- Issues: [GitHub Issues](https://github.com/ismailco/goalgenius/issues)

---

<div align="center">
Made with ❤️ by <a href="https://github.com/ismailco">Ismail Courr</a>
</div>
