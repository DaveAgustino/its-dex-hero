import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'node:https';

// In-memory cache (server-side only)
const TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { 
  value: number | string; 
  url?: string; 
  holders?: number; 
  source?: string;
  priceChangeM5?: number;
  priceChangeH1?: number;
  priceChangeH6?: number;
  priceChangeH24?: number;
  ts: number; 
}>();

// Helper function to fetch from pump.fun
const fetchPumpFunData = async (contractAddress: string): Promise<{ marketCap: number; url: string } | null> => {
  try {
    console.log(`🚀 Trying pump.fun for: ${contractAddress}`);
    
    // Since pump.fun API is not working reliably, let's try a simple fallback
    // For pump.fun tokens, we'll at least show that it's a pump.fun token
    if (contractAddress.endsWith('pump')) {
      console.log(`✅ Detected pump.fun token: ${contractAddress}`);
      // Return a placeholder market cap for pump.fun tokens
      // This indicates the token exists on pump.fun even if we can't get exact MC
      return {
        marketCap: 0, // Will be handled specially in the response
        url: `https://pump.fun/coin/${contractAddress}`
      };
    }
    
    // Try the API anyway for non-pump tokens
    const pumpUrl = `https://frontend-api.pump.fun/coins/${contractAddress}`;
    let data: any;
    
    if (typeof fetch === 'function') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Shorter timeout
      
      try {
        const response = await fetch(pumpUrl, { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        clearTimeout(timeoutId);
        
        console.log(`📡 Pump.fun response status for ${contractAddress}:`, response.status);
        
        if (!response.ok) {
          console.log(`❌ Pump.fun HTTP error: ${response.status}`);
          return null;
        }
        data = await response.json();
        console.log('📊 Raw pump.fun data:', JSON.stringify(data, null, 2));
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error?.name === 'AbortError') {
          console.log('⏰ Pump.fun request timed out');
        } else {
          console.log('❌ Pump.fun fetch error:', error);
        }
        return null;
      }
    } else {
      // Fallback for Node environments without global fetch
      data = await new Promise((resolve, reject) => {
        https
          .get(pumpUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }, (resp) => {
            if (resp.statusCode && (resp.statusCode < 200 || resp.statusCode >= 300)) {
              reject(new Error(`Pump.fun HTTP ${resp.statusCode}`));
              return;
            }
            const chunks: Buffer[] = [];
            resp.on('data', (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));
            resp.on('end', () => {
              try {
                const text = Buffer.concat(chunks).toString('utf8');
                resolve(JSON.parse(text));
              } catch (e) {
                reject(e);
              }
            });
          })
          .on('error', reject)
          .setTimeout(10000, function () {
            // @ts-ignore - destroy exists on ClientRequest in Node
            this.destroy(new Error('Request timeout'));
          });
      });
    }

    // Parse pump.fun response - try different possible field names
    if (data) {
      console.log('Pump.fun response structure:', Object.keys(data));
      
      // Try various field names that pump.fun might use
      const marketCapValue = 
        data.market_cap || 
        data.marketCap || 
        data.mc || 
        data.fdv || 
        data.usd_market_cap ||
        (data.bonding_curve ? data.bonding_curve.market_cap : null) ||
        (data.token ? data.token.market_cap : null);
      
      if (marketCapValue && typeof marketCapValue === 'number' && Number.isFinite(marketCapValue) && marketCapValue > 0) {
        console.log(`Pump.fun found market cap for ${contractAddress}: $${marketCapValue.toLocaleString()}`);
        return {
          marketCap: marketCapValue,
          url: `https://pump.fun/coin/${contractAddress}`
        };
      } else {
        console.log(`Pump.fun data found but no valid market cap for ${contractAddress}:`, data);
      }
    }

    return null;
  } catch (error) {
    console.log('Pump.fun fetch error:', error);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ca = String(req.query.ca || '').trim();
    if (!ca) {
      res.status(400).json({ error: 'Missing ca' });
      return;
    }

    // Only support Solana contract/mint addresses (base58 32-44 chars)
    const isSolanaCA = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!isSolanaCA.test(ca)) {
      res.status(400).json({ error: 'Only Solana CA supported' });
      return;
    }

    const now = Date.now();
    const cached = cache.get(ca);
    if (cached && now - cached.ts <= TTL_MS) {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
      res.status(200).json({ 
        marketCap: cached.value, 
        url: cached.url, 
        holders: cached.holders, 
        source: cached.source || 'dexscreener',
        priceChangeM5: cached.priceChangeM5,
        priceChangeH1: cached.priceChangeH1,
        priceChangeH6: cached.priceChangeH6,
        priceChangeH24: cached.priceChangeH24,
        cached: true 
      });
      return;
    }

      const rpcBaseUrl = 'https://api.dexscreener.com/latest/dex/tokens/';
      const url = `${rpcBaseUrl}${encodeURIComponent(ca)}`;
    let data: any = null;
    let dexscreenerError: string | null = null;
    
    // Try Dexscreener first
    if (typeof fetch === 'function') {
      try {
        const r = await fetch(url);
        if (r.ok) {
          data = await r.json();
        } else {
          dexscreenerError = `Dexscreener HTTP ${r.status}`;
          console.log(`Dexscreener failed for ${ca}: ${dexscreenerError}`);
        }
      } catch (error: any) {
        dexscreenerError = error?.message || 'Dexscreener fetch failed';
        console.log(`Dexscreener error for ${ca}:`, error);
      }
    } else {
      // Fallback for Node environments without global fetch
      try {
        data = await new Promise((resolve, reject) => {
          https
            .get(url, (resp) => {
              if (resp.statusCode && (resp.statusCode < 200 || resp.statusCode >= 300)) {
                reject(new Error(`Dexscreener HTTP ${resp.statusCode}`));
                return;
              }
              const chunks: Buffer[] = [];
              resp.on('data', (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));
              resp.on('end', () => {
                try {
                  const text = Buffer.concat(chunks).toString('utf8');
                  resolve(JSON.parse(text));
                } catch (e) {
                  reject(e);
                }
              });
            })
            .on('error', reject)
            .setTimeout(10000, function () {
              // @ts-ignore - destroy exists on ClientRequest in Node
              this.destroy(new Error('Request timeout'));
            });
        });
      } catch (err: any) {
        dexscreenerError = err?.message || 'Upstream fetch failed';
        console.log(`Dexscreener error for ${ca}:`, err);
      }
    }
    const pairs: any[] = Array.isArray(data?.pairs) ? data.pairs : [];
    const solPairs = pairs.filter((p: any) => p?.chainId === 'solana');
    
    let best: any = null;
    let source = 'dexscreener';

    // Process Dexscreener data if available
    if (data && solPairs.length > 0) {
      best = solPairs
        .map((p: any) => ({
          marketCap: typeof p.marketCap === 'number' ? p.marketCap : (typeof p.fdv === 'number' ? p.fdv : NaN),
          liquidityUsd: typeof p.liquidity?.usd === 'number' ? p.liquidity.usd : 0,
          holders: typeof p.txns?.h24?.buys === 'number' && typeof p.txns?.h24?.sells === 'number' ? 
            p.txns.h24.buys + p.txns.h24.sells : 0,
          url: typeof p.url === 'string' ? p.url : undefined,
          priceChangeM5: typeof p.priceChange?.m5 === 'number' ? p.priceChange.m5 : undefined,
          priceChangeH1: typeof p.priceChange?.h1 === 'number' ? p.priceChange.h1 : undefined,
          priceChangeH6: typeof p.priceChange?.h6 === 'number' ? p.priceChange.h6 : undefined,
          priceChangeH24: typeof p.priceChange?.h24 === 'number' ? p.priceChange.h24 : undefined,
        }))
        .filter((p: any) => Number.isFinite(p.marketCap))
        .sort((a: any, b: any) => (b.liquidityUsd || 0) - (a.liquidityUsd || 0))[0];
    }

    // If no data from Dexscreener (failed request or no pairs), try pump.fun as fallback
    if (!best || !Number.isFinite(best.marketCap)) {
      const reason = dexscreenerError || 'No Solana pairs found';
      console.log(`${reason} for ${ca}, trying pump.fun...`);
      const pumpData = await fetchPumpFunData(ca);
      if (pumpData) {
        // Handle special case where pump.fun token is detected but no API data
        if (pumpData.marketCap === 0 && ca.endsWith('pump')) {
          best = {
            marketCap: 'PUMP.FUN', // Special indicator
            url: pumpData.url,
            holders: 0,
          };
          source = 'pump.fun';
          console.log(`✅ Detected pump.fun token ${ca} - showing placeholder`);
        } else if (Number.isFinite(pumpData.marketCap) && pumpData.marketCap > 0) {
          best = {
            marketCap: pumpData.marketCap,
            url: pumpData.url,
            holders: 0,
          };
          source = 'pump.fun';
          console.log(`Found pump.fun data for ${ca}: $${pumpData.marketCap.toLocaleString()}`);
        }
      }
    }

    if (!best || (!Number.isFinite(best.marketCap) && best.marketCap !== 'PUMP.FUN')) {
      const errorMsg = dexscreenerError 
        ? `No market cap found. Dexscreener: ${dexscreenerError}. pump.fun: No data available.`
        : 'No market cap found on Dexscreener or pump.fun';
      res.status(404).json({ error: errorMsg });
      return;
    }

    const record = { 
      value: best.marketCap === 'PUMP.FUN' ? 'PUMP.FUN' : best.marketCap as number, 
      url: best.url, 
      holders: best.holders, 
      source, 
      priceChangeM5: best.priceChangeM5,
      priceChangeH1: best.priceChangeH1,
      priceChangeH6: best.priceChangeH6,
      priceChangeH24: best.priceChangeH24,
      ts: now 
    };
    cache.set(ca, record);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
    res.status(200).json({ 
      marketCap: record.value, 
      url: record.url, 
      holders: record.holders, 
      source: record.source,
      priceChangeM5: record.priceChangeM5,
      priceChangeH1: record.priceChangeH1,
      priceChangeH6: record.priceChangeH6,
      priceChangeH24: record.priceChangeH24,
      cached: false 
    });
  } catch (e: any) {
    console.error('API /marketcap error:', e);
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}
