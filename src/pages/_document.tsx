import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary Meta Tags */}
        <meta name="description" content="Pays DEX for free" />
        <meta
          name="keywords"
          content="Solana, DEX, tokens, DeFi, crypto, voting, blockchain, projects"
        />
        <meta name="author" content="DEX Hero Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="DEX Hero - Pays DEX for free" />
        <meta
          property="og:description"
          content="Pays DEX for free for your favorite Solana projects"
        />
        <meta property="og:url" content="https://dexhero.fun/" />
        <meta property="og:image" content="https://dexhero.fun/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DEX Hero - Pays DEX for free" />
        <meta
          name="twitter:description"
          content="Pays DEX for free for your favorite Solana projects"
        />
        <meta name="twitter:image" content="https://dexhero.fun/og-image.png" />
        <meta name="twitter:site" content="@dexherodotfun" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* Apple Touch Icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        {/* Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className="min-h-screen bg-black text-slate-100 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
