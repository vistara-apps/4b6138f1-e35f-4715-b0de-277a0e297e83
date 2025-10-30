# X402 Payment Flow Implementation

This document describes the x402 payment protocol implementation for the StreamerTip application.

## Overview

The x402 payment protocol has been successfully integrated into the tip flow, enabling secure USDC payments on Base chain with automatic payment handling for 402 (Payment Required) API responses.

## Implementation Details

### 1. Dependencies Installed

- **x402-axios** (v0.7.0): Payment protocol interceptor for axios
- **wagmi** (v2.14.11): React hooks for Ethereum
- **viem** (v2.27.2): TypeScript interface for Ethereum
- **axios**: HTTP client with x402 interceptor support

### 2. Configuration

#### Wagmi Provider Setup
Location: `app/components/Providers.tsx`

```typescript
import { WagmiProvider, createConfig, http } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import { base } from 'wagmi/chains';

const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'StreamerTip',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});
```

Key features:
- Base chain configured as primary network
- Coinbase Smart Wallet integration
- OnchainKit integration for seamless UX

### 3. Payment Flow Implementation

Location: `app/tip/[username]/page.tsx`

#### USDC on Base Configuration

```typescript
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_DECIMALS = 6;
```

#### Key Components

1. **Wallet Connection**
   - Uses `useWalletClient()` from wagmi to access connected wallet
   - `useAccount()` provides address and connection status

2. **X402 Integration**
   ```typescript
   const axiosClient = withPaymentInterceptor(
     axios.create(),
     walletClient // Wagmi wallet client works as x402 Signer
   );
   ```

3. **Transaction Flow**
   - Prepares USDC transfer with proper encoding
   - Sends transaction through wallet client
   - Monitors confirmation status with `useWaitForTransactionReceipt`

4. **Transaction States**
   - `idle`: Ready for new transaction
   - `preparing`: Setting up transaction data
   - `pending`: Waiting for user signature
   - `confirming`: Transaction submitted, awaiting confirmation
   - `success`: Transaction confirmed on-chain
   - `error`: Transaction failed with error message

### 4. Error Handling

Comprehensive error handling includes:
- Wallet connection validation
- Amount validation
- Transaction execution errors
- User-friendly error messages
- Retry functionality

### 5. Transaction Confirmation

- Real-time status updates using wagmi hooks
- Basescan link for transaction verification
- Visual feedback for each transaction state
- Automatic state management

## Testing the Implementation

### Prerequisites

1. **Coinbase Wallet** or compatible Web3 wallet
2. **Base network** configured in wallet
3. **USDC on Base** for testing payments
4. **Test recipient address** (currently using sender's address as placeholder)

### Test Steps

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Navigate to Tip Page**
   - Go to `/tip/[username]` (e.g., `/tip/teststreamer`)

3. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve connection in Coinbase Wallet

4. **Send a Tip**
   - Select or enter tip amount
   - Optionally add a message
   - Click "Send [amount] USDC Tip"
   - Sign transaction in wallet
   - Wait for confirmation

5. **Verify Transaction**
   - Check success message
   - Click "View on Basescan" link
   - Verify transaction on Base blockchain

### X402 Payment Protocol Testing

The x402 protocol automatically handles 402 (Payment Required) responses:

1. **API Integration** (commented code example in implementation):
   ```typescript
   // When making API calls that require payment:
   await axiosClient.post('/api/tips', {
     username,
     amount: selectedAmount,
     message,
     txHash: hash,
   });
   ```

2. **Automatic Payment Handling**:
   - If API returns 402 status
   - Interceptor extracts payment requirements
   - Creates payment header using wallet client
   - Retries request with payment
   - Returns successful response

## Integration Points

### Backend API (To be implemented)

For full x402 flow, implement backend endpoints that:

1. **Return 402 for premium features**
   ```typescript
   // Example backend response
   res.status(402).json({
     scheme: "exact",
     network: "base",
     maxAmountRequired: "1000000", // 1 USDC in smallest units
     payTo: "0x...", // Streamer's address
     asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
     // ... other payment requirements
   });
   ```

2. **Verify payments**
   - Check X-PAYMENT header
   - Verify on-chain transaction
   - Return requested content

### Streamer Address Resolution

Current implementation uses sender's address as placeholder. Production implementation should:

1. **Fetch streamer address from database**
   ```typescript
   const response = await fetch(`/api/streamers/${username}`);
   const { address: recipientAddress } = await response.json();
   ```

2. **Cache streamer data**
3. **Handle address not found errors**

## Security Considerations

1. **Wallet Security**
   - User controls private keys
   - Transaction signing happens in wallet
   - No private key exposure to app

2. **Amount Validation**
   - Client-side validation
   - Smart contract enforces amounts
   - USDC decimal precision handled correctly

3. **Transaction Verification**
   - On-chain confirmation required
   - Basescan integration for transparency
   - Transaction hash stored for records

## Production Checklist

- [x] x402-axios installed and configured
- [x] Wagmi with useWalletClient integrated
- [x] USDC on Base integration
- [x] Transaction confirmation handling
- [x] Error handling implemented
- [ ] Backend API with 402 responses
- [ ] Streamer address lookup
- [ ] Transaction history storage
- [ ] Payment verification system
- [ ] Gas estimation and sponsorship
- [ ] Rate limiting and abuse prevention

## Troubleshooting

### Common Issues

1. **"Please connect your wallet first"**
   - Click Connect Wallet button
   - Approve connection in wallet

2. **Transaction fails**
   - Check USDC balance
   - Verify network is Base
   - Check gas fees

3. **Build warnings about MetaMask SDK**
   - These are warnings from dependencies
   - Do not affect functionality
   - Can be safely ignored in development

## Resources

- [x402 Protocol Documentation](https://github.com/coinbase/x402)
- [x402-axios Package](https://www.npmjs.com/package/x402-axios)
- [Wagmi Documentation](https://wagmi.sh)
- [OnchainKit Documentation](https://onchainkit.xyz)
- [Base Network](https://base.org)
- [USDC on Base](https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)

## Next Steps

1. **Implement Backend API**
   - Create endpoints that return 402 responses
   - Add payment verification logic
   - Store transaction records

2. **Add Streamer Management**
   - Database for streamer profiles
   - Address verification system
   - Profile customization

3. **Enhance UX**
   - Add transaction history view
   - Show recent tips
   - Display tip leaderboard

4. **Testing**
   - Unit tests for payment logic
   - Integration tests for full flow
   - E2E tests with testnet

## Support

For issues or questions:
- Check x402 GitHub: https://github.com/coinbase/x402
- Review wagmi docs: https://wagmi.sh
- Check OnchainKit: https://onchainkit.xyz
