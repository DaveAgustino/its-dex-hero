import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { SearchProvider } from '../context/SearchContext';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const pref = typeof window !== 'undefined' ? localStorage.getItem('theme:mode') : null;
    const isDark = pref ? pref === 'dark' : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', !!isDark);
  }, []);

  return (
    <SearchProvider>
      <Component {...pageProps} />
    </SearchProvider>
  );
}

export default MyApp;
