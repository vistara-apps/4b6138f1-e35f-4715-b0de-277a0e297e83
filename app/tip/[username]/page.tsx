'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { ConnectWallet, Transaction, TransactionButton } from '@coinbase/onchainkit/wallet';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const TIP_AMOUNTS = [
  { value: 0.1, label: '$0.10' },
  { value: 1, label: '$1' },
  { value: 5, label: '$5' },
  { value: 10, label: '$10' },
];

export default function TipPage() {
  const params = useParams();
  const username = params.username as string;
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    sdk.actions.ready();
    const ctx = sdk.context;
    setContext(ctx);
  }, []);

  const handleTip = async () => {
    // Transaction logic will be implemented here
    console.log('Tipping:', { amount: selectedAmount, message });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#1a2332] to-[#0a1929]">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/viewer" className="flex items-center gap-2 text-text-secondary hover:text-fg transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <ConnectWallet />
        </div>

        {/* Streamer Profile */}
        <div className="bg-surface rounded-lg p-8 mb-6 border border-primary/20 shadow-card text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-5xl mx-auto mb-4">
            🎮
          </div>
          <h1 className="text-2xl font-bold text-fg mb-2">Tip @{username}</h1>
          <p className="text-text-secondary">Support this streamer with a gasless tip on Base</p>
        </div>

        {/* Tip Amount Selection */}
        <div className="bg-surface rounded-lg p-8 mb-6 border border-primary/20 shadow-card">
          <h2 className="text-xl font-bold text-fg mb-4">Select Amount</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {TIP_AMOUNTS.map((amount) => (
              <button
                key={amount.value}
                onClick={() => {
                  setSelectedAmount(amount.value);
                  setCustomAmount('');
                }}
                className={`py-4 rounded-lg font-semibold transition-all duration-200 ${
                  selectedAmount === amount.value && !customAmount
                    ? 'bg-primary text-white shadow-button'
                    : 'bg-bg text-fg border border-primary/30 hover:border-primary'
                }`}
              >
                {amount.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(parseFloat(e.target.value) || 0);
              }}
              className="w-full bg-bg border border-primary/20 rounded-lg pl-8 pr-4 py-4 text-fg placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              step="0.01"
              min="0.1"
            />
          </div>
        </div>

        {/* Message */}
        <div className="bg-surface rounded-lg p-8 mb-6 border border-primary/20 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-fg">Add a Message (Optional)</h2>
          </div>
          <textarea
            placeholder="Say something nice..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-bg border border-primary/20 rounded-lg px-4 py-3 text-fg placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none"
            rows={3}
            maxLength={200}
          />
          <div className="text-right text-sm text-text-secondary mt-2">
            {message.length}/200
          </div>
        </div>

        {/* Send Tip Button */}
        <button
          onClick={handleTip}
          disabled={selectedAmount <= 0}
          className="w-full bg-primary hover:bg-accent text-white font-semibold py-4 rounded-lg shadow-button transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Send className="w-5 h-5" />
          Send ${selectedAmount.toFixed(2)} Tip
        </button>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-text-secondary">
          <p>✨ Gas-free transaction powered by Base</p>
          <p className="mt-1">🔒 Secure and instant</p>
        </div>
      </div>
    </main>
  );
}
