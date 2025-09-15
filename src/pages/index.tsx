import React, { useEffect, useMemo, useState } from "react";
import DonationAddress from "../components/DonationAddress";
import CreatorRewards from "../components/CreatorRewards";
import Promotion from "../components/Promotion";
import PromotionSlider from "../components/PromotionSlider";
import TrendingTicker from "../components/TrendingTicker";
import { useSearch } from "../context/SearchContext";

interface TokenData {
  name: string;
  ticker: string;
  ca: string;
  mc: string;
  x: string;
  website: string;
  logo: string;
  banner: string;
  status: string;
  receipt: string;
  donationAddress?: string;
  walletAddress?: string;
  holderCount?: number;
  platformUrl?: string;
}

const DATA_URL = "/tokenlist.json";

// Simple in-memory cache for MC values to avoid duplicate requests per session
const mcCache = new Map<string, { value: number; url?: string; ts: number }>();

// LocalStorage helpers with TTL to persist MC across reloads
const MC_TTL_MS = 10 * 60 * 1000; // 10 minutes
const lsGet = (
  key: string
): { value: number; url?: string; ts: number } | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v: number; u?: string; t: number };
    const record = { value: parsed.v, url: parsed.u, ts: parsed.t };
    if (Date.now() - record.ts > MC_TTL_MS) return null;
    return record;
  } catch {
    return null;
  }
};

const lsSet = (
  key: string,
  record: { value: number; url?: string; ts: number }
) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ v: record.value, u: record.url, t: record.ts })
    );
  } catch {
    // ignore quota errors
  }
};

const formatUSDCompact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const formatUSDExact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "standard",
    maximumFractionDigits: 2,
  }).format(n);

const Home: React.FC = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { query, setQuery } = useSearch();

  useEffect(() => {
    const fetchTokens = () => {
      fetch(`${DATA_URL}?t=${Date.now()}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch data");
          return res.json();
        })
        .then((data: TokenData[]) => {
          setTokens(data);
          setLoading(false);
          // Increment refresh counter to trigger market cap updates
          setRefreshCounter(prev => prev + 1);
        })
        .catch((err) => {
          setError(err.message || "Failed to load data");
          setLoading(false);
        });
    };
    
    fetchTokens();
    
    // Refresh every 30 seconds in development
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, []);

  // Separate interval for market cap updates every 5 minutes
  useEffect(() => {
    const mcRefreshInterval = setInterval(() => {
      setRefreshCounter(prev => prev + 1);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(mcRefreshInterval);
  }, []);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return tokens;
    const parts = q.split(/\s+/);
    return tokens.filter((t) => {
      const hay = [t.name, t.ticker, t.ca, t.status, t.website, t.x]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return parts.every((part) => hay.includes(part));
    });
  }, [tokens, query]);

  // Get donation and wallet address from first token (customize as needed)
  const donationAddress = tokens[0]?.donationAddress || "";
  const walletAddress = "DExBGQiUGHNZeyBoQ2WmWPFqvqM524fN6j1mC3E7hEro"; // Replace with actual wallet address

  return (
    <div>
      {/* Top 10 Trending Tokens Ticker */}
      <TrendingTicker />
      
      <div className="responsive-container mx-auto px-4 py-8">
        {/* PromotionSlider above PAID BY DEXHERO */}
        <PromotionSlider />
      <div className="flex justify-center my-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
          PAID BY DEXHERO
        </h1>
      </div>
      {loading ? (
        <p className="text-slate-300">Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-sm">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tokens, tickers, CA..."
                aria-label="Search tokens"
                className="w-full rounded-md bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 focus:ring-2 focus:ring-emerald-400/40 outline-none pl-8 pr-8 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-900/5 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10 text-slate-600 dark:text-slate-300">
              {filtered.length}
              <span className="hidden sm:inline">
                {" "}
                result{filtered.length === 1 ? "" : "s"}
              </span>
            </span>
          </div>
          <div className="table-wrapper rounded-lg ring-1 ring-black/10 dark:ring-white/10 shadow-lg backdrop-blur bg-white/70 dark:bg-white/5">
            <table className="responsive-table text-sm">
              <thead className="bg-slate-100/70 dark:bg-slate-700/50">
                <tr>
                  <th className="font-semibold">NAME</th>
                  <th className="font-semibold">TICKER</th>
                  <th className="font-semibold">CA</th>
                  <th className="font-semibold">MC</th>
                  <th className="font-semibold">X</th>
                  <th className="font-semibold">WEBSITE</th>
                  <th className="font-semibold">LOGO</th>
                  <th className="font-semibold">BANNER</th>
                  <th className="font-semibold">STATUS</th>
                  <th className="font-semibold">RECEIPT</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-400 py-6">
                      No matching results
                    </td>
                  </tr>
                ) : (
                  filtered.map((token, idx) => (
                    <tr
                      key={idx}
                      className="odd:bg-white/0 even:bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                    >
                      <td className="font-medium">{token.name}</td>
                      <td className="text-slate-300">{token.ticker}</td>
                      <td className="cell-ellipsis ca-cell" title={token.ca}>
                        <CopyableCA ca={token.ca} />
                      </td>
                      <td className="text-slate-300" title={token.mc}>
                        <MarketCapCell ca={token.ca} defaultMc={token.mc} refreshCounter={refreshCounter} />
                      </td>
                      <td>
                        <a
                          href={token.x}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-700/50 hover:bg-slate-600/60 transition-colors"
                        >
                          <img
                            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg"
                            alt="X"
                            style={{ width: 20, height: 20 }}
                          />
                        </a>
                      </td>
                      <td>
                        <a
                          href={token.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-700/50 hover:bg-slate-600/60 transition-colors"
                        >
                          <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          width={20}
                          height={20}
                          aria-hidden="true"
                          >
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" strokeWidth="2" fill="none"/>
                          </svg>
                        </a>
                      </td>
                      <td className="cell-fit">
                        <img
                          src={token.logo}
                          alt="logo"
                          className="table-logo"
                        />
                      </td>
                      <td className="cell-fit">
                        <img
                          src={token.banner}
                          alt="banner"
                          className="table-banner"
                        />
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
                          {token.status}
                        </span>
                      </td>
                      <td>
                        {token.receipt ? (
                          <a
                            href={token.receipt}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
                          >
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <br />
          <div className="my-4">
            <CreatorRewards walletAddress={walletAddress} />
          </div>
          <DonationAddress address="DExBGQiUGHNZeyBoQ2WmWPFqvqM524fN6j1mC3E7hEro" />
        </>
      )}
      </div>
    </div>
  );
};

/**
 * Renders a copyable Contract Address with truncation and feedback.
 */
const CopyableCA: React.FC<{ ca: string }> = ({ ca }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ca);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore; clipboard might be blocked
    }
  };

  const shortXS = `${ca.slice(0, 4)}..${ca.slice(-4)}`;
  const shortSM = `${ca.slice(0, 4)}..${ca.slice(-4)}`;
  const shortMD = `${ca.slice(0, 4)}..${ca.slice(-4)}`;
  const shortLG = `${ca.slice(0, 4)}..${ca.slice(-4)}`;

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex items-center gap-1.5 max-w-full truncate text-left text-sky-300 hover:text-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 rounded px-1"
      title="Click to copy CA"
      aria-label={`Copy CA ${ca}`}
    >
      {/* Show more of the CA as screen size increases */}
      <span className="truncate sm:hidden">{shortXS}</span>
      <span className="truncate hidden sm:inline md:hidden">{shortSM}</span>
      <span className="truncate hidden md:inline lg:hidden">{shortMD}</span>
      <span className="truncate hidden lg:inline">{shortLG}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4 opacity-70 group-hover:opacity-100"
        aria-hidden="true"
      >
        <path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" />
      </svg>
      {copied && (
        <span className="ml-2 text-xs rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20 px-1.5 py-0.5">
          Copied
        </span>
      )}
    </button>
  );
};

/**
 * Displays market cap from Dexscreener using CA; falls back to defaultMc.
 */
const MarketCapCell: React.FC<{ ca: string; defaultMc: string; refreshCounter?: number }> = ({
  ca,
  defaultMc,
  refreshCounter = 0,
}) => {
  const [value, setValue] = useState<number | null>(null);
  const [pairUrl, setPairUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [unsupported, setUnsupported] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const caKey = (ca || "").trim();
    if (!caKey) {
      setLoading(false);
      return;
    }

    const cacheKey = `mc:${caKey}`;

    // Only support Solana addresses (base58, 32-44 chars)
    const isSolanaCA = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(caKey);
    if (!isSolanaCA) {
      setUnsupported(true);
      setLoading(false);
      return;
    }

    // If refreshCounter changes, clear the cache to force fresh data
    if (refreshCounter > 0) {
      mcCache.delete(caKey);
      // Also clear localStorage cache
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(cacheKey);
        } catch {
          // ignore errors
        }
      }
    }

    // 1) Check in-memory cache first
    const mem = mcCache.get(caKey);
    if (mem && Date.now() - mem.ts <= MC_TTL_MS) {
      setValue(mem.value);
      setPairUrl(mem.url);
      setLoading(false);
      return;
    }

    // 2) Check localStorage cache
    const persisted = lsGet(cacheKey);
    if (persisted) {
      mcCache.set(caKey, persisted);
      setValue(persisted.value);
      setPairUrl(persisted.url);
      setLoading(false);
      return;
    }

    // 3) Fetch from our API (server-side caches + hides provider)
    const fetchFromApi = async () => {
      try {
        const res = await fetch(
          `/api/marketcap?ca=${encodeURIComponent(caKey)}`
        );
        if (res.status === 404) {
          if (!cancelled) setValue(null);
          if (!cancelled) setPairUrl(undefined);
          if (!cancelled) setLoading(false);
          return;
        }
        if (!res.ok) throw new Error(`API HTTP ${res.status}`);
        const json = (await res.json()) as { marketCap?: number; url?: string };
        if (
          !json ||
          typeof json.marketCap !== "number" ||
          !Number.isFinite(json.marketCap)
        ) {
          throw new Error("No market cap");
        }
        const rec = { value: json.marketCap, url: json.url, ts: Date.now() };
        mcCache.set(caKey, rec);
        lsSet(cacheKey, rec);
        if (!cancelled) {
          setValue(rec.value);
          setPairUrl(rec.url);
        }
      } catch (e) {
        // swallow errors; fallback to defaultMc
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFromApi();
    return () => {
      cancelled = true;
    };
  }, [ca, refreshCounter]); // Added refreshCounter as dependency

  if (unsupported) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/20">
        Unsupported chain
      </span>
    );
  }

  // If live value is available, show compact with title for exact
  if (value != null && Number.isFinite(value)) {
    const compact = formatUSDCompact(value);
    const exact = formatUSDExact(value);
    const content = (
      <span title={`Exact: ${exact}\nSource: Dexscreener`}>{compact}</span>
    );
    return pairUrl ? (
      <a
        href={pairUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
      >
        {content}
      </a>
    ) : (
      content
    );
  }

  // If API returned 404 (not found)
  if (!loading && value === null) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-500/15 text-red-400 ring-1 ring-red-400/20">
        N/A
      </span>
    );
  }

  // While loading, show defaultMc subtly; once resolved, it will update
  return (
    <span className={loading ? "text-slate-400" : ""}>{defaultMc || "—"}</span>
  );
};

export default Home;
