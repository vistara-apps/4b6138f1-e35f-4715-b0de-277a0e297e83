'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { ArrowLeft, Search, TrendingUp, Heart } from 'lucide-react';
import Link from 'next/link';

const FEATURED_STREAMERS = [
  { id: 1, name: 'CryptoGamer', username: 'cryptogamer', avatar: '🎮', tips: 1234, supporters: 89 },
  { id: 2, name: 'DeFi Dave', username: 'defidave', avatar: '💰', tips: 987, supporters: 67 },
  { id: 3, name: 'NFT Artist', username: 'nftartist', avatar: '🎨', tips: 756, supporters: 54 },
];

export default function ViewerPage() {
  const [context, setContext] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    sdk.actions.ready();
    const ctx = sdk.context;
    setContext(ctx);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#1a2332] to-[#0a1929]">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-fg transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <ConnectWallet />
        </div>

        {/* Welcome Section */}
        <div className="bg-surface rounded-lg p-8 mb-6 border border-primary/20 shadow-card">
          <h1 className="text-3xl font-bold text-fg mb-2">
            Welcome, {context?.user?.displayName || 'Viewer'}! 👋
          </h1>
          <p className="text-text-secondary">
            Discover and support your favorite streamers with instant, gasless tips on Base.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
            <input
              type="text"
              placeholder="Search for streamers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-primary/20 rounded-lg pl-12 pr-4 py-4 text-fg placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Featured Streamers */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-fg">Featured Streamers</h2>
          </div>
          <div className="grid gap-4">
            {FEATURED_STREAMERS.map((streamer) => (
              <StreamerCard key={streamer.id} streamer={streamer} />
            ))}
          </div>
        </div>

        {/* Your Activity */}
        <div className="bg-surface rounded-lg p-8 border border-primary/20 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-fg">Your Activity</h2>
          </div>
          <div className="text-center py-12 text-text-secondary">
            <p>No tipping activity yet. Start supporting streamers!</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function StreamerCard({ streamer }: { streamer: any }) {
  return (
    <Link href={`/tip/${streamer.username}`}>
      <div className="bg-surface rounded-lg p-6 border border-primary/20 hover:border-primary/40 transition-all duration-200 shadow-card hover:shadow-button cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
              {streamer.avatar}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-fg mb-1">{streamer.name}</h3>
              <p className="text-text-secondary text-sm">@{streamer.username}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-text-secondary">
                  💰 {streamer.tips} tips
                </span>
                <span className="text-text-secondary">
                  👥 {streamer.supporters} supporters
                </span>
              </div>
            </div>
          </div>
          <button className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105">
            Tip Now
          </button>
        </div>
      </div>
    </Link>
  );
}
