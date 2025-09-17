import React, { useEffect, useState } from "react";
import { PublicKey, Connection } from "@solana/web3.js";
import { OnlinePumpSdk } from "@pump-fun/pump-sdk";

interface CreatorRewardsProps {
  walletAddress: string;
  rpcUrl?: string;
}

const DEFAULT_RPC = process.env.NEXT_PUBLIC_RPC_URL || "";

const CreatorRewards: React.FC<CreatorRewardsProps> = ({
  walletAddress,
  rpcUrl = DEFAULT_RPC,
}) => {
  const [rewards, setRewards] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchRewards = async () => {
      setLoading(true);
      setError(null);
      try {
        const connection = new Connection(rpcUrl, "confirmed");
        const sdk = new OnlinePumpSdk(connection);
        const creatorPubkey = new PublicKey(walletAddress);
        const balanceBN = await sdk.getCreatorVaultBalanceBothPrograms(
          creatorPubkey
        );
        setRewards((Number(balanceBN.toString()) / 1e9).toFixed(4));
      } catch (e: any) {
        setError(e.message || "Failed to fetch rewards");
      } finally {
        setLoading(false);
      }
    };
    if (walletAddress) {
      fetchRewards();
    }
  }, [walletAddress, rpcUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200 border border-green-300 dark:border-green-700 flex flex-col items-center">
      <span className="font-semibold text-lg mb-1">Creator Rewards</span>
      <button
        type="button"
        onClick={handleCopy}
        className="break-all font-mono text-base bg-transparent border-none cursor-pointer text-green-900 dark:text-green-200 hover:underline focus:outline-none"
        title="Click to copy wallet address"
        aria-label={`Copy creator wallet address ${walletAddress}`}
      >
        {walletAddress}
        {copied && (
          <span className="ml-2 text-xs rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20 px-1.5 py-0.5">
            Copied
          </span>
        )}
      </button>
      {loading ? (
        <span className="mt-2 text-green-700 dark:text-green-300">
          Loading rewards...
        </span>
      ) : error ? (
        <span className="mt-2 text-red-500">Error: {error}</span>
      ) : (
        <span className="mt-2 text-green-700 dark:text-green-300 font-semibold">
          Total Rewards: {rewards} SOL
        </span>
      )}
      <span className="text-xs mt-1 text-green-700 dark:text-green-300">
        Creator rewards earned from{" "}
        <a
          href="https://pump.fun/profile/DExBGQiUGHNZeyBoQ2WmWPFqvqM524fN6j1mC3E7hEro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs mt-1 text-green-700 dark:text-green-300 underline hover:text-green-900 dark:hover:text-green-100"
        >
          Pump.fun
        </a>
      </span>
    </div>
  );
};

export default CreatorRewards;
