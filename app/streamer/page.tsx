'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { ArrowLeft, Share2, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function StreamerPage() {
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    sdk.actions.ready();
    
    // Get Farcaster context
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

        {/* Profile Section */}
        <div className="bg-surface rounded-lg p-8 mb-6 border border-primary/20 shadow-card">
          <div className="flex items-center gap-4 mb-6">
            {context?.user?.pfpUrl ? (
              <img src={context.user.pfpUrl} alt="Profile" className="w-20 h-20 rounded-full border-2 border-primary" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-fg mb-1">
                {context?.user?.displayName || 'Streamer Dashboard'}
              </h1>
              <p className="text-text-secondary">
                @{context?.user?.username || 'username'}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <StatBox icon={<DollarSign />} value="$0.00" label="Total Tips" />
            <StatBox icon={<TrendingUp />} value="0" label="Supporters" />
            <StatBox icon={<Share2 />} value="0" label="Shares" />
          </div>
        </div>

        {/* Tip Jar Setup */}
        <div className="bg-surface rounded-lg p-8 border border-primary/20 shadow-card">
          <h2 className="text-2xl font-bold text-fg mb-4">Your Tip Jar</h2>
          <p className="text-text-secondary mb-6">
            Share your tip jar with your audience to start receiving tips on Base.
          </p>

          <div className="bg-bg rounded-lg p-6 mb-6 border border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-secondary">Tip Jar URL</span>
              <button className="text-primary hover:text-accent text-sm font-medium">
                Copy Link
              </button>
            </div>
            <div className="bg-surface rounded px-4 py-3 font-mono text-sm text-fg break-all">
              streamertip.com/tip/{context?.user?.username || 'username'}
            </div>
          </div>

          <button className="w-full bg-primary hover:bg-accent text-white font-semibold py-4 rounded-lg shadow-button transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Tip Jar Frame
          </button>
        </div>

        {/* Recent Tips */}
        <div className="mt-6 bg-surface rounded-lg p-8 border border-primary/20 shadow-card">
          <h2 className="text-xl font-bold text-fg mb-4">Recent Tips</h2>
          <div className="text-center py-12 text-text-secondary">
            <p>No tips yet. Share your tip jar to get started!</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatBox({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-bg rounded-lg p-4 border border-primary/20">
      <div className="text-primary mb-2">{icon}</div>
      <div className="text-2xl font-bold text-fg mb-1">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  );
}
