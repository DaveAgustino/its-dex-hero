import React from 'react';

interface PromotionProps {
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
  marketCap: string;
  holderCount: number;
  marketCapChange?: string;
}

const Promotion: React.FC<PromotionProps> = ({
  logoUrl,
  name,
  ticker,
  contractAddress,
  chain,
  links,
  buyUrl,
  marketCap,
  marketCapChange,
}) => {
  const [copied, setCopied] = React.useState(false);
  
  // Debug logging
  console.log(`🎯 Promotion component received:`, {
    name,
    contractAddress,
    marketCap,
    marketCapType: typeof marketCap
  });
  
  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="mb-4 p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700 flex flex-col items-center">
      <span className="font-semibold text-lg mb-2">Featured Token</span>
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="w-20 h-20 rounded-full border mb-2"
      />
      <h2 className="text-xl font-bold mb-1 text-center">
        {name} <span className="text-gray-500 text-lg">({ticker})</span>
      </h2>
      <div className="flex flex-wrap gap-2 mb-3 justify-center">
        {links.x && (
          <a
            href={links.x}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-1"
          >
            <span>𝕏</span>
            <span>Community</span>
          </a>
        )}
        {links.website && (
          <a
            href={links.website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-1"
          >
            <span>🌐</span>
            <span>Website</span>
          </a>
        )}
        {links.telegram && (
          <a
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors duration-200 flex items-center gap-1"
          >
            <span>📱</span>
            <span>Telegram</span>
          </a>
        )}
      </div>
      <div className="text-sm text-gray-700 dark:text-blue-200 mb-1">
        <button
          type="button"
          className="font-mono break-all cursor-pointer bg-transparent border-none hover:underline focus:outline-none"
          title="Click to copy contract address"
          onClick={handleCopy}
        >
          {contractAddress}
          {copied && (
            <span className="ml-2 text-xs rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20 px-1.5 py-0.5">
              Copied
            </span>
          )}
        </button>
      </div>
      <div className="flex flex-col gap-1 mb-2 text-sm justify-center items-center">
        <div>
          Market Cap: <span className="font-semibold">{marketCap}</span>
        </div>
        {marketCapChange && (
          <div
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              marketCapChange.startsWith("+") ||
              (!marketCapChange.startsWith("-") &&
                !marketCapChange.startsWith("+"))
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {marketCapChange.startsWith("-") ? "📉" : "📈"} {marketCapChange}
          </div>
        )}
      </div>
      <a
        href={buyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex justify-center"
      >
        <button className="bg-blue-400 hover:bg-blue-500 text-blue-900 dark:text-blue-900 px-4 py-2 rounded shadow font-semibold w-full max-w-xs cursor-pointer transition-colors duration-200 hover:scale-105 active:scale-95">
          Buy Now
        </button>
      </a>
    </div>
  );
};

export default Promotion;
