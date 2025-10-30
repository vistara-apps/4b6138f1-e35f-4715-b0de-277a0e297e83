'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { ArrowLeft, Send, MessageCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWalletClient, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';
import { parseUnits, type Hash, encodeFunctionData } from 'viem';
import { base } from 'wagmi/chains';

const TIP_AMOUNTS = [
  { value: 0.1, label: '$0.10' },
  { value: 1, label: '$1' },
  { value: 5, label: '$5' },
  { value: 10, label: '$10' },
];

// USDC on Base
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_DECIMALS = 6;

// ERC20 Transfer ABI
const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

type TransactionStatus = 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error';

export default function TipPage() {
  const params = useParams();
  const username = params.username as string;
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [context, setContext] = useState<any>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState<Hash | undefined>();
  const [error, setError] = useState<string>('');

  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();

  // Watch for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: base.id,
  });

  useEffect(() => {
    sdk.actions.ready();
    const ctx = sdk.context;
    setContext(ctx);
  }, []);

  useEffect(() => {
    if (isConfirming) {
      setTxStatus('confirming');
    } else if (isConfirmed) {
      setTxStatus('success');
    }
  }, [isConfirming, isConfirmed]);

  const handleTip = async () => {
    if (!isConnected || !walletClient || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (selectedAmount <= 0) {
      setError('Please select a valid tip amount');
      return;
    }

    try {
      setTxStatus('preparing');
      setError('');

      // Create axios client with x402 payment interceptor
      // The wallet client from wagmi can be used directly as a signer
      const axiosClient = withPaymentInterceptor(
        axios.create(),
        walletClient as any // Wagmi wallet client is compatible with x402 Signer interface
      );

      // Convert USD amount to USDC (assuming 1:1 ratio)
      const usdcAmount = parseUnits(selectedAmount.toString(), USDC_DECIMALS);

      // For demo purposes, using a placeholder recipient address
      // In production, this should be fetched from your backend based on username
      const recipientAddress = address; // Replace with actual streamer address

      // Encode the transfer function data
      const data = encodeFunctionData({
        abi: ERC20_TRANSFER_ABI,
        functionName: 'transfer',
        args: [recipientAddress, usdcAmount],
      });

      setTxStatus('pending');

      // Send transaction directly using wallet client
      // In a production x402 flow, you would make an API request that returns 402
      // and the interceptor would handle the payment automatically
      const hash = await walletClient.sendTransaction({
        to: USDC_BASE_ADDRESS,
        data,
        chain: base,
      });
      
      setTxHash(hash);
      setTxStatus('confirming');

      console.log('Transaction sent:', {
        hash,
        amount: selectedAmount,
        message,
        username,
      });

      // You could also send the message to your backend here with x402 support
      // The axios client will automatically handle 402 responses
      // try {
      //   await axiosClient.post('/api/tips', {
      //     username,
      //     amount: selectedAmount,
      //     message,
      //     txHash: hash,
      //   });
      // } catch (apiError) {
      //   console.log('API call handled with x402:', apiError);
      // }

    } catch (err: any) {
      console.error('Tip error:', err);
      setTxStatus('error');
      setError(err?.message || 'Failed to send tip. Please try again.');
    }
  };

  const resetTransaction = () => {
    setTxStatus('idle');
    setTxHash(undefined);
    setError('');
    setSelectedAmount(1);
    setCustomAmount('');
    setMessage('');
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

        {/* Transaction Status Modal */}
        {txStatus === 'success' && (
          <div className="bg-surface rounded-lg p-8 mb-6 border border-green-500/50 shadow-card text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-fg mb-2">Tip Sent Successfully!</h2>
            <p className="text-text-secondary mb-4">
              Your ${selectedAmount.toFixed(2)} USDC tip has been confirmed on Base
            </p>
            {txHash && (
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-accent text-sm mb-4 inline-block"
              >
                View on Basescan →
              </a>
            )}
            <button
              onClick={resetTransaction}
              className="w-full bg-primary hover:bg-accent text-white font-semibold py-3 rounded-lg shadow-button transition-all duration-200"
            >
              Send Another Tip
            </button>
          </div>
        )}

        {txStatus === 'error' && error && (
          <div className="bg-surface rounded-lg p-8 mb-6 border border-red-500/50 shadow-card">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-fg mb-2">Transaction Failed</h3>
                <p className="text-text-secondary text-sm mb-4">{error}</p>
                <button
                  onClick={() => setTxStatus('idle')}
                  className="text-primary hover:text-accent text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {(txStatus === 'preparing' || txStatus === 'pending' || txStatus === 'confirming') && (
          <div className="bg-surface rounded-lg p-8 mb-6 border border-primary/50 shadow-card text-center">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-fg mb-2">
              {txStatus === 'preparing' && 'Preparing Transaction...'}
              {txStatus === 'pending' && 'Waiting for Signature...'}
              {txStatus === 'confirming' && 'Confirming Transaction...'}
            </h2>
            <p className="text-text-secondary">
              {txStatus === 'preparing' && 'Setting up your tip transaction'}
              {txStatus === 'pending' && 'Please sign the transaction in your wallet'}
              {txStatus === 'confirming' && 'Transaction submitted, waiting for confirmation'}
            </p>
            {txHash && (
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-accent text-sm mt-4 inline-block"
              >
                View on Basescan →
              </a>
            )}
          </div>
        )}

        {txStatus === 'idle' && (
          <>
            {/* Streamer Profile */}
            <div className="bg-surface rounded-lg p-8 mb-6 border border-primary/20 shadow-card text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-5xl mx-auto mb-4">
                🎮
              </div>
              <h1 className="text-2xl font-bold text-fg mb-2">Tip @{username}</h1>
              <p className="text-text-secondary">Support this streamer with USDC on Base</p>
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
              disabled={selectedAmount <= 0 || !isConnected}
              className="w-full bg-primary hover:bg-accent text-white font-semibold py-4 rounded-lg shadow-button transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
              {!isConnected ? 'Connect Wallet to Send Tip' : `Send ${selectedAmount.toFixed(2)} USDC Tip`}
            </button>

            {/* Info */}
            <div className="mt-6 text-center text-sm text-text-secondary">
              <p>✨ Using USDC on Base with x402 payment protocol</p>
              <p className="mt-1">🔒 Secure and instant transactions</p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
