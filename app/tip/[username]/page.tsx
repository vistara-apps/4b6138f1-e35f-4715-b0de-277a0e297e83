'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { ArrowLeft, Send, MessageCircle, Check, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWalletClient, useAccount, usePublicClient } from 'wagmi';
import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';
import { parseUnits } from 'viem';

const TIP_AMOUNTS = [
  { value: 0.1, label: '$0.10' },
  { value: 1, label: '$1' },
  { value: 5, label: '$5' },
  { value: 10, label: '$10' },
];

// USDC on Base contract address
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// API endpoint - replace with your actual endpoint
const TIP_API_ENDPOINT = process.env.NEXT_PUBLIC_TIP_API_ENDPOINT || 'https://api.streamertip.app/tip';

interface TipStatus {
  state: 'idle' | 'preparing' | 'signing' | 'confirming' | 'success' | 'error';
  message: string;
  txHash?: string;
}

export default function TipPage() {
  const params = useParams();
  const username = params.username as string;
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [context, setContext] = useState<any>(null);
  const [tipStatus, setTipStatus] = useState<TipStatus>({ state: 'idle', message: '' });

  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  useEffect(() => {
    sdk.actions.ready();
    const ctx = sdk.context;
    setContext(ctx);
  }, []);

  const handleTip = async () => {
    if (!walletClient || !address || !isConnected || !publicClient) {
      setTipStatus({
        state: 'error',
        message: 'Please connect your wallet first',
      });
      return;
    }

    if (selectedAmount <= 0) {
      setTipStatus({
        state: 'error',
        message: 'Please select a valid tip amount',
      });
      return;
    }

    try {
      setTipStatus({
        state: 'preparing',
        message: 'Preparing your tip...',
      });

      // Create x402 axios instance with wallet client
      // Note: Type assertion is safe as wagmi's WalletClient is compatible with x402's requirements
      const x402Client = withPaymentInterceptor(
        axios.create({
          baseURL: TIP_API_ENDPOINT.replace('/tip', ''),
        }),
        walletClient as any
      );

      // Convert amount to USDC units (6 decimals for USDC)
      const amountInUSDC = parseUnits(selectedAmount.toString(), 6);

      setTipStatus({
        state: 'signing',
        message: 'Requesting payment signature...',
      });

      // Make payment request to backend with x402
      const response = await x402Client.post('/tip', {
        username,
        amount: amountInUSDC.toString(),
        message: message || undefined,
        from: address,
      });

      setTipStatus({
        state: 'confirming',
        message: 'Confirming transaction...',
      });

      // Extract transaction hash from response if available
      const txHash = response.data?.txHash || response.headers['x-transaction-hash'];

      // Wait a bit for confirmation (in production, you'd want to poll or use websockets)
      await new Promise(resolve => setTimeout(resolve, 3000));

      setTipStatus({
        state: 'success',
        message: `Successfully sent $${selectedAmount.toFixed(2)} to @${username}!`,
        txHash,
      });

      // Reset form after successful tip
      setTimeout(() => {
        setSelectedAmount(1);
        setCustomAmount('');
        setMessage('');
        setTipStatus({ state: 'idle', message: '' });
      }, 5000);

    } catch (error: any) {
      console.error('Tip error:', error);
      
      let errorMessage = 'Failed to process tip. Please try again.';
      
      if (error.response?.status === 402) {
        errorMessage = 'Payment required. Please ensure you have sufficient USDC balance.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid request. Please check your input.';
      } else if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected. Please try again.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient USDC balance for this tip.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setTipStatus({
        state: 'error',
        message: errorMessage,
      });

      // Clear error after 8 seconds
      setTimeout(() => {
        setTipStatus({ state: 'idle', message: '' });
      }, 8000);
    }
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

        {/* Transaction Status */}
        {tipStatus.state !== 'idle' && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
              tipStatus.state === 'success'
                ? 'bg-success/10 border-success/30 text-success'
                : tipStatus.state === 'error'
                ? 'bg-error/10 border-error/30 text-error'
                : 'bg-primary/10 border-primary/30 text-primary'
            }`}
          >
            {tipStatus.state === 'success' && <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            {tipStatus.state === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            {['preparing', 'signing', 'confirming'].includes(tipStatus.state) && (
              <Loader2 className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{tipStatus.message}</p>
              {tipStatus.txHash && (
                <a
                  href={`https://basescan.org/tx/${tipStatus.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline mt-1 inline-block hover:opacity-80"
                >
                  View transaction
                </a>
              )}
            </div>
          </div>
        )}

        {/* Send Tip Button */}
        <button
          onClick={handleTip}
          disabled={
            selectedAmount <= 0 ||
            !isConnected ||
            ['preparing', 'signing', 'confirming'].includes(tipStatus.state)
          }
          className="w-full bg-primary hover:bg-accent text-white font-semibold py-4 rounded-lg shadow-button transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {['preparing', 'signing', 'confirming'].includes(tipStatus.state) ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {tipStatus.state === 'preparing' && 'Preparing...'}
              {tipStatus.state === 'signing' && 'Signing...'}
              {tipStatus.state === 'confirming' && 'Confirming...'}
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {isConnected 
                ? `Send $${selectedAmount.toFixed(2)} Tip` 
                : 'Connect Wallet to Tip'
              }
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-text-secondary">
          <p>✨ x402 powered payments with USDC on Base</p>
          <p className="mt-1">🔒 Secure and instant transactions</p>
          {isConnected && address && (
            <p className="mt-2 text-xs">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
