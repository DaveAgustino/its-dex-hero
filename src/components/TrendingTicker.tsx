import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TrendingToken {
  name: string;
  ticker: string;
  ca: string;
  marketCap: string;
  priceChangeM5: number;
  priceChangeH1: number;
  priceChangeH6: number;
  priceChangeH24: number;
  logo: string;
}

type TimeFilter = '5m' | '1h' | '6h' | '24h';

// Format market cap to abbreviated format (M, K, B)
const formatMarketCap = (marketCapString: string | number): string => {
  if (!marketCapString || marketCapString === 'N/A' || marketCapString === 'Pump.fun Token') {
    return String(marketCapString);
  }

  // Convert to string first if it's a number
  const marketCapStr = String(marketCapString);
  
  // Remove $ sign and commas, then parse to number
  const numericString = marketCapStr.replace(/[\$,]/g, '');
  const num = parseFloat(numericString);
  
  if (isNaN(num) || num === 0) return marketCapStr;

  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(1)}B`;
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(1)}M`;
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(1)}K`;
  } else {
    return `$${num.toFixed(0)}`;
  }
};

const TrendingTicker: React.FC = () => {
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        setLoading(true);
        
        // Fetch tokenlist
        const tokenlistResponse = await fetch('/tokenlist.json');
        const tokenlist = await tokenlistResponse.json();
        
        // Fetch market data for each token
        const tokenPromises = tokenlist.map(async (token: any) => {
          try {
            const marketResponse = await fetch(`/api/marketcap?ca=${token.ca}`);
            if (marketResponse.ok) {
              const marketData = await marketResponse.json();
              return {
                name: token.name,
                ticker: token.ticker,
                ca: token.ca,
                marketCap: formatMarketCap(marketData.marketCap || 'N/A'),
                priceChangeM5: marketData.priceChangeM5 || 0,
                priceChangeH1: marketData.priceChangeH1 || 0,
                priceChangeH6: marketData.priceChangeH6 || 0,
                priceChangeH24: marketData.priceChangeH24 || 0,
                logo: token.logo
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching data for ${token.name}:`, error);
            return null;
          }
        });
        
        const tokenDataArray = await Promise.all(tokenPromises);
        const validTokens = tokenDataArray.filter(token => token !== null) as TrendingToken[];
        
        // Sort by selected timeframe percentage change (descending) and take top 10
        const sortedTokens = validTokens
          .sort((a, b) => {
            const aChange = timeFilter === '5m' ? a.priceChangeM5 : 
                           timeFilter === '1h' ? a.priceChangeH1 :
                           timeFilter === '6h' ? a.priceChangeH6 : a.priceChangeH24;
            const bChange = timeFilter === '5m' ? b.priceChangeM5 : 
                           timeFilter === '1h' ? b.priceChangeH1 :
                           timeFilter === '6h' ? b.priceChangeH6 : b.priceChangeH24;
            return bChange - aChange;
          })
          .slice(0, 10);
        
        setTrendingTokens(sortedTokens);
      } catch (error) {
        console.error('Error fetching trending tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTokens();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrendingTokens, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [timeFilter]); // Re-fetch when timeFilter changes

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 overflow-hidden">
        <div className="text-center text-sm font-semibold">
          Loading trending tokens...
        </div>
      </div>
    );
  }

  if (trendingTokens.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 overflow-hidden relative border-b-2 border-blue-300/30">
      {/* Time Filter Buttons - Left side */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 flex gap-1">
        {(['5m', '1h', '6h', '24h'] as TimeFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-2 py-1 text-xs font-bold rounded transition-colors duration-200 ${
              timeFilter === filter 
                ? 'bg-yellow-500 text-black' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      
      {/* Static View Full Leaderboard Button - Right side */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
        <Link 
          href="/trending"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-3 py-1.5 rounded-full text-xs transition-colors duration-200 whitespace-nowrap"
        >
          📊 View Full Leaderboard
        </Link>
      </div>
      
      <div className="absolute inset-0 flex items-center">
        <div className="animate-scroll flex whitespace-nowrap">
          {trendingTokens.map((token, index) => (
            <div key={index} className="relative flex items-center mx-4 sm:mx-6 group">
              <button
                className="flex items-center focus:outline-none"
                title="Click to copy contract address"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onClick={() => {
                  navigator.clipboard.writeText(token.ca);
                  setCopiedIndex(index);
                  setTimeout(() => setCopiedIndex(null), 1200);
                }}
                onMouseLeave={() => setCopiedIndex(null)}
              >
                <span className="text-yellow-300 font-bold mr-1 text-sm sm:text-base">🔥</span>
                <span className="bg-yellow-500/80 text-black font-bold text-xs px-1.5 py-0.5 rounded-full mr-2">
                  #{index + 1}
                </span>
                <img 
                  src={token.logo} 
                  alt={token.name} 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mr-2 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo/default.png';
                  }}
                />
                <span className="font-semibold text-xs sm:text-sm">
                  {token.ticker}
                </span>
                <span className="mx-1 sm:mx-2 text-xs opacity-75 hidden sm:inline">
                  {token.marketCap}
                </span>
                <span 
                  className={`text-xs sm:text-sm font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ml-1 sm:ml-2 ${
                    (() => {
                      const change = timeFilter === '5m' ? token.priceChangeM5 : 
                                    timeFilter === '1h' ? token.priceChangeH1 :
                                    timeFilter === '6h' ? token.priceChangeH6 : token.priceChangeH24;
                      return change >= 0 ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200';
                    })()
                  }`}
                >
                  {(() => {
                    const change = timeFilter === '5m' ? token.priceChangeM5 : 
                                  timeFilter === '1h' ? token.priceChangeH1 :
                                  timeFilter === '6h' ? token.priceChangeH6 : token.priceChangeH24;
                    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                  })()}
                </span>
              </button>
              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/80 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap"
                style={{ minWidth: '80px', textAlign: 'center' }}>
                {copiedIndex === index ? 'CA Copied!' : 'Copy CA'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .animate-scroll {
            animation: scroll 45s linear infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default TrendingTicker;