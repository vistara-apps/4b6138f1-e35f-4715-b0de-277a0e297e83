# StreamerTip - Base Mini App

Empower streamers with instant micro-tips on Base. Gas-free, social-native, and built for creators.

## Features

- 🎮 **Gasless Tipping**: Send tips starting at $0.10 with zero gas fees
- 👥 **Fan Recognition**: Earn badges and unlock exclusive content
- ⚡ **Real-time Updates**: Instant notifications and live leaderboards
- 🔗 **Farcaster Integration**: Native social features and identity
- 💎 **OnchainKit Powered**: Built with Coinbase's OnchainKit for seamless UX

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Add your OnchainKit API key to `.env.local`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: Base (L2)
- **Wallet**: OnchainKit + Coinbase Wallet
- **Social**: Farcaster MiniKit SDK
- **Styling**: Tailwind CSS with Coinbase theme
- **TypeScript**: Full type safety

## Project Structure

```
app/
├── page.tsx              # Landing page
├── streamer/page.tsx     # Streamer dashboard
├── viewer/page.tsx       # Viewer discovery
├── tip/[username]/page.tsx # Tipping interface
└── components/
    └── Providers.tsx     # OnchainKit provider setup
```

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Make sure to set environment variables in your deployment platform.

## Learn More

- [Base Documentation](https://docs.base.org)
- [OnchainKit Docs](https://onchainkit.xyz)
- [Farcaster MiniKit](https://miniapps.farcaster.xyz)
