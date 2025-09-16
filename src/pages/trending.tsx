import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface LeaderboardToken {
  rank: number;
  name: string;
  ticker: string;
  ca: string;
  marketCap: string;
  marketCapNumeric: number;
  priceChangeM5: number;
  priceChangeH1: number;
  priceChangeH6: number;
  priceChangeH24: number;
  logo: string;
  x?: string;
  website?: string;
  status: string;
}

type TimeFilter = '5m' | '1h' | '6h' | '24h';

// Format market cap to abbreviated format (M, K, B)
const formatMarketCap = (marketCapString: string | number): string => {
  if (!marketCapString || marketCapString === 'N/A' || marketCapString === 'Pump.fun Token') {
    return String(marketCapString);
  }

  const marketCapStr = String(marketCapString);
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

const parseMarketCapToNumber = (marketCapString: string | number): number => {
  if (!marketCapString || marketCapString === 'N/A' || marketCapString === 'Pump.fun Token') {
    return 0;
  }
  const marketCapStr = String(marketCapString);
  const numericString = marketCapStr.replace(/[\$,]/g, '');
  return parseFloat(numericString) || 0;
};

const TrendingPage: React.FC = () => {
  const [tokens, setTokens] = useState<LeaderboardToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rank' | 'marketCap' | 'priceChange'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h');
  const router = useRouter();

  useEffect(() => {
    const fetchLeaderboardData = async () => {
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
              const marketCapNumeric = parseMarketCapToNumber(marketData.marketCap || 0);
              
              return {
                name: token.name,
                ticker: token.ticker,
                ca: token.ca,
                marketCap: formatMarketCap(marketData.marketCap || 'N/A'),
                marketCapNumeric,
                priceChangeM5: marketData.priceChangeM5 || 0,
                priceChangeH1: marketData.priceChangeH1 || 0,
                priceChangeH6: marketData.priceChangeH6 || 0,
                priceChangeH24: marketData.priceChangeH24 || 0,
                logo: token.logo,
                x: token.x,
                website: token.website,
                status: token.status
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching data for ${token.name}:`, error);
            return null;
          }
        });
        
        const tokenDataArray = await Promise.all(tokenPromises);
        const validTokens = tokenDataArray.filter(token => token !== null) as LeaderboardToken[];
        
        // Sort by selected timeframe percentage change (descending) and add ranks
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
          .map((token, index) => ({ ...token, rank: index + 1 }));
        
        setTokens(sortedTokens);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [timeFilter]); // Re-fetch when timeFilter changes

  const handleSort = (column: 'rank' | 'marketCap' | 'priceChange') => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newOrder);

    const sortedTokens = [...tokens].sort((a, b) => {
      let aValue, bValue;
      
      if (column === 'marketCap') {
        aValue = a.marketCapNumeric;
        bValue = b.marketCapNumeric;
      } else if (column === 'priceChange') {
        aValue = timeFilter === '5m' ? a.priceChangeM5 : 
                timeFilter === '1h' ? a.priceChangeH1 :
                timeFilter === '6h' ? a.priceChangeH6 : a.priceChangeH24;
        bValue = timeFilter === '5m' ? b.priceChangeM5 : 
                timeFilter === '1h' ? b.priceChangeH1 :
                timeFilter === '6h' ? b.priceChangeH6 : b.priceChangeH24;
      } else {
        aValue = a.rank;
        bValue = b.rank;
      }

      return newOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setTokens(sortedTokens);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading trending leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🏆 Trending Leaderboard</h1>
            <p className="text-gray-400">Real-time rankings based on performance</p>
            
            {/* Time Filter Buttons */}
            <div className="flex gap-2 mt-4">
              {(['5m', '1h', '6h', '24h'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1.5 text-sm font-bold rounded transition-colors duration-200 ${
                    timeFilter === filter 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {tokens.filter(t => {
                const change = timeFilter === '5m' ? t.priceChangeM5 : 
                              timeFilter === '1h' ? t.priceChangeH1 :
                              timeFilter === '6h' ? t.priceChangeH6 : t.priceChangeH24;
                return change > 0;
              }).length}
            </div>
            <div className="text-gray-400">Tokens Up ({timeFilter})</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">
              {tokens.filter(t => {
                const change = timeFilter === '5m' ? t.priceChangeM5 : 
                              timeFilter === '1h' ? t.priceChangeH1 :
                              timeFilter === '6h' ? t.priceChangeH6 : t.priceChangeH24;
                return change < 0;
              }).length}
            </div>
            <div className="text-gray-400">Tokens Down ({timeFilter})</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{tokens.length}</div>
            <div className="text-gray-400">Total Tokens</div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th 
                    className="text-left p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('rank')}
                  >
                    Rank {sortBy === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-4">Token</th>
                  <th 
                    className="text-left p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('marketCap')}
                  >
                    Market Cap {sortBy === 'marketCap' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort('priceChange')}
                  >
                    {timeFilter.toUpperCase()} Change {sortBy === 'priceChange' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-4">Other Timeframes</th>
                  <th className="text-left p-4">Links</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr key={token.ca} className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        {token.rank <= 3 && (
                          <span className="mr-2">
                            {token.rank === 1 && '🥇'}
                            {token.rank === 2 && '🥈'}
                            {token.rank === 3 && '🥉'}
                          </span>
                        )}
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                          #{token.rank}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <img 
                          src={token.logo} 
                          alt={token.name} 
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo/default.png';
                          }}
                        />
                        <div>
                          <div className="font-semibold">{token.name}</div>
                          <div className="text-gray-400 text-sm">{token.ticker}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono">{token.marketCap}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        (() => {
                          const change = timeFilter === '5m' ? token.priceChangeM5 : 
                                        timeFilter === '1h' ? token.priceChangeH1 :
                                        timeFilter === '6h' ? token.priceChangeH6 : token.priceChangeH24;
                          return change >= 0 ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400';
                        })()
                      }`}>
                        {(() => {
                          const change = timeFilter === '5m' ? token.priceChangeM5 : 
                                        timeFilter === '1h' ? token.priceChangeH1 :
                                        timeFilter === '6h' ? token.priceChangeH6 : token.priceChangeH24;
                          return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                        })()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs space-y-1">
                        {timeFilter !== '24h' && (
                          <div className={`${token.priceChangeH24 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            24h: {token.priceChangeH24 >= 0 ? '+' : ''}{token.priceChangeH24.toFixed(2)}%
                          </div>
                        )}
                        {timeFilter !== '6h' && (
                          <div className={`${token.priceChangeH6 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            6h: {token.priceChangeH6 >= 0 ? '+' : ''}{token.priceChangeH6.toFixed(2)}%
                          </div>
                        )}
                        {timeFilter !== '1h' && (
                          <div className={`${token.priceChangeH1 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            1h: {token.priceChangeH1 >= 0 ? '+' : ''}{token.priceChangeH1.toFixed(2)}%
                          </div>
                        )}
                        {timeFilter !== '5m' && (
                          <div className={`${token.priceChangeM5 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            5m: {token.priceChangeM5 >= 0 ? '+' : ''}{token.priceChangeM5.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {token.x && (
                          <a 
                            href={token.x} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            𝕏
                          </a>
                        )}
                        {token.website && (
                          <a 
                            href={token.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            🌐
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {tokens.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No trending tokens found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;