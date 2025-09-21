import { Html, Head, Main, NextScript } from "next/document";
import Footer from "../components/Footer";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary Meta Tags */}
        <title>DEX Hero - Pays DEX for free</title>
        <meta name="description" content="Pays DEX for free for your favorite Solana projects" />
        <meta
          name="keywords"
          content="Solana, DEX, tokens, DeFi, crypto, voting, blockchain, projects"
        />
        <meta name="author" content="DEX Hero Team" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="DEX Hero - Pays DEX for free" />
        <meta
          property="og:description"
          content="Pays DEX for free for your favorite Solana projects"
        />
        <meta property="og:url" content="https://dexhero.fun/" />
        <meta property="og:image" content="/images/dexhero-banner.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DEX Hero - Pays DEX for free" />
        <meta
          name="twitter:description"
          content="Pays DEX for free for your favorite Solana projects"
        />
        <meta name="twitter:image" content="/images/dexhero-banner.jpg" />
        <meta name="twitter:site" content="@dexherodotfun" />

        {/* Favicon - Modern + Legacy Support */}
        <link rel="icon" href="/images/dexhero-logo.png" type="image/png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/dexhero-logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Optional: Generate favicon.ico for IE/legacy */}
        {/* <link rel="shortcut icon" href="/favicon.ico" /> */}
      </Head>
      <body className="min-h-screen bg-black text-slate-100 antialiased">
        <Main />
        <NextScript />
        <Footer />
      </body>
    </Html>
  );
}