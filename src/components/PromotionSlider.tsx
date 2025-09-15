
import React, { useEffect, useState } from 'react';
import Promotion from './Promotion';

// Fire Effect Component
const FireEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-10">
      <div className="fire-container">
        <div className="fire fire-1"></div>
        <div className="fire fire-2"></div>
        <div className="fire fire-3"></div>
        <div className="fire fire-4"></div>
        <div className="fire fire-5"></div>
      </div>
      <style jsx>{`
        .fire-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          display: flex;
          justify-content: space-around;
          align-items: flex-start;
        }
        
        .fire {
          width: 8px;
          height: 20px;
          background: linear-gradient(0deg, 
            transparent 0%, 
            #ff4500 20%, 
            #ff6b00 40%, 
            #ff8c00 60%, 
            #ffa500 80%, 
            #ffff00 100%
          );
          border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
          animation: fireFlicker 0.8s ease-in-out infinite alternate;
          opacity: 0.8;
          transform: rotate(180deg);
        }
        
        .fire-1 {
          animation-delay: 0s;
          height: 15px;
        }
        
        .fire-2 {
          animation-delay: 0.2s;
          height: 25px;
        }
        
        .fire-3 {
          animation-delay: 0.4s;
          height: 18px;
        }
        
        .fire-4 {
          animation-delay: 0.6s;
          height: 22px;
        }
        
        .fire-5 {
          animation-delay: 0.1s;
          height: 16px;
        }
        
        @keyframes fireFlicker {
          0% {
            transform: scaleY(1) scaleX(1) rotate(-2deg);
            opacity: 0.8;
          }
          25% {
            transform: scaleY(1.1) scaleX(0.9) rotate(1deg);
            opacity: 0.9;
          }
          50% {
            transform: scaleY(0.9) scaleX(1.1) rotate(-1deg);
            opacity: 0.7;
          }
          75% {
            transform: scaleY(1.05) scaleX(0.95) rotate(2deg);
            opacity: 0.85;
          }
          100% {
            transform: scaleY(0.95) scaleX(1.05) rotate(-1deg);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};

interface PromotionData {
  logoUrl: string;
  name: string;
  ticker: string;
  contractAddress: string;
  chain: string;
  buyUrl: string;
  links: {
    x: string;
    website: string;
    telegram: string;
  };
}

interface OnChainData {
  marketCap: string;
  holderCount: number;
  marketCapChange?: string;
}

const fetchMarketCapData = async (contractAddress: string, chain: string): Promise<OnChainData> => {
  if (chain.toLowerCase() !== 'solana') {
    return { marketCap: 'N/A', holderCount: 0 };
  }
  try {
    const res = await fetch(`/api/marketcap?ca=${encodeURIComponent(contractAddress)}`);
    
    if (!res.ok) {
      console.error(`API failed for ${contractAddress}:`, res.status, res.statusText);
      return { marketCap: 'N/A', holderCount: 0 };
    }
    
    const data = await res.json();
    console.log(`✅ Market cap data for ${contractAddress}:`, data);
    console.log(`📊 Raw data.marketCap:`, data?.marketCap, `(type: ${typeof data?.marketCap})`);
    
    let marketCap: string;
    if (data?.marketCap === 'PUMP.FUN') {
      marketCap = 'Pump.fun Token';
      console.log(`🎯 Using PUMP.FUN fallback`);
    } else if (data?.marketCap && (typeof data.marketCap === 'number' || typeof data.marketCap === 'string')) {
      // Handle both number and string marketCap responses
      if (typeof data.marketCap === 'string' && data.marketCap.startsWith('$')) {
        marketCap = data.marketCap; // Already formatted
        console.log(`💰 Using formatted marketCap: ${marketCap}`);
      } else {
        marketCap = `$${Number(data.marketCap).toLocaleString()}`;
        console.log(`💰 Formatted marketCap: ${marketCap}`);
      }
    } else {
      marketCap = 'N/A';
      console.log(`❌ Fallback to N/A because:`, {
        hasMarketCap: !!data?.marketCap,
        marketCapValue: data?.marketCap,
        marketCapType: typeof data?.marketCap
      });
    }
    
    console.log(`🎉 Final marketCap for ${contractAddress}: "${marketCap}"`);
    
    const holderCount = typeof data?.holderCount === 'number' ? data.holderCount : 0;
    
    // Use percentage change from Dexscreener API
    let marketCapChange = '';
    if (data.priceChangeH24 !== undefined && data.priceChangeH24 !== null) {
      const sign = data.priceChangeH24 >= 0 ? '+' : '';
      marketCapChange = `${sign}${data.priceChangeH24.toFixed(2)}%`;
      console.log(`📈 Using Dexscreener percentage change for ${contractAddress}: ${marketCapChange}`);
    }
    
    return { 
      marketCap, 
      holderCount, 
      marketCapChange
    };
  } catch (error) {
    console.error(`❌ Error fetching market cap for ${contractAddress}:`, error);
    return { marketCap: 'N/A', holderCount: 0 };
  }
};

const PromotionSlider: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionData[]>([]);
  const [onChain, setOnChain] = useState<OnChainData[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchPromotions = () => {
      fetch(`/promotion.json?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => setPromotions(data))
        .catch(() => setPromotions([]));
    };
    
    fetchPromotions();
    
    // Refresh every 30 seconds in development
    const interval = setInterval(fetchPromotions, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (promotions.length === 0) return;
    Promise.all(
      promotions.map((promo) =>
        fetchMarketCapData(promo.contractAddress, promo.chain)
      )
    ).then(setOnChain);
  }, [promotions]);

  useEffect(() => {
    if (promotions.length < 2) return;
    let timer: NodeJS.Timeout;
    const slideTimes = [5000, 4000, 3000, 2000, 1000];

    // Add fire effect when slideTime is 5000 (hot trending)
    if (slideTimes[current] === 5000) {
        document.body.classList.add('fire-effect');
    } else {
        document.body.classList.remove('fire-effect');
    }
    const getSlideTime = (idx: number) => slideTimes[idx] || 4000;

    timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % promotions.length);
    }, getSlideTime(current));

    return () => clearTimeout(timer);
  }, [promotions, current]);

  if (promotions.length === 0 || onChain.length !== promotions.length) return null;

  const currentPromotion = promotions[current];
  const currentOnChain = onChain[current];
  
  console.log('🎯 Rendering promotion:', {
    name: currentPromotion.name,
    contractAddress: currentPromotion.contractAddress,
    marketCap: currentOnChain.marketCap,
    holderCount: currentOnChain.holderCount
  });

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative">
        <FireEffect />
        <Promotion 
          {...currentPromotion} 
          marketCap={currentOnChain.marketCap} 
          holderCount={currentOnChain.holderCount}
          marketCapChange={currentOnChain.marketCapChange}
        />
      </div>
      <div className="flex gap-2 mt-2">
        {promotions.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full border border-blue-400 focus:outline-none ${idx === current ? 'bg-blue-400' : 'bg-blue-200'}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to promotion ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromotionSlider;
