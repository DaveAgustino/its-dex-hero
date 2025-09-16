import '../styles/globals.css';
import { useEffect, useState, useMemo } from 'react';
import type { AppProps } from 'next/app';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CloverWalletAdapter,
  // Uncomment the next line if you want to use SolletWalletAdapter and it's available in your package
  // SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { SolongWalletAdapter } from '@solana/wallet-adapter-solong';
import '@solana/wallet-adapter-react-ui/styles.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const pref = typeof window !== 'undefined' ? localStorage.getItem('theme:mode') : null;
    const isDark = pref ? pref === 'dark' : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', !!isDark);
  }, []);

  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL ?? 'https://api.mainnet-beta.solana.com', []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new CloverWalletAdapter(),
      // new SolletWalletAdapter(), // Uncomment if available
      new SolongWalletAdapter(),
    ],
    []
  );
  const { SearchProvider } = require('../context/SearchContext');
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SearchProvider>
            <Component {...pageProps} />
          </SearchProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
