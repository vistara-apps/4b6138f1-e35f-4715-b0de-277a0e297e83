'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Wallet, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // CRITICAL: Call sdk.actions.ready() to prevent infinite loading
    sdk.actions.ready();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#1a2332] to-[#0a1929]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl mb-6 shadow-button">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            StreamerTip
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Empower streamers with instant micro-tips on Base. Gas-free, social-native, and built for creators.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Wallet className="w-8 h-8" />}
            title="Gasless Tipping"
            description="Send tips starting at $0.10 with zero gas fees. Powered by Base and OnchainKit."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Fan Recognition"
            description="Earn badges and unlock exclusive content by supporting your favorite streamers."
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Real-time Updates"
            description="See tips appear instantly on stream with live leaderboards and notifications."
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/streamer"
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-accent text-white font-semibold rounded-lg shadow-button transition-all duration-200 hover:scale-105 text-center"
          >
            I'm a Streamer
          </Link>
          <Link
            href="/viewer"
            className="w-full sm:w-auto px-8 py-4 bg-surface hover:bg-[#2a3342] text-fg font-semibold rounded-lg border-2 border-primary/30 transition-all duration-200 hover:border-primary text-center"
          >
            I'm a Viewer
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          <StatCard value="$0" label="Gas Fees" />
          <StatCard value="<1s" label="Tip Speed" />
          <StatCard value="Base" label="Network" />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-surface p-6 rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-200 shadow-card">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-fg">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary mb-1">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  );
}
