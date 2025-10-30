# x402 Payment Flow Implementation

## Overview

This document describes the implementation of the x402 payment protocol for the StreamerTip application, enabling USDC payments on Base chain with automatic payment handling.

## What is x402?

x402 is a payment protocol that extends HTTP's 402 Payment Required status code to enable seamless cryptocurrency payments. When a server requires payment, it responds with a 402 status and payment requirements, which the client automatically fulfills.

## Implementation Details

### 1. Dependencies

The following packages are required:

- **x402-axios** (v0.7.0): Axios interceptor for handling 402 payment responses
- **wagmi** (v2.14.11): React hooks for Ethereum wallet interaction
- **viem** (v2.27.2): Low-level Ethereum utilities
- **@coinbase/onchainkit** (v0.38.19): Coinbase's onchain UI components

### 2. Wagmi Configuration

Located in: `/app/components/Providers.tsx`

```typescript
import { WagmiProvider, createConfig, http } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import { base } from 'wagmi/chains';

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'StreamerTip',
      preference: 'smartWalletOnly',
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});
```

**Key Features:**
- Configured for Base chain
- Smart Wallet only (gasless transactions)
- SSR support for Next.js

### 3. Payment Flow Implementation

Located in: `/app/tip/[username]/page.tsx`

#### Step 1: Setup Wallet Client

```typescript
import { useWalletClient, useAccount, usePublicClient } from 'wagmi';
import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';

const { data: walletClient } = useWalletClient();
const { address, isConnected } = useAccount();
const publicClient = usePublicClient();
```

#### Step 2: Create x402 Axios Client

```typescript
const x402Client = withPaymentInterceptor(
  axios.create({
    baseURL: TIP_API_ENDPOINT.replace('/tip', ''),
  }),
  walletClient as any
);
```

#### Step 3: Make Payment Request

```typescript
const amountInUSDC = parseUnits(selectedAmount.toString(), 6);

const response = await x402Client.post('/tip', {
  username,
  amount: amountInUSDC.toString(),
  message: message || undefined,
  from: address,
});
```

### 4. Payment Protocol Flow

1. **Initial Request**: Client makes POST request to tip endpoint
2. **402 Response**: Server responds with payment requirements if payment needed
3. **Payment Creation**: x402-axios intercepts 402 and creates payment header
4. **Wallet Signing**: User signs the payment transaction via wallet
5. **Retry Request**: x402-axios automatically retries with payment header
6. **Success Response**: Server validates payment and completes request

### 5. Error Handling

The implementation includes comprehensive error handling:

```typescript
try {
  // Payment flow
} catch (error: any) {
  if (error.response?.status === 402) {
    errorMessage = 'Payment required. Please ensure you have sufficient USDC balance.';
  } else if (error.response?.status === 400) {
    errorMessage = error.response.data?.error || 'Invalid request.';
  } else if (error.code === 'ACTION_REJECTED') {
    errorMessage = 'Transaction was rejected.';
  } else if (error.message?.includes('insufficient funds')) {
    errorMessage = 'Insufficient USDC balance for this tip.';
  }
}
```

### 6. Transaction Status Management

The UI displays real-time transaction status:

- **Preparing**: Setting up payment request
- **Signing**: Waiting for wallet signature
- **Confirming**: Transaction being confirmed on-chain
- **Success**: Payment completed
- **Error**: Payment failed with details

### 7. USDC on Base Integration

**USDC Contract Address**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

- Native USDC on Base chain
- 6 decimal places
- Used as payment token for all tips

## Environment Variables

Create a `.env.local` file with:

```env
# OnchainKit API Key (required)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here

# StreamerTip API Endpoint (required)
NEXT_PUBLIC_TIP_API_ENDPOINT=https://api.streamertip.app/tip
```

## Backend Requirements

Your backend API must:

1. **Support x402 Protocol**:
   - Respond with 402 status code when payment required
   - Include payment requirements in response body
   - Accept X-PAYMENT header in retry requests

2. **Payment Requirements Format**:
```json
{
  "x402Version": "0.1.0",
  "accepts": [
    {
      "network": "evm",
      "chainId": 8453,
      "token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "amount": "1000000",
      "recipient": "0x..."
    }
  ]
}
```

3. **Validate Payment**:
   - Extract payment from X-PAYMENT header
   - Verify transaction on-chain
   - Process tip if valid

## Testing

### Manual Testing Checklist

- [x] Wallet connection with Coinbase Smart Wallet
- [x] Amount selection and custom amounts
- [x] Payment flow initiation
- [x] Error handling for insufficient funds
- [x] Error handling for rejected transactions
- [x] Transaction status updates
- [x] Success state with transaction hash

### Test Scenarios

1. **Successful Payment**:
   - Connect wallet
   - Select tip amount
   - Approve payment signature
   - Verify transaction confirmed

2. **Insufficient Balance**:
   - Try to tip more than USDC balance
   - Verify error message displayed

3. **User Rejection**:
   - Initiate payment
   - Reject wallet signature
   - Verify proper error handling

4. **Network Issues**:
   - Simulate network failure
   - Verify timeout handling

## Build Verification

```bash
npm run build
```

Build should complete successfully with no type errors.

## Production Considerations

1. **Gas Optimization**: Using Coinbase Smart Wallet for gasless transactions
2. **Transaction Monitoring**: Consider implementing websocket for real-time confirmations
3. **Error Logging**: Add error tracking service integration
4. **Rate Limiting**: Implement client-side rate limiting for API calls
5. **Payment Receipts**: Store transaction hashes for payment records

## Security

- All payments require user wallet signature
- USDC token address is hardcoded to prevent token swapping
- Payment amounts are validated client-side before submission
- Backend must validate all payments on-chain

## Resources

- [x402 Protocol Specification](https://x402.org)
- [x402-axios Documentation](https://github.com/paywithglide/x402-axios)
- [Wagmi Documentation](https://wagmi.sh)
- [OnchainKit Documentation](https://onchainkit.xyz)
- [Base Chain Documentation](https://docs.base.org)

## Troubleshooting

### Issue: WalletClient type errors
**Solution**: Cast walletClient with `as any` - runtime types are compatible

### Issue: 402 not intercepted
**Solution**: Ensure backend responds with proper x402 format

### Issue: Transaction not confirming
**Solution**: Check Base network status and gas settings

## Future Enhancements

1. Add transaction receipt storage
2. Implement payment history
3. Add support for multiple tokens
4. Implement recurring payments
5. Add payment notifications
