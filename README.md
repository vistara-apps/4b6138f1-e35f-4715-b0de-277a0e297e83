# StreamerTip - Base Mini App

Empower streamers with instant micro-tips on Base. Gas-free, social-native, and built for creators.

## Features

- 🎮 **Gasless Tipping**: Send tips starting at $0.10 with zero gas fees
- 💳 **x402 Payments**: Automatic payment handling with USDC on Base
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
cp .env.example .env.local
```

3. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
NEXT_PUBLIC_TIP_API_ENDPOINT=https://api.streamertip.app/tip
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: Base (L2)
- **Payments**: x402 Protocol with USDC
- **Wallet**: OnchainKit + Coinbase Smart Wallet (gasless)
- **Web3**: Wagmi + Viem
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

## x402 Payment Integration

This app implements the x402 payment protocol for seamless USDC payments. See [X402_IMPLEMENTATION.md](./X402_IMPLEMENTATION.md) for detailed implementation docs.

**Key Features:**
- Automatic 402 payment request handling
- USDC on Base (6 decimals)
- Smart Wallet integration (gasless for users)
- Comprehensive error handling
- Real-time transaction status

## Learn More

- [Base Documentation](https://docs.base.org)
- [OnchainKit Docs](https://onchainkit.xyz)
- [Farcaster MiniKit](https://miniapps.farcaster.xyz)
- [x402 Protocol](https://x402.org)
- [Wagmi Documentation](https://wagmi.sh)
