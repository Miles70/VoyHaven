import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { connect, disconnect } from '@wagmi/core';
import { wagmiAdapter, appKit } from '../../src/config/wagmi';
import { LanguageProvider } from '../../src/i18n/LanguageContext';
import CryptoPayment from '../../src/components/CryptoPayment/CryptoPayment';

const config = wagmiAdapter.wagmiConfig;
const native = new URLSearchParams(location.search).get('asset') === 'native';
const initial = {
  id: 'wallet-fixture', paymentMethod: 'crypto', paymentStatus: 'unpaid', total: 1,
  customer: { email: 'fixture@example.com' },
  payment: {
    chainId: 56, network: 'BNB Smart Chain', token: native ? 'BNB' : 'USDT',
    assetType: native ? 'native' : 'erc20', tokenDecimals: 18, expectedAmount: '1',
    tokenAddress: `0x${'33'.repeat(20)}`, recipientAddress: `0x${'22'.repeat(20)}`,
  },
};
globalThis.walletFixture = {
  async connect() {
    await appKit.close();
    const connector = config.connectors.find(item => item.type === 'injected');
    if (!connector) throw new Error('Injected connector unavailable');
    await connect(config, { connector });
  },
  disconnect: () => disconnect(config),
  verified: [],
};
function Fixture() {
  const [booking, setBooking] = useState(initial);
  return <CryptoPayment booking={booking} onBookingUpdated={setBooking} verifyPaymentRequest={async (id, input) => {
    globalThis.walletFixture.verified.push({ id, ...input });
    return { ...booking, paymentStatus: 'paid', payment: { ...booking.payment, transactionHash: input.transactionHash } };
  }} />;
}
createRoot(document.getElementById('root')).render(
  <WagmiProvider config={config}><QueryClientProvider client={new QueryClient()}><LanguageProvider initialLanguage="en"><Fixture /></LanguageProvider></QueryClientProvider></WagmiProvider>,
);
